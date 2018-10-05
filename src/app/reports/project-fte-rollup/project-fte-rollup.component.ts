import { Component, OnInit, AfterViewInit, HostListener } from '@angular/core';
import { ApiDataReportService } from '../../_shared/services/api-data/api-data-report.service';
import { ToolsService } from '../../_shared/services/tools.service';

declare var require: any;
declare var $: any;
import * as moment from 'moment';
import * as Highcharts from 'highcharts';
require('highcharts/modules/heatmap.js')(Highcharts);
require('highcharts/modules/treemap.js')(Highcharts);
require('highcharts/modules/data.js')(Highcharts);
require('highcharts/modules/drilldown.js')(Highcharts);
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
  ) { }

  ngOnInit() {

    // const file = `https://cdn.rawgit.com/highcharts/highcharts/057b672172ccc6c08fe7dbb27fc17ebca3f5b770/samples/data/world-mortality.json`;

    // $.getJSON(file, data => {
    //   this.data = data;
    //   // console.log(this.data);
    //   this.renderChart();
    // });

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
        value: 0,
        type: project.ParentEntity,
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
        return project.type === 'Project' && project.value;
      });

      this.setLevelZeroColor();

      // this.setLevelOneColors();

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

  ngAfterViewInit() {

    $('g.highcharts-button.highcharts-drillup-button').click(function() {
      console.log('drill up button clicked');
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
          value: project1.TotalFTE,
          parent: chartItem.id,
          type: project1.ChildEntity,
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
        if (project.type === 'Project') {
          parentID = project.id;
          // console.log(`storing id for project ${project.name}: ${parentID}`);
        }
        if (project1.type === 'Project') {
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

  // renderChartDemo() {

  //   let points = [],
  //   regionP,
  //   regionVal,
  //   regionI = 0,
  //   countryP,
  //   countryI,
  //   causeP,
  //   causeI,
  //   region,
  //   country,
  //   cause,
  //   causeName = {
  //       'Communicable & other Group I': 'Communicable diseases',
  //       'Noncommunicable diseases': 'Non-communicable diseases',
  //       'Injuries': 'Injuries'
  //   };


  //   for (region in this.data) {
  //     if (this.data.hasOwnProperty(region)) {
  //         regionVal = 0;
  //         regionP = {
  //             id: 'id_' + regionI,
  //             name: region,
  //             color: Highcharts.getOptions().colors[regionI]
  //         };
  //         countryI = 0;
  //         for (country in this.data[region]) {
  //             if (this.data[region].hasOwnProperty(country)) {
  //                 countryP = {
  //                     id: regionP.id + '_' + countryI,
  //                     name: country,
  //                     parent: regionP.id
  //                 };
  //                 points.push(countryP);
  //                 causeI = 0;
  //                 for (cause in this.data[region][country]) {
  //                     if (this.data[region][country].hasOwnProperty(cause)) {
  //                         causeP = {
  //                             id: countryP.id + '_' + causeI,
  //                             name: causeName[cause],
  //                             parent: countryP.id,
  //                             value: Math.round(+this.data[region][country][cause])
  //                         };
  //                         regionVal += causeP.value;
  //                         points.push(causeP);
  //                         causeI = causeI + 1;
  //                     }
  //                 }
  //                 countryI = countryI + 1;
  //             }
  //         }
  //         regionP.value = Math.round(regionVal / countryI);
  //         points.push(regionP);
  //         regionI = regionI + 1;
  //     }
  //   }

  //   console.log('points array:');
  //   console.log(points);

  //   this.chartOptions = {
  //     chart: {
  //       height: 600
  //     },
  //     // plotOptions: {
  //     //   dataLabels: {
  //     //     enabled: false,
  //     //     style: {
  //     //       color: '#7cb5ec',
  //     //       fontSize: '12px',
  //     //       fontWeight: 'bold',
  //     //       textOutline: false
  //     //     }
  //     //   }
  //     // },
  //     series: [{
  //       type: 'treemap',
  //       layoutAlgorithm: 'stripes',  // stripes
  //       allowDrillToNode: true,
  //       animationLimit: 1000,
  //       // dataLabels: {
  //       //   enabled: false,
  //       //   style: {
  //       //     color: 'black',
  //       //     fontSize: '12px',
  //       //     fontWeight: 'bold',
  //       //     textOutline: false
  //       //   }
  //       // },
  //       // levels: [{
  //       //   level: 0,
  //       //   layoutAlgorithm: 'sliceAndDice',
  //       //   dataLabels: {
  //       //     enabled: true,
  //       //     align: 'left',
  //       //     verticalAlign: 'top',
  //       //     style: {
  //       //       fontSize: '18px',
  //       //       fontWeight: 'bold'
  //       //     }
  //       //   }
  //       // }],
  //       data: points
  //     }],
  //     // dataLabels: {
  //     //   enabled: false,
  //     //   color: 'black'
  //     // },
  //     subtitle: {
  //       text: 'Click points to drill down. Source: <a href="http://apps.who.int/gho/data/node.main.12?lang=en">WHO</a>.'
  //     },
  //     title: {
  //       text: 'Global Mortality Rate 2012, per 100 000 population'
  //     }
  //   };


  //   // render the chart
  //   this.chart = Highcharts.chart('rollupChart', this.chartOptions);


  // }



  setChartOptions() {


    this.chartOptions = {
      chart: {
        // height: 600,
        events: {
          drillup: function (e) {
            alert('drill Up');
            console.log(this);
          }
        }
      },
      series: [{
        type: 'treemap',
        layoutAlgorithm: 'stripes',  // sliceAndDice, stripes, squarified or strip
        layoutStartingDirection: 'vertical',
        allowDrillToNode: true,
        animationLimit: 1000,
        dataLabels: {
          enabled: false
        },
        levelIsConstant: false,
        levels: [{
          level: 1,
          dataLabels: {
            enabled: true,
            fontSize: '18px',
            textOutline: false,
            colorByPoint: false
          },
          borderWidth: 3
        }],
        events: {
          click: function(e) {
            console.log(e);
            console.log(e.point.level);
            console.log('this');
            console.log(this);
            const drillDownColors = ['#7cb5ec', '#90ed7d', '#91e8e1', '#f45b5b', '#2b908f',
              '#7cb5ec', '#e4d354', '#434348', '#8085e9', '#f15c80'];
            let colorIndex = 0;
            for (let i = 0; i < this.data.length; i++) {
              if (this.data[i].level === 1) {
                this.data[i].update({
                  // color: drillDownColors[colorIndex]
                  color: Highcharts.getOptions().colors[colorIndex]
                });
                colorIndex++;
              }
            }
            console.log('updated data');
            console.log(this.data);
          },
          drillup: function(e) {
            console.log('drillup');
            console.log(e);
          }
        },
        data: this.chartData
      }],
      subtitle: {
        text: 'Click points to drill down. Source: <a href="http://apps.who.int/gho/data/node.main.12?lang=en">WHO</a>.'
      },
      title: {
        text: 'Global Mortality Rate 2012, per 100 000 population'
      }
    };

  }


  renderChart() {

    $(function() {
      (function(H: any) {
        H.wrap(H.seriesTypes.treemap.prototype, 'drillUp', function(proceed) {
          console.log('drillup triggered');
          console.log('this:');
          console.log(this);
          console.log('rootNode:');
          const rootNode = this.chart.series[0].rootNode;
          console.log(rootNode);
          const level = rootNode ? rootNode.split('_').length : 0;
          console.log('level:');
          console.log(level);
          if (level === 1) {
            for (let i = 0; i < this.data.length; i++) {
              if (this.data[i].level === 1) {
                this.data[i].update({
                  color: '#7cb5ec'
                });
              }
            }
          }
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
