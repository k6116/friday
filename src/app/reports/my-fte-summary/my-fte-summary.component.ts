import { Component, OnInit, OnDestroy } from '@angular/core';
import { ApiDataService } from '../../_shared/services/api-data.service';
import { AuthService } from '../../auth/auth.service';
import { User } from '../../_shared/models/user.model';
import { Subscription } from 'rxjs/Subscription';

import * as Highcharts from 'highcharts';

declare var require: any;
declare const $: any;
const moment = require('moment');
require('highcharts/modules/pareto.js')(Highcharts);


// need to look into this.  requiring specific highcharts modules in this fashion can
// cause cross-component conflicts with 'issvg of undefined' error
// require('highcharts/modules/annotations')(Highcharts);

@Component({
  selector: 'app-my-fte-summary',
  templateUrl: './my-fte-summary.component.html',
  styleUrls: ['./my-fte-summary.component.css', '../../_shared/styles/common.css']
})
export class MyFteSummaryComponent implements OnInit, OnDestroy {

  loggedInUser: User; // object for logged in user's info
  summarySubscription: Subscription;
  chartIsLoading = true;
  pieChart: any;
  paretoChart: any;
  fteSummaryData: any;
  pieChartOptions: any;
  paretoChartOptions: any;
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

  ngOnDestroy() {
    if (this.summarySubscription) {
      this.summarySubscription.unsubscribe();
    }
    if (this.pieChart) {
      this.pieChart.destroy();
    }
    if (this.paretoChart) {
      this.paretoChart.destroy();
    }
  }

  getFteSummaryData(period: string) {
    this.chartIsLoading = true;
    // Retrieve Top FTE Project List
    this.summarySubscription = this.apiDataService.getMyFteSummary(this.loggedInUser.id, period)
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
        this.plotFteSummaryPie(period);
        this.plotFteSummaryPareto(period);
      },
      err => {
        console.log(err);
      }
    );
  }


  plotFteSummaryPie(period: string) {
    const timePeriod = this.timePeriods.find( obj => {
      return obj.period === period;
    });

    this.pieChartOptions = {
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
      subtitle: {
        text: `${timePeriod.text}`
      },
      tooltip: {
          pointFormat:
            `FTEs Recorded: <b>{point.FTE}</b><br />
            {series.name}: <b>{point.percentage:.1f}%</b>`
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
          name: 'Percent of Total',
          colorByPoint: true,
          data: this.fteSummaryData
      }]
    };

    this.pieChart = Highcharts.chart('pie', this.pieChartOptions);
    this.chartIsLoading = false;
  }

  plotFteSummaryPareto(period: string) {
    const timePeriod = this.timePeriods.find( obj => {
      return obj.period === period;
    });

    const names = [];
    const values = [];
    this.fteSummaryData.forEach( project => {
      names.push(project.name);
      values.push(project.FTE);
    });

    this.paretoChartOptions = {
      credits: {
        text: 'jarvis.is.keysight.com',
        href: 'https://jarvis.is.keysight.com'
      },
      chart: {
        renderTo: 'pareto',
        type: 'column'
      },
      title: {
        text: `${this.loggedInUser.fullName}'s Historic FTE Pareto`
      },
      subtitle: {
        text: `${timePeriod.text}`
      },
      xAxis: {
        categories: names
      },
      yAxis: [{
        title: {text: 'FTEs'}
      },
      {
        title: {text: ''},
        minPadding: 0,
        maxPadding: 0,
        max: 100,
        min: 0,
        opposite: true,
        labels: {format: '{value}%'}
      }],
      series: [{
        type: 'pareto',
        name: 'Pareto',
        yAxis: 1,
        zIndex: 10,
        baseSeries: 1
      },
      {
        name: 'FTEs Recorded',
        type: 'column',
        colorByPoint: true,
        zIndex: 2,
        data: values
      }]
    };
    this.paretoChart = Highcharts.chart('pareto', this.paretoChartOptions);
  }

}
