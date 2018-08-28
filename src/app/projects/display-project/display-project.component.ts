import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CacheService } from '../../_shared/services/cache.service';
import { ApiDataProjectService } from '../../_shared/services/api-data/_index';

declare var require: any;
import * as Highcharts from 'highcharts';
// require('highcharts/modules/data.js')(Highcharts);
require('highcharts/modules/xrange.js')(Highcharts);
// require('highcharts/modules/accessibility.js')(Highcharts);
// require('highcharts/highcharts-more.js')(Highcharts);
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

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private cacheService: CacheService,
    private apiDataProjectService: ApiDataProjectService
  ) {

    // get the project id from the route params
    this.projectID = activatedRoute.snapshot.params['id'];

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


    if (this.cacheService.project) {

      this.project = this.cacheService.project;
      this.showPage = true;
      console.log('clicked project from the cache service');
      console.log(this.project);
      this.getRemainingData();

    } else {

      this.apiDataProjectService.getProject(this.projectID)
      .subscribe(
        res => {
          this.project = res[0];
          this.showPage = true;
          console.log('retrieved project from the api');
          console.log(this.project);
          this.getRemainingData();
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
          this.renderScheduleChart();
        },
        err => {
          // hide the spinner
          this.showSpinner = false;
        }
      );

  }


  renderScheduleChart() {


    // Investigate (INV)	5/13/2017
    // Define (DEF)	5/13/2017
    // Develop (DEV)	7/27/2017
    // Software Qualification (SQ)	10/6/2017
    // Hardware Qualification (HQ)	10/6/2017
    // Ship (SHP)	1/19/2018

    Highcharts.setOptions({
      global: {
        useUTC: false
      }
    });


    // set the chart options
    const chartOptions = {
      chart: {
        type: 'xrange'
      },
      title: {
        text: 'PLC Schedule'
      },
      legend: {
        enabled: false
      },
      xAxis: {
        type: 'datetime',
        minTickInterval: moment.duration(1, 'month').asMilliseconds(),
        gridLineWidth: 1
      },
      yAxis: {
        title: {
          text: ''
        },
        categories: ['Investigate (INV)', 'Define (DEF)', 'Develop (DEV)',
          'Software Qualification (SQ)', 'Hardware Qualification (HQ)', 'Ship (SHP)'],
        reversed: true,
        labels: {
          style: {
            color: 'black'
          }
        }
      },
      series: [{
        name: 'Baymax',
        // pointPadding: 0,
        // groupPadding: 0,
        borderColor: 'gray',
        pointWidth: 20,
        data: [{
          x: new Date('5/13/2017').getTime(),
          x2: new Date('5/14/2017').getTime(),
          y: 0,
          description: 'INV'
        }, {
          x: new Date('5/13/2017').getTime(),
          x2: new Date('7/27/2017').getTime(),
          y: 1,
          description: 'DEF'
        }, {
          x: new Date('7/27/2017').getTime(),
          x2: new Date('10/6/2017').getTime(),
          y: 2,
          description: 'DEV'
        }, {
          x: new Date('10/6/2017').getTime(),
          x2: new Date('1/19/2018').getTime(),
          y: 3,
          description: 'SQ'
        }, {
          x: new Date('10/6/2017').getTime(),
          x2: new Date('1/19/2018').getTime(),
          y: 4,
          description: 'HQ'
        }, {
          x: new Date('1/19/2018').getTime(),
          x2: new Date().getTime(),
          y: 5,
          description: 'SHP'
        }],
        dataLabels: {
          enabled: true,
          formatter: function () {
            // console.log(this);
            return this.point.shapeArgs.width >= 100 ? this.point.description : '';
          }
        },
        label: {
          enabled: false
        },
        marker: {
          enabled: false
        }
      }]
    };


    Highcharts.chart('scheduleChart', chartOptions);


  }

}
