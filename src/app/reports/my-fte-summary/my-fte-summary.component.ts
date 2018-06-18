import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../../_shared/services/auth.service';
import { ApiDataReportService } from '../../_shared/services/api-data/_index';
import { Subscription } from 'rxjs/Subscription';

import * as Highcharts from 'highcharts';

declare var require: any;
declare const $: any;
const moment = require('moment');


// need to look into this.  requiring specific highcharts modules in this fashion can
// cause cross-component conflicts with 'issvg of undefined' error
// require('highcharts/modules/annotations')(Highcharts);

@Component({
  selector: 'app-my-fte-summary',
  templateUrl: './my-fte-summary.component.html',
  styleUrls: ['./my-fte-summary.component.css', '../../_shared/styles/common.css']
})
export class MyFteSummaryComponent implements OnInit, OnDestroy {

  summarySubscription: Subscription;
  chartIsLoading = true;
  fteSummaryData: any;

  timeSeriesChart: any;
  timeSeriesOptions: any;

  timePeriods = [
    {period: 'current-quarter', text: 'Current Quarter'},
    {period: 'current-fy', text: 'Current Fiscal Year'},
    {period: 'all-time', text: 'All Time'}
  ];

  constructor(
    private authService: AuthService,
    private apiDataReportService: ApiDataReportService
  ) { }

  ngOnInit() {
    this.getFteSummaryData('current-quarter');
  }

  ngOnDestroy() {
    if (this.summarySubscription) {
      this.summarySubscription.unsubscribe();
    }
    if (this.timeSeriesChart) {
      this.timeSeriesChart.destroy();
    }
  }

  getFteSummaryData(period: string) {
    this.chartIsLoading = true;
    // Retrieve Top FTE Project List
    this.summarySubscription = this.apiDataReportService.getMyFteSummary(this.authService.loggedInUser.id, period)
    .subscribe(
      res => {
        this.fteSummaryData = res;  // get summary data from db

        // total up the individual monthly FTEs into a project total
        let periodTotal = 0;
        this.fteSummaryData.forEach( project => {
          project.entries.forEach( entry => {
            project.fteTotal += entry.fte;
            periodTotal += entry.fte;
          });
        });

        this.fteSummaryData.forEach( project => {
          // parse FTE data from nested json object into timestamp:fte array pairs for Highcharts
          const singleProjectData = [];
          project.entries.forEach( entry => {
            singleProjectData.push([moment(entry.date).valueOf(), entry.fte]);
          });
          project.data = singleProjectData;
        });
        this.plotTimeSeries(period);
      },
      err => {
        console.log(err);
      }
    );
  }

  plotTimeSeries(period: string) {
    const timePeriod = this.timePeriods.find( obj => {
      return obj.period === period;
    });

    this.timeSeriesOptions = {
      credits: {
        text: 'jarvis.is.keysight.com',
        href: 'https://jarvis.is.keysight.com'
      },
      chart: {
        type: 'spline',
        height: 500
      },
      title: {
        text: `${this.authService.loggedInUser.fullName}'s Historic FTEs by project`
      },
      subtitle: {
        text: `Time Period: ${timePeriod.text}`
      },
      xAxis: {
        type: 'datetime'
      },
      yAxis: {
        title: {
          text: 'Monthly FTEs Recorded'
        }
      },
      tooltip: {
        crosshairs: true,
        shared: true
      },
      series: this.fteSummaryData
    };
    this.timeSeriesChart = Highcharts.chart('timeSeries', this.timeSeriesOptions);
    this.chartIsLoading = false;
  }

}
