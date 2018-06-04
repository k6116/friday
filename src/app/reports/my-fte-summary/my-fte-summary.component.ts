import { Component, OnInit } from '@angular/core';
import { ApiDataService } from '../../_shared/services/api-data.service';
import { AuthService } from '../../auth/auth.service';
import { User } from '../../_shared/models/user.model';

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
export class MyFteSummaryComponent implements OnInit {

  loggedInUser: User; // object for logged in user's info
  fteSummaryData: any;
  chartOptions: any;
  timePeriods = [
    {period: 'current-quarter', text: 'Current Quarter'},
    {period: 'current-fy', text: 'Current Fiscal Year'},
    {period: 'all-time', text: 'All Time'}
  ];

  constructor(
    private apiDataService: ApiDataService,
    private authService: AuthService
  ) { }

  ngOnInit() {
    // get logged in user's info
    this.authService.getLoggedInUser((user, err) => {
      if (err) {
        // console.log(`error getting logged in user: ${err}`);
        return;
      }
      this.loggedInUser = user;
      this.getFteSummaryData('current-quarter');  // initialize the FTE entry component
    });

  }


  getFteSummaryData(period: string) {

    // Retrieve Top FTE Project List
    this.apiDataService.getMyFteSummary(this.loggedInUser.id, period)
    .subscribe(
      res => {
        this.fteSummaryData = res;  // get summary data from db

        // convert FTE values into percentages
        let totalFtes = 0;
        this.fteSummaryData.forEach( project => {
          totalFtes += +project.FTE;
        });
        this.fteSummaryData.forEach( project => {
          project.y = project.FTE / totalFtes;
        });
        console.log(this.fteSummaryData);
        this.plotFteSummaryData(period);
      },
      err => {
        console.log(err);
      }
    );
  }


  plotFteSummaryData(period: string) {
    this.chartOptions = {
      credits: {
        text: 'jarvis.is.keysight.com',
        href: 'https://jarvis.is.keysight.com'
      },
      chart: {
          type: 'pie'
      },
      title: {
          text: `${this.loggedInUser.fullName}'s Historic FTEs by project`
      },
      tooltip: {
          pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
      },
      plotOptions: {
          pie: {
              allowPointSelect: true,
              cursor: 'pointer',
              dataLabels: {
                  enabled: false
              },
              showInLegend: true
          }
      },
      series: [{
          name: 'FTE Allocation',
          colorByPoint: true,
          data: this.fteSummaryData
      }]
    };

    Highcharts.chart('container', this.chartOptions);
  }

}
