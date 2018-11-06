import { Component, OnInit, AfterViewInit, HostListener, ViewChild, ElementRef } from '@angular/core';
import { ApiDataReportService, ApiDataProjectService } from '../../_shared/services/api-data/_index';
import { ToolsService } from '../../_shared/services/tools.service';
import { CacheService } from '../../_shared/services/cache.service';
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

  data: any;
  chartOptions: any;
  chart: any;
  fteData: any;
  levelOneData: any;
  childProjects: any = [];
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
  proceedWithDrillUp: boolean;


  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.resizeChart();
  }


  constructor(
    private apiDataReportService: ApiDataReportService,
    private apiDataProjectService: ApiDataProjectService,
    private toolsService: ToolsService,
    private cacheService: CacheService,
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

    // get the multiplier to apply to the chart cum. ftes colored bar, to fill the width
    this.barMultiplier = this.projectFteRollupTableService.calculateBarMultipler($('th.col-spark-bar'), this.maxFTE);

  }


  // on project selection from typeahead list, render the treemap chart and display table below if there is data
  async displayChart(project: any) {

    // get raw data from the database in the form of a bom with fte values
    // will include parts and require significant processing to get it into the proper format for highcharts drillable treemap
    this.bomData = await this.getBOMData(project);

    console.log('BOM Data (raw data from stored procedure:');
    console.log(this.bomData);

    // if there is only one project at level zero with no ftes, there will be no chart to render so just display an empty chart
    if (this.bomData.length === 1 && !this.bomData[0].TotalFTE) {
      this.displayEmptyChart(project);
      return;
    }

    // console.log('continuing to build chart data');

    // otherwise, modify the bom data into chart data for the highcharts drillable treemap
    this.chartData = this.projectFteRollupPrepDataService.buildChartData(this.bomData);

    console.log('returned chartData array from the prep data service:');
    console.log(this.chartData);

    // get the max fte value from the chart data, to use to calculate/re-calculate the bar multiplier
    this.maxFTE = this.projectFteRollupPrepDataService.getMaxFTE(this.chartData);

    // add the 'bulletColor' property to the chartData objects to display the colors in the table
    // (bullet and bar) which should align with the colors in the treemap chart
    this.projectFteRollupTableService.setTableColors(this.chartData);

    console.log('updated chartData array after setting table colors:');
    console.log(this.chartData);

    // get the initial table data to display (single row - the first level project)
    this.tableData = this.projectFteRollupTableService.getInitialTableData(this.chartData);

    // set the chart title and chart sub-title
    this.setChartTitle(project);

    // if there is no chart data, clear the chart and stop here
    if (!this.chartData.length) {
      this.clearChart();
      return;
    }

    // otherwise, set the chart options and render the chart
    this.chartOptions = this.projectFteRollupChartService.getChartOptions(this.chartData, this);
    // this.setChartOptions();
    this.renderChart2();

  }



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
    this.chartTitle = `Project FTE Rollup for ${project.ProjectName} ${project.ProjectTypeName}`;;
    this.chartSubTitle = undefined;

    // set the chart options
    this.setChartOptions();

    // render the chart
    this.renderChart2();

  }


  setChartTitle(project: any) {

    this.chartTitle = `Project FTE Rollup for ${project.ProjectName} ${project.ProjectTypeName}`;

    if (this.chartData.length) {

      this.chartSubTitle = `Click a box to drill down (if pointing hand cursor);
        click the grey box in the upper right corner to drill up`;

    }

  }


  renderChart2() {

    // render the chart
    this.chart = Highcharts.chart('rollupChart', this.chartOptions);

    // reflow the chart so it fits within it's outer container
    setTimeout(() => {
      this.chart.reflow();
    }, 0);

  }




  renderLokiChart(project: any) {

    // get the current fiscal quarter's date range (array of two strings in the format 'MM-DD-YYYY')
    const fiscalQuarterRange = this.toolsService.fiscalQuarterRange(moment(), 'MM-DD-YYYY');

    console.log('project object:');
    console.log(project);

    console.log('fiscal quarter range:');
    console.log(fiscalQuarterRange);

    // 16 = Bacon
    // 1033 = Loki
    this.apiDataReportService.getProjectFTERollupData(project.ProjectID, fiscalQuarterRange[0], fiscalQuarterRange[1])
    .subscribe(res => {
      this.fteData = res;
      if (res.length) {
        console.log('response has contents');
        console.log('response');
        console.log(res);

        this.hasChartData = true;

        const project = $.extend(true, {}, res[0]);
        // project.Level = 0;
        // project.ChildID = project.ParentID;
        // project.ParentID = 1;
        // project.ParentTree = project.ParentName;
        // project.ChildName = project.ParentName;


        console.log('first project object:');
        console.log(project);

        // this.fteData.splice(0, 0, project);

        // console.log('fte data after adding first project:');
        // console.log(this.fteData);

        // this.setLevelOneData(res);
        // const testProject = this.levelOneData[2];
        // console.log('test project');
        // console.log(testProject);

        const firstLevelItem = {
          id: project.ParentID.toString(),
          name: project.ChildName,
          fte: project.TotalFTE ? project.TotalFTE : 0,
          value: project.TotalFTE,
          entity: project.ChildEntity,
          type: project.ChildType,
          level: project.Level
        };

        console.log('first level chart object');
        console.log(firstLevelItem);

        this.childProjects.push(firstLevelItem);

        const t0 = performance.now();

        this.getChildProjects(project, firstLevelItem);

        const t1 = performance.now();
        console.log(`get child projects took: ${t1 - t0} milliseconds`);

        console.log('child projects (explode projects bom):');
        console.log(this.childProjects);

        // const t3 = performance.now();

        // console.log(this.childProjects[3]);
        // this.rollupFTEValues(this.childProjects[3], this.childProjects[3]);
        // console.log('test total for project at index 3:');
        // console.log(this.childProjects[3].value);
        // console.log(this.childProjects[3]);

        // const t4 = performance.now();
        // console.log(`rollup fte value took: ${t4 - t3} milliseconds`);

        // const t3 = performance.now();

        // rollup values for all chart point objects
        // this.childProjects.forEach(project => {
        //   this.rollupFTEValues(project, project);
        // });

        // const t4 = performance.now();
        // console.log(`rollup all fte values took: ${t4 - t3} milliseconds`);

        // console.log('chart point objects with rolled up values');
        // console.log(this.childProjects);

        // filter chart point objects to level 1 again
        const levelOneProjects = this.childProjects.filter(project => {
          return project.level === 0;
        });

        console.log('level one objects:');
        console.log(levelOneProjects);

        const t5 = performance.now();

        // update the parent ids for child projects
        levelOneProjects.forEach(project => {
          this.updateParentIDs(project);
        });

        const t6 = performance.now();
        console.log(`update parent ids took: ${t6 - t5} milliseconds`);

        console.log('chart point objects with updated parent ids');
        console.log(this.childProjects);

        // filter chart point objects to only Projects
        this.chartData = this.childProjects.filter(project => {
          return project.entity === 'Project';
        });

        this.setLevelZeroColor();

        // this.setLevelOneColors();

        this.removeDuplicates();

        // this.chartData.forEach(project => {
        //   this.rollupFTEValues(project, project);
        // });

        this.rollupFTEValuesFinal2();

        this.sortData();

        this.chartData = this.chartData.filter(project => {
          return project.entity === 'Project' && project.value;
        });

        // rollup fte values again with no duplicates
        // this.chartData.forEach(project => {

        //   const updatedChartData = this.chartData.filter((data, index, self) =>
        //     index === self.findIndex((t) => (
        //       t.level > project.level && t.name === data.name && t.type === data.type
        //     ))
        //   );
        //   console.log(`updated chart data after removing duplicates, prior to rolling up fte values, for project: ${project.name}`);
        //   console.log(updatedChartData);

        //   this.rollupFTEValues2(project, project, updatedChartData);

        // });

        // this.sortData();

        // this.rollupFTEValuesFinal();

        this.updateLevels2();

        this.setBulletColors();

        this.pushLevelOneItemIntoTable();

        this.getHighestFTE();

        if (this.chartData.length) {

          this.chartSubTitle = `Click a box to drill down (if pointing hand cursor);
            click grey box in upper right corner to drill up`;

          this.chartTitle = `Project FTE Rollup for ${this.chartData[0].name} ${this.chartData[0].type}`;

        } else {

          this.clearChart();

          this.chartTitle = `Project FTE Rollup for ${project.ProjectName} ${project.ProjectTypeName}`;

        }


      } else {

        this.clearChart();

        this.chartTitle = `Project FTE Rollup for ${project.ProjectName} ${project.ProjectTypeName}`;

      }


      console.log('final chart data');
      console.log(this.chartData);

      // set the chart options
      console.log('setting the chart options');
      this.setChartOptions();

      // render the chart
      console.log('rendering the chart');
      if (this.chartWasRendered) {
        this.reRenderChart();
      } else {
        this.renderChart();
      }

    },
    err => {
      console.log(err);
    });

  }


  setLevelOneData(fteData: any) {

    this.levelOneData = fteData.filter(data => {
      return data.Level === 1;
    });

    console.log(this.levelOneData);

  }

  getChildProjects(project: any, chartItem: any) {

    const parentTree = project.ParentTree;

    this.fteData.forEach(project1 => {

      const childTree = project1.ParentTree.split(' > ').splice(0, project1.ParentTree.split(' > ').length - 1).join(' > ');

      if ((project1.ParentID === project.ChildID && parentTree === childTree))  {

        // tslint:disable-next-line:max-line-length
        console.log(`parent project '${project.ChildName}', id: ${project.ChildID}, parent id: ${project.ParentID}, level: ${project.Level}, parent tree: ${project.ParentTree}`);
        // tslint:disable-next-line:max-line-length
        console.log(`found child project '${project1.ChildName}', id: ${project1.ChildID}, parent id: ${project1.ParentID}, level: ${project1.Level}, child tree: ${childTree}`);

        // console.log('found child project');
        // console.log(project1.ChildID + ': ' + project1.ChildName );
        // console.log('parent tree: ' + project.ParentTree);
        // console.log('child tree: ' + childTree);

        const obj = {
          id: chartItem.id + '_' + project1.ChildID,
          name: project1.ChildName,
          fte: project1.TotalFTE ? project1.TotalFTE : 0,
          value: project1.TotalFTE,
          parent: chartItem.id,
          type: project1.ChildType,
          entity: project1.ChildEntity,
          level: project1.Level
        };

        console.log('pushing in object:');
        console.log(obj);

        // chartItem.value += project1.TotalFTE;

        // console.log(project.ChildID);
        this.childProjects.push(obj);
        this.getChildProjects(project1, obj);
        return;
      }
    });

  }


  rollupFTEValues(projectToUpdate: any, projectToRecurse: any) {

    this.chartData.forEach(project => {
      // console.log(`project 1 parent: ${project1.parent}, project id: ${project.id}`);
      if (project.parent === projectToRecurse.id) {
        projectToUpdate.value += project.value ? project.value : 0;
        // console.log(`found child project named ${project.name}, adding ${project.value ? project.value : 0} to value`);
        // console.log(`current total is: ${projectToUpdate.value}`);
        this.rollupFTEValues(projectToUpdate, project);
      }
    });

  }

  // version without duplicates in the child projects
  rollupFTEValues2(projectToUpdate: any, projectToRecurse: any, childProjects: any) {

    childProjects.forEach(project => {
      // console.log(`project 1 parent: ${project1.parent}, project id: ${project.id}`);
      if (project.parent === projectToRecurse.id) {
        projectToUpdate.value += project.value ? project.value : 0;
        // console.log(`found child project named ${project.name}, adding ${project.value ? project.value : 0} to value`);
        // console.log(`current total is: ${projectToUpdate.value}`);
        this.rollupFTEValues(projectToUpdate, project);
      }
    });

  }


  rollupFTEValuesFinal() {

    // zero out existing values
    // this.chartData.forEach(dataPoint => {
    //   dataPoint.value = 0;
    // });

    this.chartData.forEach(project => {

      const updatedChartData = this.chartData.filter((data, index, self) =>
        index === self.findIndex((t) => (
          t.level >= project.level && t.name === data.name && t.type === data.type
        ))
      );

      console.log(`updated chart data for rollup fte values for project ${project.name}:`);
      console.log(updatedChartData);

      rollupFTEValue(project, project, updatedChartData);

    });


    function rollupFTEValue(projectToUpdate: any, projectToRecurse: any, updatedChartData) {
      updatedChartData.forEach(project => {
        if (project.parent === projectToRecurse.id) {
          projectToUpdate.value += project.value ? project.value : 0;
          rollupFTEValue(projectToUpdate, project, updatedChartData);
        }
      });
    }

    console.log('chart data after final rollup of fte values:');
    console.log(this.chartData);

  }


  getProjectBOM(project: any, data: any): any {

    const projectBOM: any = [];

    projectBOM.push(project);
    recurseBOM(project, data);

    function recurseBOM(project2, data2) {
      data2.forEach(project3 => {
        if (project3.parent === project2.id) {
          projectBOM.push(project3);
          recurseBOM(project3, data2);
        }
      });
    }

    return projectBOM;

  }


  rollupFTEValuesFinal2() {

    // zero out existing values
    // this.chartData.forEach(dataPoint => {
    //   dataPoint.value = 0;
    // });

    this.chartData.forEach(project => {

      const projectBOM = this.getProjectBOM(project, this.chartData);

      console.log(`project BOM data for rollup fte values for project ${project.name}:`);
      console.log(projectBOM);

      const filteredBOM = projectBOM.filter((data, index, self) =>
        index === self.findIndex((t) => (
          t.name === data.name && t.type === data.type
        ))
      );

      console.log(`filtered BOM data for rollup fte values for project ${project.name}:`);
      console.log(filteredBOM);

      rollupFTEValue(project, project, filteredBOM);

    });


    function rollupFTEValue(projectToUpdate: any, projectToRecurse: any, updatedChartData) {
      updatedChartData.forEach(project => {
        if (project.parent === projectToRecurse.id) {
          projectToUpdate.value += project.value ? project.value : 0;
          rollupFTEValue(projectToUpdate, project, updatedChartData);
        }
      });
    }

    console.log('chart data after final rollup of fte values:');
    console.log(this.chartData);

  }

  updateParentIDs(project: any, parentID?: number) {

    this.childProjects.forEach(project1 => {
      if (project1.parent === project.id) {
        // store the parent id to cascade down to the child projects, skipping the parts
        if (project.entity === 'Project') {
          parentID = project.id;
          // console.log(`storing id for project ${project.name}: ${parentID}`);
        }
        if (project1.entity === 'Project') {
          // console.log(`updating project ${project1.name}'s parent id to ${parentID}`);
          project1.parent = parentID;
        }
        this.updateParentIDs(project1, parentID);
      }
    });

  }


  setLevelZeroColor() {

    const levelZeroProjects = this.childProjects.filter(childProject => {
      return childProject.level === 0;
    });

    levelZeroProjects.forEach((levelZeroProject, index) => {
      levelZeroProject.color = Highcharts.getOptions().colors[0];
    });

  }

  setLevelOneColors() {

    const levelOneProjects = this.childProjects.filter(childProject => {
      return childProject.level === 1;
    });

    levelOneProjects.forEach((levelOneProject, index) => {
      levelOneProject.color = Highcharts.getOptions().colors[index];
    });

  }


  removeDuplicates() {

    this.chartData = this.chartData.filter((data, index, self) =>
      index === self.findIndex((t) => (
        t.level === data.level && t.name === data.name && t.parent === data.parent && t.type === data.type
      ))
    );
    console.log('chart data after removing duplicates:');
    console.log(this.chartData);

  }


  sortData() {


    this.chartData = _.orderBy(this.chartData, ['level', 'parent', 'value', ], ['asc', 'asc', 'desc']);
    console.log('chart data after sort:');
    console.log(this.chartData);

  }


  updateLevels() {

    let newLevel = 0;
    let formerLevel;
    this.chartData.forEach(data => {
      if (data.level === 0 || data.level > formerLevel) {
        formerLevel = data.level;
        newLevel++;
      }
      data.level = newLevel;
    });

    console.log('chart data after update levels:');
    console.log(this.chartData);

  }


  updateLevels2() {

    this.chartData.forEach(data => {
      if (data.hasOwnProperty('parent')) {
        const parentSegments = data.parent.split('_').length;
        data.level = parentSegments + 1;
      } else {
        if (data.level === 0) {
          data.level = 1;
        }
      }
    });

    console.log('chart data after update levels:');
    console.log(this.chartData);

  }

  setBulletColors() {

    let colorIndex = 0;
    this.chartData.forEach(data => {
      if (data.level === 1) {
        data.bulletColor = Highcharts.getOptions().colors[0];
      } else if (data.level === 2) {
        data.bulletColor = Highcharts.getOptions().colors[colorIndex];
        colorIndex++;
      } else {
        const foundParent = this.chartData.find(parent => {
          return parent.id === data.parent;
        });
        if (foundParent) {
          data.bulletColor = foundParent.bulletColor;
        }
      }
    });

    console.log('chart data after update colors:');
    console.log(this.chartData);

  }


  getHighestFTE() {

    let maxFTE = 0;
    this.chartData.forEach(data => {
      if (data.value > maxFTE) {
        maxFTE = data.value;
      }
    });
    this.maxFTE = maxFTE;

    console.log('max fte:');
    console.log(this.maxFTE);

  }


  pushLevelOneItemIntoTable() {

    const levelOneItem = this.chartData.filter(data => {
      return data.level === 1;
    });

    if (levelOneItem.length) {
      // this.tableData.push(levelOneItem[0]);
      this.tableData.splice(0, 0, ...levelOneItem);
      this.tableData[0].highlight = true;
    }

    console.log('this.tableData:');
    console.log(this.tableData);

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


  calculateBarMultipler() {

    // get the width of the bar column
    const colWidth = $('th.col-spark-bar').outerWidth();

    // console.log('column width:');
    // console.log(colWidth);

    // divide the width in pixels by the max number of cumulative ftes
    const multiplier1 = colWidth / this.maxFTE;

    // console.log('multiplier1:');
    // console.log(multiplier1);

    // subtract 30% to allow for some padding
    const multiplier2 = this.toolsService.roundTo((multiplier1 - (multiplier1 * 0.33)), 0);

    // console.log('multiplier2:');
    // console.log(multiplier2);

    // set the bar multiplier
    this.barMultiplier = multiplier2;

    // console.log('bar multiplier:');
    // console.log(this.barMultiplier);

  }



  setChartOptions() {

    const that = this;

    this.chartOptions = {
      chart: {
        // height: 600,
        events: {
          load: function (e) {
            if (that.hasChartData) {
              that.displayTable = true;
              setTimeout(() => {
                that.calculateBarMultipler();
              }, 0);
            }
          }
        }
      },
      plotOptions: {
        series: {
          animation: true
        }
      },
      // tooltip: {
      //   formatter: function () {
      //     return 'The value for <b>sadfas</b>';
      //   }
      // },
      series: [{
        type: 'treemap',
        layoutAlgorithm: 'squarified',  // sliceAndDice, stripes, squarified or strip
        layoutStartingDirection: 'vertical',
        allowDrillToNode: true,
        interactByLeaf: false,
        animationLimit: 1000,
        stickyTracking: true,
        enableMouseTracking: true,
        // tooltip: {
        //   followPointer: true
        // },
        dataLabels: {
          enabled: false
        },
        // tooltip: {
        //   pointFormatter: function () {
        //     return `<b>{point.name}</b>: {point.value}<br/> YES!`;
        //   }
        // },
        levelIsConstant: false,
        levels: [{
          level: 1,
          dataLabels: {
            enabled: true,
            style: {
              color: 'contrast',
              fontSize: '12px',
              fontWeight: 'bold',
              textOutline: false
            }
          },
          borderWidth: 3
        }],
        events: {
          click: function(e) {
            // if (1 === 1) {
            //   throw {error: 'dont drill down'};
            // }

            const tableData = $.extend(true, [], that.tableData);
            console.log('table data:');
            console.log(tableData);

            console.log(`clicked on ${e.point.name}; id ${e.point.id}`);
            console.log(e.point);

            if (that.checkClickedItemIsInChart(e.point.id, tableData)) {
              console.log('clicked item IS in the chart');

            // console.log(e);
            // console.log(e.point.level);
            // console.log('this');
            // console.log(this);
            // console.log('rootNode:');
            // const rootNode = this.chart.series[0].rootNode;
            // console.log(rootNode);
            // const drillDownColors = ['#7cb5ec', '#90ed7d', '#91e8e1', '#f45b5b', '#2b908f',
            //   '#7cb5ec', '#e4d354', '#434348', '#8085e9', '#f15c80'];
            let colorIndex = 0;
            for (let i = 0; i < this.data.length; i++) {
              if (this.data[i].level === 2) {
                const pointColor = Highcharts.getOptions().colors[colorIndex];
                this.data[i].update({
                  // color: drillDownColors[colorIndex]
                  color: pointColor
                });
                // console.log(`color for ${e.point.name} is ${pointColor}`);
                colorIndex++;
                that.chartData.color = pointColor;
              }
            }

            let drilledDown = false;

            // console.log('test of that');
            // console.log(that.chartData);
            if (e.point.node.children.length) {
              drilledDown = true;
              // that.drillHistory.push({
              //   level: e.point.level,
              //   id: e.point.id,
              //   name: e.point.name
              // });
            }

            if (drilledDown) {

              console.log('e.point:');
              console.log(e.point);

              this.chart.setTitle({text: `Project FTE Rollup for ${e.point.name} ${e.point.type}`});

              console.log(`chart title: ${this.chart.title.textStr}`);

              that.pushChildItemsIntoTable(e.point.id);

              that.pushChildIDsIntoHistory(e.point.id);

              that.pushTitlesIntoHistory(this.chart.title.textStr);

              that.highlightDisplayedItems(e.point.id);

            }

            // console.log('drill history:');
            // console.log(that.drillHistory);

            // console.log('updated data');
            // console.log(this.data);
          } else {
            console.log('clicked item is NOT in the chart');
            throw {error: 'dont drill down'};
          }

          }
        },
        data: this.chartData
      }],
      subtitle: {
        text: this.chartSubTitle
      },
      title: {
        text: this.chartTitle
      }
    };

  }


  renderChart() {

    if (this.chart) {
      this.chart.destroy();
    }

    console.log('BEFORE CHART RENDERING');

    // render the chart
    this.chart = Highcharts.chart('rollupChart', this.chartOptions);
    setTimeout(() => {
      this.chart.reflow();
    }, 0);

    console.log('AFTER CHART RENDERING');

    this.chartWasRendered = true;


  }


  // onTestClick() {
  //   console.log('test button clicked');
  //   console.log(this.chart.series[0].data[0].select(true, true));
  // }

  reRenderChart() {
    // this.chartOptions.plotOptions.series.animation = false;
    this.chart.destroy();
    this.chart = Highcharts.chart('rollupChart', this.chartOptions);
    setTimeout(() => {
      this.chart.reflow();
    }, 0);
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
    console.log('search input clear clicked');
    this.filterString = undefined;
    // $('input.projects-filter-input').val('');
    // this.filterStringVC.nativeElement.value = '';
    console.log('filterString:');
    console.log(this.filterString);
    $('.projects-filter-input').typeahead('val', '');
    // reset the focus on the filter input
    this.filterStringVC.nativeElement.focus();


    this.clearChart();

    // $('.projects-filter-input').typeahead('close');
    // setTimeout(() => {
    //   $('div.tt-menu').removeClass('tt-open');
    // }, 0);
    // update the count display (showing x of y) by calling onFilterStringChange()
    // this.onFilterStringChange();
  }


  clearChartData() {

    this.chartData = undefined;
    this.tableData.splice(0, this.tableData.length);
    // this.tableData = [];
    this.levelOneData = undefined;
    this.childProjects.splice(0, this.childProjects.length);
    // this.childProjects = [];
    this.drillLevel = 0;
    this.drillHistory.splice(0, this.drillHistory.length);
    // this.drillHistory = [];
    this.drillDownIDs.splice(0, this.drillDownIDs.length);
    // this.drillDownIDs = [];
    this.drillDownTitles.splice(0, this.drillDownTitles.length);
    // this.drillDownTitles = [];
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

    if (this.chartWasRendered) {
      this.reRenderChart();
    } else {
      this.renderChart();
    }

  }


}
