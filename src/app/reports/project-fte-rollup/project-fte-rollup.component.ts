import { Component, OnInit, AfterViewInit, HostListener, ViewChild, ElementRef } from '@angular/core';
import { FilterPipe } from '../../_shared/pipes/filter.pipe';
import { ClickTrackingService } from '../../_shared/services/click-tracking.service';
import { ProjectFteRollupChartService } from './services/project-fte-rollup-chart.service';
import { ProjectFteRollupDataService } from './services/project-fte-rollup-data.service';
import { ProjectFteRollupPrepDataService } from './services/project-fte-rollup-prep-data.service';
import { ProjectFteRollupTableService } from './services/project-fte-rollup-table.service';
import { ProjectFteRollupTypeaheadService } from './services/project-fte-rollup-typeahead.service';


declare var $: any;
import * as Highcharts from 'highcharts';


@Component({
  selector: 'app-project-fte-rollup',
  templateUrl: './project-fte-rollup.component.html',
  styleUrls: ['./project-fte-rollup.component.css', '../../_shared/styles/common.css'],
  providers: [FilterPipe, ProjectFteRollupChartService, ProjectFteRollupDataService, ProjectFteRollupPrepDataService,
    ProjectFteRollupTableService, ProjectFteRollupTypeaheadService]
})
export class ProjectFteRollupComponent implements OnInit, AfterViewInit {

  @ViewChild('filterStringVC') filterStringVC: ElementRef;
  @ViewChild('hiddenInput') hiddenInput: ElementRef;


  projectsList: any;
  filteredProjects: any;
  bomData: any;
  chart: any;
  chartOptions: any;
  chartData: any;
  hasChartData: boolean;
  chartTitle: string;
  chartSubTitle: string;
  tableData: any = [];
  displayTable: boolean;
  drillLevel: number;
  drillHistory: any = [];
  drillDownIDs: any = [];
  drillDownTitles: any = [];
  maxFTE: number;
  barMultiplier: number;
  filterString: string;

  // set hostlistenr to fire on window resize, so that the cumulative fte bars in the table can be resized
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.resizeChart();
  }


  constructor(
    private clickTrackingService: ClickTrackingService,
    private projectFteRollupChartService: ProjectFteRollupChartService,
    private projectFteRollupDataService: ProjectFteRollupDataService,
    private projectFteRollupPrepDataService: ProjectFteRollupPrepDataService,
    private projectFteRollupTableService: ProjectFteRollupTableService,
    private projectFteRollupTypeaheadService: ProjectFteRollupTypeaheadService
  ) {

  }

  async ngOnInit() {

    // get data to populate the project selection typeahead
    await this.getTypeaheadData();

    // initialize the typeahead functionality with the typeahead.js library (options and data source)
    this.initTypeahead();

    // initialize the treemap drill up function to execute on drill up click
    this.setChartDrillUpExtension();

  }

  ngAfterViewInit() {

    // update the z-index of the typeahead js dropdown container so that it will not be above the topnav
    this.updateTypeaheadDropdownZindex();

  }

  // get data to populate the projects typeahead
  async getTypeaheadData() {

    this.projectsList = await this.projectFteRollupDataService.getTypeaheadData()
    .catch(err => {
      // console.log(err);
    });

  }

  // initialize the typeahead functionality with the typeahead.js library (options and data source)
  initTypeahead() {
    const typeahead = this.projectFteRollupTypeaheadService.initTypeahead(this, this.projectsList);
    // set focus on the input box
    this.filterStringVC.nativeElement.focus();
  }

  // initialize the treemap drill up function to execute on drill up click
  setChartDrillUpExtension() {
    this.projectFteRollupChartService.setDrillUpFunction(this);
  }

  // workaround to update the z-index of the typeahead js dropdown container so that it will not be above the topnav (10)
  // TO-DO BILL: ask Brian why his works without having to update like this in BOM Viewer and not updating in css
  updateTypeaheadDropdownZindex() {

    setTimeout(() => {
      $('div.tt-menu').css('z-index', 5);
    }, 0);

  }

  // on window resize
  resizeChart() {

    // reflow the chart to its outer container
    if (this.chart) {
      this.chart.reflow();
    }

    // set the multiplier to apply to the chart cum. ftes colored bar, to fill the width
    this.setBarMultiplier();

  }

  // set the multiplier to apply to the chart cum. ftes colored bar, to fill the width
  setBarMultiplier() {

    this.barMultiplier = this.projectFteRollupTableService.calculateBarMultipler($('th.col-spark-bar'), this.maxFTE);

  }


  // clear the chart if the input is fully cleared with the backspace or delete keys
  onInputKeyUp(value, key) {

    if (!value && (key === 'Backspace' || key === 'Delete')) {
      this.projectFteRollupChartService.clearChart(this);
    }
  }


  // on project selection from typeahead list, render the treemap chart and display table below if there is data
  async displayChart(project: any) {

    // console.log('selected project object:');
    // console.log(project);

    // log a record in the click tracking table
    this.logClick(project);

    // get raw data from the database in the form of a bom with fte values
    // will include parts and require significant processing to get it into the proper format for highcharts drillable treemap
    this.bomData = await this.getBOMData(project);

    // console.log('BOM Data (raw data from stored procedure:');
    // console.log(this.bomData);

    // if there is only one project at level zero with no ftes, there will be no chart to render so just display an empty chart
    if (!this.bomData) {
      this.displayEmptyChart(project);
      return;
    }
    if (this.bomData.length === 1 && !this.bomData[0].TotalFTE) {
      this.displayEmptyChart(project);
      return;
    }

    // otherwise, modify the bom data into chart data for the highcharts drillable treemap
    this.chartData = this.projectFteRollupPrepDataService.buildChartData(this.bomData);

    // console.log('final chartData array from the prep data service:');
    // console.log(this.chartData);

    // if there is no chart data, there will be no chart to render so just display an empty chart
    if (!this.chartData.length) {
      this.displayEmptyChart(project);
      return;
    }

    // get the max fte value from the chart data, to use to calculate/re-calculate the bar multiplier
    this.maxFTE = this.projectFteRollupPrepDataService.getMaxFTE(this.chartData);

    // add the 'bulletColor' property to the chartData objects to display the colors in the table
    // (bullet and bar) which should align with the colors in the treemap chart
    this.projectFteRollupTableService.setTableColors(this.chartData);

    // get the initial table data to display (single row - the first level project)
    this.tableData = this.projectFteRollupTableService.getInitialTableData(this.chartData);

    // set the chart title and chart sub-title
    this.setChartTitle(project);

    // set the chart options
    this.setChartOptions();

    // render the chart
    this.renderChart();

    // show the table
    this.displayTable = true;

    // set the multiplier to apply to the chart cum. ftes colored bar, to fill the width
    // NOTE: this needs to be done after display table is set to true with the setTimeout since it uses jQuery to measure the column width
    setTimeout(() => {
      this.setBarMultiplier();
    }, 0);

  }


  // get a list of all the projects (index) from the database for the dropdown/typeahead input control
  async getBOMData(project: any) {

    return await this.projectFteRollupDataService.getBOMData(project.ProjectID)
    .catch(err => {
      // console.log(err);
    });

  }


  logClick(project: any) {

    // log a record in the click tracking table
    this.clickTrackingService.logClickWithEvent(`page: Project FTE Rollup, text: ${project.ProjectName}`);

  }


  displayEmptyChart(project: any) {

    // set the chart data to undefined so that the treemap will not render
    // the no-data-to-display.js module will instead display text 'No data to display'
    this.chartData = undefined;

    // set the title and subtitle
    this.chartTitle = `Project FTE Rollup for ${project.ProjectName} (${project.ProjectTypeName})`;
    this.chartSubTitle = undefined;

    // set the chart options
    this.setChartOptions();

    // render the chart
    this.renderChart();

    // hide the table
    this.displayTable = false;

  }


  setChartTitle(project: any) {

    this.chartTitle = `Project FTE Rollup for ${project.ProjectName} (${project.ProjectTypeName})`;

    if (this.chartData.length) {

      this.chartSubTitle = `Click a box to drill down (if pointing hand cursor);
        click the grey box in the upper right corner to drill up`;

    }

  }


  setChartOptions() {

    this.chartOptions = this.projectFteRollupChartService.getChartOptions(this.chartData, this);

  }


  renderChart() {

    // render the chart
    this.chart = Highcharts.chart('rollupChart', this.chartOptions);

    // reflow the chart so it fits within it's outer container
    setTimeout(() => {
      this.chart.reflow();
    }, 0);

  }


  // on clicking the 'x' icon at the right of the search/filter input
  onClearSearchClick() {

    // clear the filter string
    this.filterString = undefined;

    $('.projects-filter-input').typeahead('val', '');

    // reset the focus on the filter input
    this.filterStringVC.nativeElement.focus();

    this.projectFteRollupChartService.clearChart(this);

  }


}
