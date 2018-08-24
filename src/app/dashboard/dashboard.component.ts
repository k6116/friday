import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { ApiDataDashboardService } from '../_shared/services/api-data/_index';
import { AuthService } from '../_shared/services/auth.service';
import { ToolsService } from '../_shared/services/tools.service';
import { CacheService } from '../_shared/services/cache.service';
import { DashboardDonutService } from './dashboard-donut.service';
import { DashboardGaugeService } from './dashboard-gauge.service';
import { DashboardMessagesService } from './dashboard-messages.service';
import { DashboardParetoService } from './dashboard-pareto.service';
import { DashboardPieService } from './dashboard-pie.service';
import { DashboardStackedColumnService } from './dashboard-stacked-column.service';


declare var require: any;
import * as Highcharts from 'highcharts';
require('highcharts/modules/data.js')(Highcharts);
require('highcharts/modules/drilldown.js')(Highcharts);
require('highcharts/modules/no-data-to-display.js')(Highcharts);
require('highcharts/highcharts-more.js')(Highcharts);
require('highcharts/modules/solid-gauge.js')(Highcharts);
import * as moment from 'moment';


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css', '../_shared/styles/common.css'],
  providers: [DashboardDonutService, DashboardGaugeService, DashboardMessagesService, DashboardParetoService,
    DashboardPieService, DashboardStackedColumnService]
})
export class DashboardComponent implements OnInit {

  messages: any[] = [];
  dashboardData: any;
  showDashboard: boolean;
  showSpinner: boolean;
  completedFTEs: string;
  notCompletedFTEs: string;
  completedPrefix: string;
  notCompletedPrefix: string;
  displayProgressGauge: boolean;
  subscription1: Subscription;


  constructor(
    private apiDataDashboardService: ApiDataDashboardService,
    private authService: AuthService,
    private toolsService: ToolsService,
    private cacheService: CacheService,
    private dashboardDonutService: DashboardDonutService,
    private dashboardGaugeService: DashboardGaugeService,
    private dashboardMessagesService: DashboardMessagesService,
    private dashboardParetoService: DashboardParetoService,
    private dashboardPieService: DashboardPieService,
    private dashboardStackedColumnService: DashboardStackedColumnService
  ) { }

  ngOnInit() {

    // get dashboard data, then render dashboard
    this.getDashboardData();

    // listen for emitter to remove profile update message
    this.subscription1 = this.cacheService.profileHasBeenUpdated.subscribe(
      (profileHasBeenUpdated: boolean) => {
        this.removeProfileUpdateMessage();
    });

  }

  getDashboardData() {

    // hide the footer until the page is ready to be rendered
    this.toolsService.hideFooter();

    // show the waiting to render spinner
    this.showSpinner = true;

    // get the current fiscal quarter's date range (array of two strings in the format 'MM-DD-YYYY')
    const fiscalQuarterRange = this.toolsService.fiscalQuarterRange(moment(), 'MM-DD-YYYY');

    // get the dashboard data from the database
    // returns as a single response array using forkjoin:
    // [fteData, firstLogin, projectRequests]
    this.apiDataDashboardService.getDashboardData(fiscalQuarterRange[0], fiscalQuarterRange[1])
      .subscribe(
        res => {
          // console.log('dashboard data:');
          // console.log(res);
          this.dashboardData = res;
          this.renderDashboard();
          this.showDashboard = true;
          this.showSpinner = false;
          // show the footer
          this.toolsService.showFooter();
        },
        err => {
          // console.log('error response from get dashboard data:');
          // console.log(err);
          this.showSpinner = false;
          // show the footer
          this.toolsService.showFooter();
          // TO-DO BILL: create function in tools service that takes err and handles it from there
          if (err.status === 401) {
            this.authService.logout(true);
            setTimeout(() => {
              this.toolsService.displayTokenError();
            }, 500);
          }
          // this.toolsService.displayTimeoutError();
        }
      );

  }

  renderDashboard() {
    this.displayMessages();
    this.renderPieChart();
    // // this.renderParetoChart();
    this.renderDonutChart();
    this.renderStackedColumnChart();
    if (this.authService.loggedInUser.isManager) {
      this.displayProgressGauge = true;
      this.renderProgressGauge();
    } else {
      this.displayProgressGauge = false;
    }
  }

  displayMessages() {
    this.messages = this.dashboardMessagesService.displayMessages(this.dashboardData);
  }

  renderPieChart() {
    const chartOptions = this.dashboardPieService.buildChartOptions(this.dashboardData[0]);
    Highcharts.chart('pieChart', chartOptions);
  }

  renderParetoChart() {
    const chartOptions = this.dashboardParetoService.buildChartOptions(this.dashboardData[0]);
    Highcharts.chart('paretoChart', chartOptions);
  }

  renderProgressGauge() {
    const chart = this.dashboardGaugeService.buildChart(this.dashboardData[0]);
    this.completedFTEs = chart.completedFTEs;
    this.completedPrefix = 'Completed:';
    this.notCompletedFTEs = chart.notCompletedFTEs;
    this.notCompletedPrefix = 'Not Completed:';
    Highcharts.chart('progressGauge', chart.chartOptions);
  }

  renderDonutChart() {
    const chartOptions = this.dashboardDonutService.buildChartOptions(this.dashboardData[0]);
    Highcharts.chart('donutChart', chartOptions);
  }

  renderStackedColumnChart() {
    // console.log('stacked column data');
    // console.log(this.dashboardData[0]);
    const chartOptions = this.dashboardStackedColumnService.buildChartOptions(this.dashboardData[0]);
    Highcharts.chart('stackedColumnChart', chartOptions);
  }

  removeProfileUpdateMessage() {
    // find the index of the object in the array, then slice it out of the array
    const index = this.messages.map(message => message.id).indexOf('updateProfileMessage');
    if (index !== -1) {
      this.messages.splice(index, 1);
    }
  }


}
