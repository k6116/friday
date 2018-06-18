import { Component, OnInit } from '@angular/core';
import { AppDataService } from '../_shared/services/app-data.service';
import { ApiDataOrgService, ApiDataReportService } from '../_shared/services/api-data/_index';
import { AuthService } from '../_shared/services/auth.service';

import * as highcharts from 'highcharts';
import * as moment from 'moment';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css', '../_shared/styles/common.css']
})
export class DashboardComponent implements OnInit {

  dashboardFTEData: any;
  chartOptions: any;

  constructor(
    private appDataService: AppDataService,
    private apiDataReportService: ApiDataReportService,
    private apiDataOrgService: ApiDataOrgService,
    private authService: AuthService
  ) { }

  ngOnInit() {

    const currentTime = moment();

    console.log('current time');
    console.log(currentTime);

    // format: 2013-02-08

    // console.log(moment('2018-11-06'));
    this.fiscalQuarter(moment('2017-10-31'));

    this.startOfYear(moment());
    this.endOfYear(moment());
    this.currentYearMonths(moment());

    this.apiDataReportService.getDashboardFTEData(this.authService.loggedInUser.email, '06-01-2018', '10-01-2018')
      .subscribe(
        res => {
          console.log('dashboard data:');
          console.log(res);
          this.dashboardFTEData = res;
          this.renderMYFTEsPieChart();
        },
        err => {
          console.log(err);
        }
      );

  }

  renderMYFTEsPieChart() {

    this.chartOptions = {
      chart: {
        plotBackgroundColor: null,
        plotBorderWidth: null,
        plotShadow: false,
        type: 'pie',
        height: '75%'
      },
      title: {
        text: `${this.authService.loggedInUser.fullName}'s FTEs`
      },
      subtitle: {
        text: 'Current Fiscal Quarter: 5/1/18 - 8/1/18'
      },
      credits: {
        text: 'jarvis.is.keysight.com',
        href: 'https://jarvis.is.keysight.com'
      },
      tooltip: {
        pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
      },
      plotOptions: {
        pie: {
          allowPointSelect: true,
          cursor: 'pointer',
          dataLabels: {
            enabled: true,
            format: '<b>{point.name}</b>: {point.percentage:.1f} %'
          }
        }
      },
      series: [{
        name: 'FTE %',
        colorByPoint: true,
          data: [{
              name: 'Chrome',
              y: 61.41,
              sliced: true,
              selected: true
          }, {
              name: 'Internet Explorer',
              y: 11.84
          }, {
              name: 'Firefox',
              y: 10.85
          }, {
              name: 'Edge',
              y: 4.67
          }, {
              name: 'Safari',
              y: 4.18
          }, {
              name: 'Sogou Explorer',
              y: 1.64
          }, {
              name: 'Opera',
              y: 1.6
          }, {
              name: 'QQ',
              y: 1.2
          }, {
              name: 'Other',
              y: 2.61
          }]
      }]
    };


    highcharts.chart('chart1', this.chartOptions);



  }

  fiscalQuarter(date: any) {
    const quarter = moment(date).add(2, 'months').quarter();
    const month = moment(date).month() + 1;  // need to add 1 since months are zero indexed
    // console.log(`month: ${month}`);
    const year = moment(date).year();
    // console.log(`year: ${year}`);
    const fiscalYear = month >= 11 ? year + 1 : year;
    console.log(`fiscal quarter: Q${quarter} ${fiscalYear}`);
  }

  startOfYear(date: any) {
    const year = moment(date).year();
    const startOfYear = moment(`${year}-01-01`);
    console.log(`start of year: ${startOfYear.format('dddd, MMMM Do YYYY, h:mm:ss a')}`);
  }

  endOfYear(date: any) {
    const year = moment(date).year();
    const endOfYear = moment(`${year + 1}-01-01`);
    console.log(`end of year: ${endOfYear.format('dddd, MMMM Do YYYY, h:mm:ss a')}`);
  }

  currentYearMonths(date: any) {
    const months = [];
    const year = moment(date).year();
    const startOfYear = moment(`${year}-01-01`);
    for (let i = 0; i < 12; i++) {
      const month = moment(`${year}-01-01`).add(i, 'months');
      months.push(month.format('MMM \'YY'));
    }
    console.log('months array');
    console.log(months);
  }


}
