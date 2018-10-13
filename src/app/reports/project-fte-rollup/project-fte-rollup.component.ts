import { Component, OnInit, AfterViewInit, HostListener } from '@angular/core';
import { ApiDataReportService } from '../../_shared/services/api-data/api-data-report.service';
import { ToolsService } from '../../_shared/services/tools.service';

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
  styleUrls: ['./project-fte-rollup.component.css', '../../_shared/styles/common.css']
})
export class ProjectFteRollupComponent implements OnInit, AfterViewInit {

  data: any;
  chartOptions: any;
  chart: any;
  fteData: any;
  levelOneData: any;
  childProjects: any = [];
  chartData: any;
  drillLevel: number;
  drillHistory: any = [];
  tableData: any = [];
  displayTable: boolean;

  // set up a document click hostlistener for the clickable message links
  @HostListener('document:click', ['$event.target'])
  onClick(targetElement) {
    // set the clicked element to a jQuery object
    const $targetElement = $(targetElement);
    // if the element has the message-link class, take some action
    if ($targetElement.hasClass('highcharts-drillup-button')) {
      console.log('chart drillup button clicked');
    }
  }

  constructor(
    private apiDataReportService: ApiDataReportService,
    private toolsService: ToolsService
  ) {

    this.drillLevel = 0;

  }

  ngOnInit() {

    // this.renderTestChart();
    this.renderLokiChart();

  }

  ngAfterViewInit() {

    $('g.highcharts-button.highcharts-drillup-button').click(function() {
      console.log('drill up button clicked');
    });

  }



  renderLokiChart() {

    // get the current fiscal quarter's date range (array of two strings in the format 'MM-DD-YYYY')
    const fiscalQuarterRange = this.toolsService.fiscalQuarterRange(moment(), 'MM-DD-YYYY');

    this.apiDataReportService.getProjectFTERollupData(1033, fiscalQuarterRange[0], fiscalQuarterRange[1])
    .subscribe(res => {
      this.fteData = res;
      console.log('response');
      console.log(res);

      const project = $.extend(true, {}, res[0]);
      project.Level = 0;
      project.ParentID = 1;
      project.ChildName = project.ParentName;

      console.log('first project object:');
      console.log(project);

      this.fteData.splice(0, 0, project);

      console.log('fte data after adding first project:');
      console.log(this.fteData);

      // this.setLevelOneData(res);
      // const testProject = this.levelOneData[2];
      // console.log('test project');
      // console.log(testProject);

      const firstLevelItem = {
        id: project.ParentID.toString(),
        name: project.ParentName,
        fte: 0,
        value: 0,
        entity: project.ParentEntity,
        type: project.ParentType,
        level: 0
      };

      console.log('first level chart object');
      console.log(firstLevelItem);

      this.childProjects.push(firstLevelItem);

      // this.levelOneData.forEach((project, index) => {

      //   const chartItem = {
      //     id: project.ChildID.toString(),
      //     name: project.ChildName,
      //     value: project.TotalFTE,
      //     type: project.ChildEntity,
      //     level: project.Level,
      //     color: Highcharts.getOptions().colors[index]
      //   };
      //   this.childProjects.push(chartItem);

      //   this.getChildProjects(project, chartItem);

      // });

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

      const t3 = performance.now();

      // rollup values for all chart point objects
      this.childProjects.forEach(project => {
        this.rollupFTEValues(project, project);
      });

      const t4 = performance.now();
      console.log(`rollup all fte values took: ${t4 - t3} milliseconds`);

      console.log('chart point objects with rolled up values');
      console.log(this.childProjects);

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

      // filter chart point objects to only Projects with values
      this.chartData = this.childProjects.filter(project => {
        return project.entity === 'Project' && project.value;
      });

      this.setLevelZeroColor();

      // this.setLevelOneColors();

      this.sortData();

      this.updateLevels2();

      this.setBulletColors();

      this.pushLevelOneItemIntoTable();

      console.log('final chart data');
      console.log(this.chartData);

      // set the chart options
      console.log('setting the chart options');
      this.setChartOptions();

      // render the chart
      console.log('rendering the chart');
      this.renderChart();

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

      if ((project1.ParentID === project.ChildID && parentTree === childTree) || project.Level === 0 && project1.Level === 1)  {
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

        // chartItem.value += project1.TotalFTE;

        // console.log(project.ChildID);
        this.childProjects.push(obj);
        this.getChildProjects(project1, obj);
        return;
      }
    });

  }


  rollupFTEValues(projectToUpdate: any, projectToRecurse: any) {

    this.childProjects.forEach(project => {
      // console.log(`project 1 parent: ${project1.parent}, project id: ${project.id}`);
      if (project.parent === projectToRecurse.id) {
        projectToUpdate.value += project.value ? project.value : 0;
        // console.log(`found child project named ${project.name}, adding ${project.value ? project.value : 0} to value`);
        // console.log(`current total is: ${projectToUpdate.value}`);
        this.rollupFTEValues(projectToUpdate, project);
      }
    });

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


  pushLevelOneItemIntoTable() {

    const levelOneItem = this.chartData.filter(data => {
      return data.level === 1;
    });

    if (levelOneItem.length) {
      // this.tableData.push(levelOneItem[0]);
      this.tableData.splice(0, 0, ...levelOneItem);
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

    const childItems = this.chartData.filter(data => {
      return data.parent === parentID;
    });

    console.log('child items:');
    console.log(childItems);

    if (childItems.length) {
      // this.tableData.push(childItems[0]);
      this.tableData.splice(tableRow, 0, ...childItems);
      // a1.splice(2, 0, ...a2);
    }

    console.log('new table data:');
    console.log(this.tableData);

  }


  



  setChartOptions() {

    const that = this;

    this.chartOptions = {
      chart: {
        // height: 600,
        events: {
          load: function (e) {
            console.log('chart is loaded');
            that.displayTable = true;
          }
        }
      },
      series: [{
        type: 'treemap',
        layoutAlgorithm: 'squarified',  // sliceAndDice, stripes, squarified or strip
        layoutStartingDirection: 'vertical',
        allowDrillToNode: true,
        animationLimit: 1000,
        // tooltip: {
        //   followPointer: true
        // },
        dataLabels: {
          enabled: false
        },
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
            console.log(`clicked on ${e.point.name}; id ${e.point.id}`);
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
            // this.chart.title.text = 'Project FTEs for Loki Program';
            this.chart.setTitle({text: `Project FTEs for ${e.point.name}`});

            // console.log('test of that');
            // console.log(that.chartData);
            if (e.point.node.children.length) {
              that.drillHistory.push({
                level: e.point.level,
                id: e.point.id,
                name: e.point.name
              });
            }

            console.log('drill history:');
            console.log(that.drillHistory);

            that.pushChildItemsIntoTable(e.point.id);

            // console.log('updated data');
            // console.log(this.data);
          }
          // drillup: function(e) {
          //   console.log('drillup');
          //   console.log(e);
          // }
        },
        data: this.chartData
      }],
      subtitle: {
        text: 'Click colored project box to drill down (if pointing hand cursor), grey box in upper right corner to drill up'
      },
      title: {
        text: 'Project FTEs for Loki Program (Cumulative Rollup)'
      }
    };

  }


  renderChart() {

    const that = this;

    const temp = [
      {
        ids: [1, 2, 4]
      },
      {
        ids: [1, 5, 6, 9, 10, 11]
      }
    ];

    $(function() {
      (function(H: any) {
        H.wrap(H.seriesTypes.treemap.prototype, 'drillUp', function(proceed) {
          // console.log('drillup triggered');
          // console.log('proceed');
          // console.log(proceed);
          console.log('this:');
          console.log(this);
          // console.log('H');
          // console.log(H);
          const rootNode = this.chart.series[0].rootNode;
          // console.log(rootNode);
          const level = rootNode ? rootNode.split('_').length : 0;
          console.log('level:');
          console.log(level);
          if (level === 1) {
            for (let i = 0; i < this.data.length; i++) {
              if (this.data[i].level === 2) {
                this.data[i].update({
                  color: '#7cb5ec'
                });
              }
            }
          }
          // console.log('drill history:');
          // console.log(that.drillHistory);
          // console.log('data:');
          // console.log(this.data);
          // console.log('H:');
          // console.log(H);
          // H.each(this.data, function(el) {
          //   console.log(el);
          //   // if (el.options.level === 0) {
          //   //   el.update({
          //   //     color: '#7cb5ec'
          //   //   });
          //   // }
          // });
          // console.log('updated data:');
          // console.log(this.data);
          proceed.apply(this);
        });
      })(Highcharts);
    });

    // console.log(func);

    // render the chart
    this.chart = Highcharts.chart('rollupChart', this.chartOptions);


  }




}
