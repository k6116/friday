import { Component, OnInit, AfterViewInit, HostListener, ViewChild, ElementRef } from '@angular/core';
import { FilterPipe } from '../../_shared/pipes/filter.pipe';
import { ProjectFteRollupChartService } from './services/project-fte-rollup-chart.service';
import { ProjectFteRollupDataService } from './services/project-fte-rollup-data.service';
import { ProjectFteRollupPrepDataService } from './services/project-fte-rollup-prep-data.service';
import { ProjectFteRollupTableService } from './services/project-fte-rollup-table.service';
import { ProjectFteRollupTypeaheadService } from './services/project-fte-rollup-typeahead.service';


declare var require: any;
declare var $: any;
import * as moment from 'moment';
import * as _ from 'lodash';
import * as Highcharts from 'highcharts';
require('highcharts/modules/drilldown.js')(Highcharts);
require('highcharts/modules/heatmap.js')(Highcharts);
require('highcharts/modules/treemap.js')(Highcharts);
require('highcharts/modules/data.js')(Highcharts);
require('highcharts/modules/no-data-to-display.js')(Highcharts);
require('highcharts/highcharts-more.js')(Highcharts);


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

  chartOptions: any;
  chart: any;
  hasChartData: boolean;
  bomData: any;
  chartData: any;
  drillLevel: number;
  drillHistory: any = [];
  drillDownIDs: any = [];
  drillDownTitles: any = [];
  tableData: any = [];
  displayTable: boolean;
  maxFTE: number;
  barMultiplier: number;
  filterString: string;
  projectsList: any;
  filteredProjects: any;
  chartTitle: string;
  chartSubTitle: string;
  chartWasRendered: boolean;


  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.resizeChart();
  }


  constructor(
    private projectFteRollupChartService: ProjectFteRollupChartService,
    private projectFteRollupDataService: ProjectFteRollupDataService,
    private projectFteRollupPrepDataService: ProjectFteRollupPrepDataService,
    private projectFteRollupTableService: ProjectFteRollupTableService,
    private projectFteRollupTypeaheadService: ProjectFteRollupTypeaheadService
  ) {

    this.drillLevel = 0;

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
      console.log(err);
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


  // on project selection from typeahead list, render the treemap chart and display table below if there is data
  async displayChart(project: any) {

    // get raw data from the database in the form of a bom with fte values
    // will include parts and require significant processing to get it into the proper format for highcharts drillable treemap
    this.bomData = await this.getBOMData(project);

    // console.log('BOM Data (raw data from stored procedure:');
    // console.log(this.bomData);

    // if there is only one project at level zero with no ftes, there will be no chart to render so just display an empty chart
    if (this.bomData.length === 1 && !this.bomData[0].TotalFTE) {
      this.displayEmptyChart(project);
      return;
    }

    // otherwise, modify the bom data into chart data for the highcharts drillable treemap
    this.chartData = this.projectFteRollupPrepDataService.buildChartData(this.bomData);

    console.log('returned chartData array from the prep data service:');
    console.log(this.chartData);

    // get the max fte value from the chart data, to use to calculate/re-calculate the bar multiplier
    this.maxFTE = this.projectFteRollupPrepDataService.getMaxFTE(this.chartData);

    // add the 'bulletColor' property to the chartData objects to display the colors in the table
    // (bullet and bar) which should align with the colors in the treemap chart
    this.projectFteRollupTableService.setTableColors(this.chartData);

    // get the initial table data to display (single row - the first level project)
    this.tableData = this.projectFteRollupTableService.getInitialTableData(this.chartData);

    // set the chart title and chart sub-title
    this.setChartTitle(project);

    // if there is no chart data, clear the chart and stop here
    if (!this.chartData.length) {
      this.clearChart();
      return;
    }

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
      console.log(err);
    });

  }


  displayEmptyChart(project: any) {

    // set the chart data to undefined so that the treemap will not render
    // the no-data-to-display.js module will instead display text 'No data to display'
    this.chartData = undefined;

    // set the title and subtitle
    this.chartTitle = `Project FTE Rollup for ${project.ProjectName} ${project.ProjectTypeName}`;
    this.chartSubTitle = undefined;

    // set the chart options
    this.setChartOptions();

    // render the chart
    this.renderChart();

    // hide the table
    this.displayTable = false;

  }


  setChartTitle(project: any) {

    this.chartTitle = `Project FTE Rollup for ${project.ProjectName} ${project.ProjectTypeName}`;

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



  pushChildItemsIntoTable(parentID) {

    console.log('existing table data:');
    console.log(`looking for data.id: ${parentID}`);
    console.log(this.tableData);

    // find the position/index of the parentID in the table
    // so that the child items can be spliced in, in the proper location
    let tableRow = 0;
    this.tableData.forEach((data, index) => {
      console.log(`data.id: ${data.id.toString()}; parentID: ${parentID.toString()}`);
      if (data.id.toString() === parentID.toString()) {
        tableRow = index + 1;
        console.log(`found match at row: ${tableRow}`);
      }
    });

    console.log('row of clicked item in table:');
    console.log(tableRow);

    // remove all existing highlighted rows
    // this.removeAllRowHighlights();

    const childItems = this.chartData.filter(data => {
      return data.parent === parentID;
    });

    // childItems.forEach(item => {
    //   item.highlight = true;
    // });

    console.log('child items:');
    console.log(childItems);

    // add the child items to the table, below the parent item
    if (childItems.length) {
      // this.tableData.push(childItems[0]);
      this.tableData.splice(tableRow, 0, ...childItems);
      // a1.splice(2, 0, ...a2);
    }

    console.log('new table data:');
    console.log(this.tableData);

  }


  pushChildIDsIntoHistory(parentID) {

    // filter to get child items
    const childItems = this.chartData.filter(data => {
      return data.parent === parentID;
    });

    const idArray: number[] = [];
    childItems.forEach(item => {
      idArray.push(item.id);
    });
    console.log('ids array:');
    console.log(idArray);

    this.drillDownIDs.push(idArray);

    console.log('drill down ids array:');
    console.log(this.drillDownIDs);

  }


  removeChildItemsFromTable() {

    // get the last array of drill down ids
    const tableIds = this.drillDownIDs[this.drillDownIDs.length - 1];

    console.log('table ids to remove from table:');
    console.log(tableIds);

    // loop through the table data in reverse order
    if (tableIds) {
      for (let i = this.tableData.length - 1; i >= 0; i--) {
        if (tableIds.includes(this.tableData[i].id)) {
          console.log(`found table id to remove at index: ${i}`);
          this.tableData.splice(i, 1);
        }
      }
    }

    // remove the last table ids array
    if (this.drillDownIDs.length) {
      this.drillDownIDs.pop();
    }

    console.log('new table data with removed children:');
    console.log(this.tableData);

  }


  pushTitlesIntoHistory(title) {

    this.drillDownTitles.push(title);

    console.log('titles array after push:');
    console.log(this.drillDownTitles);

  }

  removeTitlesFromHistory() {

    // remove the last title from the array
    this.drillDownTitles.pop();

    console.log('titles array after pop:');
    console.log(this.drillDownTitles);

  }


  highlightDisplayedItems(parentID, level?) {

    // remove all existing highlighted rows
    this.removeAllRowHighlights();

    if (this.chartData) {
      const childItems = this.chartData.filter(data => {
        if (level) {
          return data.level === level;
        } else {
          return data.parent === parentID;
        }
      });

      childItems.forEach(item => {
        item.highlight = true;
      });

    }

  }


  removeAllRowHighlights() {

    this.tableData.forEach(row => {
      row.highlight = false;
    });


  }


  checkClickedItemIsInChart(id: number, tableData: any): boolean {
    let returnVal: boolean;
    tableData.forEach(data => {
      if (data.id.toString() === id.toString() && data.highlight) {
        returnVal = true;
      }
    });
    return returnVal ? returnVal : false;
  }


  // on clicking the 'x' icon at the right of the search/filter input
  onClearSearchClick() {

    // clear the filter string
    this.filterString = undefined;

    $('.projects-filter-input').typeahead('val', '');

    // reset the focus on the filter input
    this.filterStringVC.nativeElement.focus();

    this.clearChart();

  }


  clearChartData() {

    this.chartData = undefined;
    this.tableData.splice(0, this.tableData.length);

    this.drillLevel = 0;
    this.drillHistory.splice(0, this.drillHistory.length);
    this.drillDownIDs.splice(0, this.drillDownIDs.length);
    this.drillDownTitles.splice(0, this.drillDownTitles.length);

    this.barMultiplier = undefined;

    this.hasChartData = false;
    this.displayTable = false;

  }


  // when the 'x' button is clicked or input is cleared (typeahead selection returns no object)
  clearChart() {

    this.clearChartData();

    this.chartTitle = 'Project FTE Rollup';
    this.chartSubTitle = '';

    this.setChartOptions();

    this.renderChart();

  }

}
