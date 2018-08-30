import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CacheService } from '../../_shared/services/cache.service';
import { ApiDataProjectService } from '../../_shared/services/api-data/_index';

declare var require: any;
import * as Highcharts from 'highcharts';
require('highcharts/modules/xrange.js')(Highcharts);
require('highcharts/modules/annotations.js')(Highcharts);
import * as moment from 'moment';

@Component({
  selector: 'app-display-project',
  templateUrl: './display-project.component.html',
  styleUrls: ['./display-project.component.css', '../../_shared/styles/common.css']
})
export class DisplayProjectComponent implements OnInit {

  project: any;
  projectID: number;
  schedule: any;
  roster: any;
  showSpinner: boolean;
  showPage: boolean;
  chartOptions: any;
  chartData: any;
  chartCategories: any;
  animateChart: boolean;
  showPlannedChecked: boolean;
  showActualsChecked: boolean;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private cacheService: CacheService,
    private apiDataProjectService: ApiDataProjectService
  ) {

    // get the project id from the route params
    this.projectID = activatedRoute.snapshot.params['id'];

    this.showPlannedChecked = true;
    this.showActualsChecked = true;

    this.animateChart = true;

  }

  ngOnInit() {

    console.log('date test');
    console.log(Date.UTC(2014, 11, 2));
    // 5/13/2017
    // console.log(moment('5/13/2017'));
    console.log(new Date('5/13/2017').getTime());

    console.log('project id from the router (url');
    console.log(`project id: ${this.projectID}`);

    console.log('all projects from the cache service');
    console.log(this.cacheService.projects);

    const color = this.getBarColor('CON', false);
    console.log('bar color test:');
    console.log(color);


    if (this.cacheService.project) {

      this.project = this.cacheService.project;
      this.showPage = true;
      console.log('clicked project from the cache service');
      console.log(this.project);
      this.getRemainingData();
      // this.renderScheduleChart();

    } else {

      this.apiDataProjectService.getProject(this.projectID)
      .subscribe(
        async res => {
          this.project = res[0];
          this.showPage = true;
          console.log('retrieved project from the api');
          console.log(this.project);
          console.log('before await this.getRemainingData()');
          await this.getRemainingData();
          console.log('after await this.getRemainingData()');
          // this.renderScheduleChart();
        },
        err => {
          // hide the spinner
          this.showSpinner = false;
        }
      );

    }

  }


  getRemainingData() {

    const t0 = performance.now();
    this.apiDataProjectService.getProjectDisplayData(this.projectID)
      .subscribe(
        res => {
          const t1 = performance.now();
          console.log(`get remaining data took ${t1 - t0} milliseconds`);
          console.log('schedule and roster data');
          console.log(res);
          if (res[0].length) {
            this.schedule = res[0];
          }
          if (res[1][0].hasOwnProperty('teamMembers')) {
            this.roster = res[1][0].teamMembers;
          }
          console.log('schedule:');
          console.log(this.schedule);
          console.log('roster:');
          console.log(this.roster);

          const categories = this.buildChartCategories();
          console.log('chart categories');
          console.log(categories);
          this.chartCategories = categories;

          this.chartData = this.buildChartData();
          console.log('chart data');
          console.log(this.chartData);

          console.log('moment date testing:');
          if (this.schedule) {
            console.log(this.schedule[0].PLCDate);
            console.log(moment(this.schedule[0].PLCDate));
            console.log('utc offset');
            console.log(moment(this.schedule[0].PLCDate).utcOffset());
          }

          this.renderScheduleChart();

          this.animateChart = false;
        },
        err => {
          // hide the spinner
          this.showSpinner = false;
        }
      );

  }

  getRemainingData2(): any {

    this.apiDataProjectService.getProjectDisplayData(this.projectID)
      .subscribe(
        res => {
          return res;
        },
        err => {
          return undefined;
        }
      );

  }


  updateScheduleChart() {

    console.log(this.chartOptions.series[0].data);
    const filteredData = this.chartOptions.series[0].data.filter(data => {
      return data.y % 2 === 0;
    });

    console.log('filtered data:');
    console.log(filteredData);

    this.chartOptions.series[0].data = filteredData;

    this.chartOptions.yAxis.categories = this.chartOptions.yAxis.categories.filter((category, index) => {
      return index % 2 === 0;
    });

    Highcharts.chart('scheduleChart', this.chartOptions);

  }

  onShowPlannedClick() {
    this.updateChart();
  }

  onShowActualsClick() {
    this.updateChart();
  }

  updateChart() {
    this.chartCategories = this.buildChartCategories();
    this.chartData = this.buildChartData();
    this.renderScheduleChart();
  }


  buildChartCategories(): string[] {
    const categories = [];
    if (this.schedule) {
      this.schedule.forEach(checkPoint => {
        if (checkPoint.PLCDateCommit && this.showPlannedChecked) {
          categories.push(`${checkPoint.Description} (${checkPoint.PLCStatusName}) - Commit`);
        }
        if (checkPoint.PLCDate && this.showActualsChecked) {
          categories.push(`${checkPoint.Description} (${checkPoint.PLCStatusName}) - Actual`);
        }
      });
    }
    return categories;
  }

  buildChartData(): any[] {
    const chartData = [];
    const dateColumnNames = [];
    if (this.showPlannedChecked) {
      dateColumnNames.push('PLCDateCommit');
    }
    if (this.showActualsChecked) {
      dateColumnNames.push('PLCDate');
    }
    // loop through the schedule data
    dateColumnNames.forEach(columnName => {
      if (this.schedule) {
        this.schedule.forEach((checkPoint, index) => {
          // if there is a commit date (planned date)
          if (checkPoint[columnName]) {
            // init an empty object
            const bar = {
              x: null,
              x2: null,
              y: null,
              description: null,
              color: null
            };
            // get the utc offset in hours
            // const utcOffset = -moment(checkPoint[columnName]).utcOffset() / 60;
            // console.log('utc offset');
            // console.log(utcOffset);
            // if this is the first checkpoint, the bar will be displayed as a single day
            if (index === 0) {
              // const date = moment(checkPoint.PLCDateCommit).subtract(1, 'days').format('M/D/YY');
              bar.x = moment(checkPoint[columnName]).add(8, 'hours').subtract(1, 'days').valueOf();
              bar.x2 = moment(checkPoint[columnName]).add(8, 'hours').valueOf();
            } else {
              // find the index of the previous checkpoint
              // where the PLCSequence is lower and it has a date
              let prevIndex;
              for (let i = index - 1; i >= 0; i--) {
                if (+this.schedule[i].PLCSequence < +checkPoint.PLCSequence && this.schedule[i][columnName]) {
                  prevIndex = i;
                  break;
                }
              }
              console.log(`previous index for checkpoint ${checkPoint.PLCStatusName}:`);
              console.log(prevIndex);
              const prevCheckpoint = this.schedule[prevIndex];
              console.log(`previous checkpoint object for checkpoint ${checkPoint.PLCStatusName}:`);
              console.log(prevCheckpoint);
              bar.x = moment(prevCheckpoint[columnName]).add(8, 'hours').valueOf();
              bar.x2 = moment(checkPoint[columnName]).add(8, 'hours').valueOf();
              if (bar.x === bar.x2) {
                bar.x = moment(checkPoint[columnName]).add(8, 'hours').subtract(1, 'days').valueOf();
              }
            }
            const suffix = columnName === 'PLCDateCommit' ? 'Commit' : 'Actual';
            bar.y = this.chartCategories.indexOf(`${checkPoint.Description} (${checkPoint.PLCStatusName}) - ${suffix}`);
            bar.description = checkPoint.PLCStatusName;
            bar.color = this.getBarColor(checkPoint.PLCStatusName, columnName === 'PLCDateCommit');
            // add the bar object to the array
            chartData.push(bar);
          }
        });
      }
    });


    return chartData;
  }


  renderScheduleChart() {

    console.log('start of chart rendering');

    Highcharts.setOptions({
      global: {
        useUTC: false
      }
    });


    // set the chart options
    this.chartOptions = {
      chart: {
        type: 'xrange',
        marginTop: 75,
        marginBottom: 65,
        spacingLeft: 25,
        spacingRight: 25,
        spacingTop: 25
        // backgroundColor: 'transparent'
      },
      title: {
        // text: `${this.project.ProjectName} PLC Schedule`
        text: `PLC Schedule`
      },
      legend: {
        enabled: false
      },
      plotOptions: {
        series: {
          animation: this.animateChart
        }
      },
      tooltip: {
        formatter: function () {
          // console.log(this);
          return `<b>${this.point.yCategory}</b><br/>
            <span style="font-size: 12px">${moment(this.point.x).format('MMM D, YYYY')} -
            ${moment(this.point.x2).format('MMM D, YYYY')}</span>`;
        }
        // useHTML: true,
        // headerFormat: `<b>{point.yCategory}</b><br/>`,
        // pointFormat: `<span style="font-size: 12px">{point.x} - {point.x2}</span>`
      },
      xAxis: {
        type: 'datetime',
        startOnTick: true,
        tickAmount: 10,
        // minTickInterval: moment.duration(1, 'month').asMilliseconds(),
        gridLineWidth: 1,
        plotLines: [{
          color: '#FF0000', // Red
          width: 1,
          dashStyle: 'Dash',
          value: new Date().getTime() // Position, you'll have to translate this to the values on your x axis
        }]
      },
      annotations: [{
        visible: true,
        labels: [{
          point: {
            x: 1392364800000,
            y: 0,
            xAxis: 0,
            yAxis: 0
          },
          text: '2/14/2014'
        }, {
          point: {
            x: 1392364800000,
            y: 1,
            xAxis: 0,
            yAxis: 0
          },
          text: '2/14/2014'
        }, {
          point: {
            x: 1408089600000,
            y: 2,
            xAxis: 0,
            yAxis: 0
          },
          text: '8/14/2014'
        }, {
          point: {
            x: 1409212800000,
            y: 3,
            xAxis: 0,
            yAxis: 0
          },
          text: '8/28/2014'
        }, {
          point: {
            x: 1493625600000,
            y: 4,
            xAxis: 0,
            yAxis: 0
          },
          text: '5/1/2017'
        }, {
          point: {
            x: 1494489600000,
            y: 5,
            xAxis: 0,
            yAxis: 0
          },
          text: '5/11/2017'
        }, {
          point: {
            x: 1495699200000,
            y: 6,
            xAxis: 0,
            yAxis: 0
          },
          text: '5/25/2017'
        }, {
          point: {
            x: 1524729600000,
            y: 7,
            xAxis: 0,
            yAxis: 0
          },
          text: '8/26/2018'
        }],
        labelOptions: {
          backgroundColor: 'white'
        }
      }],
      yAxis: {
        title: {
          text: ''
        },
        categories: this.chartCategories,
        reversed: true,
        labels: {
          style: {
            color: 'black'
          }
        }
      },
      series: [{
        name: 'Baymax',
        borderColor: 'gray',
        pointWidth: 20,
        data: this.chartData,
        // data: [{
        //   x: new Date('5/12/2017').getTime(),
        //   x2: new Date('5/13/2017').getTime(),
        //   y: 0,
        //   description: 'CON'
        // }, {
        //   x: new Date('5/12/2017').getTime(),
        //   x2: new Date('5/13/2017').getTime(),
        //   y: 1,
        //   description: 'INV'
        // }, {
        //   x: new Date('5/12/2017').getTime(),
        //   x2: new Date('5/13/2017').getTime(),
        //   y: 2,
        //   description: 'DEF'
        // }, {
        //   x: new Date('5/13/2017').getTime(),
        //   x2: new Date('7/27/2017').getTime(),
        //   y: 3,
        //   description: 'DEV',
        //   color: 'rgba(247, 163, 92, 1)'
        // }, {
        //   x: new Date('5/13/2017').getTime(),
        //   x2: new Date('8/6/2017').getTime(),
        //   y: 4,
        //   description: 'DEV',
        //   color: 'rgba(247, 163, 92, 0.5)'
        // }, {
        //   x: new Date('7/27/2017').getTime(),
        //   x2: new Date('10/6/2017').getTime(),
        //   y: 5,
        //   description: 'SQ'
        // }, {
        //   x: new Date('7/27/2017').getTime(),
        //   x2: new Date('10/6/2017').getTime(),
        //   y: 6,
        //   description: 'HQ'
        // }, {
        //   x: new Date('10/6/2017').getTime(),
        //   x2: new Date('1/19/2018').getTime(),
        //   y: 7,
        //   description: 'SHP'
        // }],
        dataLabels: {
          enabled: true,
          formatter: function () {
            // console.log(this);
            return this.point.shapeArgs.width >= 100 ? this.point.description : '';
          }
        }
      }]
    };


    Highcharts.chart('scheduleChart', this.chartOptions);


  }


  getBarColor(checkPoint: string, commit: boolean): string {
    switch (checkPoint) {
      case 'CON':
        return `rgba(67, 67, 72, ${commit ? '0.5' : '1'})`;  // black
      case 'INV':
        return `rgba(124, 181, 236, ${commit ? '0.5' : '1'})`;  // blue
      case 'DEF':
        return `rgba(247, 163, 92, ${commit ? '0.5' : '1'})`;  // orange
      case 'DEV':
        return `rgba(43, 144, 143, ${commit ? '0.5' : '1'})`;  // teal
      case 'SQ':
        return `rgba(241, 92, 128, ${commit ? '0.5' : '1'})`;  // pink
      case 'HQ':
        return `rgba(228, 211, 84, ${commit ? '0.5' : '1'})`;  // yellow
      case 'SHP':
        return `rgba(144, 237, 125, ${commit ? '0.5' : '1'})`;  // green
      default:
        return `rgba(124, 181, 236, ${commit ? '0.5' : '1'})`;  // blue
    }
  }

}
