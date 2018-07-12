import { Component, OnInit } from '@angular/core';
import { ApiDataDashboardService } from '../_shared/services/api-data/_index';
import { AuthService } from '../_shared/services/auth.service';
import { ToolsService } from '../_shared/services/tools.service';
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


  constructor(
    private apiDataDashboardService: ApiDataDashboardService,
    private authService: AuthService,
    private toolsService: ToolsService,
    private dashboardDonutService: DashboardDonutService,
    private dashboardGaugeService: DashboardGaugeService,
    private dashboardMessagesService: DashboardMessagesService,
    private dashboardParetoService: DashboardParetoService,
    private dashboardPieService: DashboardPieService,
    private dashboardStackedColumnService: DashboardStackedColumnService
  ) { }

  ngOnInit() {

    // show the waiting to render spinner
    this.showSpinner = true;

    // get the current fiscal quarter's date range (array of two strings in the format 'MM-DD-YYYY')
    const fiscalQuarterRange = this.toolsService.fiscalQuarterRange(moment(), 'MM-DD-YYYY');

    // get the dashboard data from the database
    // returns as a single response array using forkjoin:
    // [fteData, firstLogin, projectRequests]
    this.apiDataDashboardService.getDashboardData(this.authService.loggedInUser.email, fiscalQuarterRange[0], fiscalQuarterRange[1],
      this.authService.loggedInUser.userName, this.authService.loggedInUser.id)
      .subscribe(
        res => {
          console.log('dashboard data:');
          console.log(res);
          this.dashboardData = res;
          this.renderDashboard();
          this.showDashboard = true;
          this.showSpinner = false;
        },
        err => {
          console.log(err);
          this.showSpinner = false;
          this.toolsService.displayTimeoutError();
        }
      );

  }

  renderDashboard() {
    this.displayMessages();
    this.renderPieChart();
    // this.renderParetoChart();
    this.renderProgressGauge();
    this.renderDonutChart();
    this.renderStackedColumnChart();
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
    this.notCompletedFTEs = chart.notCompletedFTEs;
    Highcharts.chart('progressGauge', chart.chartOptions);
  }

  renderDonutChart() {
    const chartOptions = this.dashboardDonutService.buildChartOptions(this.dashboardData[0]);
    Highcharts.chart('donutChart', chartOptions);
  }

  renderStackedColumnChart() {
    const chartOptions = this.dashboardStackedColumnService.buildChartOptions(this.dashboardData[0]);
    Highcharts.chart('stackedColumnChart', chartOptions);
  }


}
