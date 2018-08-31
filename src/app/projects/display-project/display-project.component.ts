import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CacheService } from '../../_shared/services/cache.service';
import { ApiDataProjectService } from '../../_shared/services/api-data/_index';
import { ToolsService } from '../../_shared/services/tools.service';

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
  chartLabels: any;
  chartCategories: any;
  animateChart: boolean;
  showPlannedChecked: boolean;
  showActualsChecked: boolean;
  showLabels: boolean;
  timer: any;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private cacheService: CacheService,
    private apiDataProjectService: ApiDataProjectService,
    private toolsService: ToolsService
  ) {

    // get the project id from the route params
    this.projectID = activatedRoute.snapshot.params['id'];

    // initialize properties
    this.showSpinner = true;
    this.showPlannedChecked = true;
    this.showActualsChecked = true;
    this.showLabels = false;
    this.animateChart = true;

  }


  async ngOnInit() {

    // hide the footer until the page is ready to be rendered
    this.toolsService.hideFooter();

    // get all data for the page using forkjoin: project, schedule, and roster
    const res = await this.getData()
      .catch(err => {
        this.displayError(err);
      });

    // break here if there is no response (some error occured)
    if (!res) {
      return;
    }

    // store the data in component properties
    this.storeData(res);

    // hide the spinner
    this.showSpinner = false;

    // show the page
    this.showPage = true;

    // display the schedule gantt chart
    this.displayChart();

    // show the footer
    this.toolsService.showFooter();

  }


  async getData(): Promise<any> {

    return await this.apiDataProjectService.getProjectDisplayData(this.projectID).toPromise();

  }


  displayError(err) {

    // hide the spinner
    this.showSpinner = false;

    // build the error message
    // TO-DO BILL: make this adapt to other types of errors, not just sequelize
    const errorMessage = `<b>Message:</b>  ${err.json().title}; ${err.json().error.message.name};
      ${err.json().error.message.original.message}; Status Code: ${err.status}`;

    // display a bootstrap modal with the error message
    this.cacheService.confirmModalData.emit(
      {
        title: 'Error',
        message: `Oops, an error occured.  Please contact
          <a href="https://confluence.it.keysight.com/display/JARVIS/About+Jarvis">support</a>.<br><br>
          ${errorMessage}`,
        iconClass: 'fa-exclamation-triangle',
        iconColor: this.cacheService.alertIconColor,
        closeButton: true,
        allowOutsideClickDismiss: true,
        allowEscKeyDismiss: true,
        buttons: [
          {
            text: 'Ok',
            bsClass: 'btn-secondary',
            emit: false
          }
        ]
      }
    );

  }


  storeData(res) {

    // store the project
    this.project = res[0][0];

    // store the schedule if there is one
    if (res[1].length) {
      this.schedule = res[1];
    }

    // store the roster if there is one
    if (res[2][0].hasOwnProperty('teamMembers')) {
      this.roster = res[2][0].teamMembers;
    }

    // console.log('project:');
    // console.log(this.project);
    // console.log('schedule:');
    // console.log(this.schedule);
    // console.log('roster:');
    // console.log(this.roster);


  }


  displayChart() {

    this.chartCategories = this.buildChartCategories();
    this.chartData = this.buildChartData();
    this.chartLabels = this.buildChartLabels();

    setTimeout(() => {
      this.renderScheduleChart();
      this.animateChart = false;
    }, 0);

  }


  updateChart() {

    this.chartCategories = this.buildChartCategories();
    this.chartData = this.buildChartData();
    this.chartLabels = this.buildChartLabels();

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
              // console.log(`previous index for checkpoint ${checkPoint.PLCStatusName}:`);
              // console.log(prevIndex);
              const prevCheckpoint = this.schedule[prevIndex];
              // console.log(`previous checkpoint object for checkpoint ${checkPoint.PLCStatusName}:`);
              // console.log(prevCheckpoint);
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


  buildChartLabels(): any[] {

    const chartLabels = [];

    this.chartData.forEach(bar => {

      // console.log('bar object:');
      // console.log(bar);

      const labelObj = {
        point: {
          x: bar.x2,
          y: bar.y,
          xAxis: 0,
          yAxis: 0
        },
        text: moment(bar.x2).format('MMM D, YYYY')
      };

      chartLabels.push(labelObj);

    });

    return chartLabels;

  }


  onShowPlannedClick() {
    this.updateChart();
  }


  onShowActualsClick() {
    this.updateChart();
  }


  onShowLabelsClick() {
    this.renderScheduleChart();
  }


  renderScheduleChart() {

    // set global options
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
        spacingTop: 25,
        borderColor: 'rgb(211, 211, 211)',
        borderWidth: 1
      },
      title: {
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
        visible: this.showLabels,
        labels: this.chartLabels,
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
        dataLabels: {
          enabled: true,
          formatter: function () {
            // console.log(this);
            return this.point.shapeArgs.width >= 100 ? this.point.description : '';
          }
        }
      }]
    };

    // render the chart
    Highcharts.chart('scheduleChart', this.chartOptions);

  }


  onBackButtonClick() {

    this.router.navigate(['main/projects/search']);

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
