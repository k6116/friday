import { Component, OnInit, OnDestroy } from '@angular/core';
import { ApiDataService } from '../../_shared/services/api-data.service';
import { AuthService } from '../../auth/auth.service';
import { User } from '../../_shared/models/user.model';
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

  loggedInUser: User; // object for logged in user's info
  summarySubscription: Subscription;
  chartIsLoading = true;
  pieChart: any;
  fteSummaryData: any;
  pieChartOptions: any;

  selectedProject: any;
  displaySummaryTable: boolean;
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
    this.displaySummaryTable = false;
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
  }

  getFteSummaryData(period: string) {
    this.chartIsLoading = true;
    // Retrieve Top FTE Project List
    this.summarySubscription = this.apiDataService.getMyFteSummary(this.loggedInUser.id, period)
    .subscribe(
      res => {
        this.fteSummaryData = res;  // get summary data from db

        // convert FTE values into percentages
        let periodTotal = 0;
        this.fteSummaryData.forEach( project => {
          project.entries.forEach( entry => {
            project.fteTotal += entry.fte;
            periodTotal += entry.fte;
          });
        });
        this.fteSummaryData.forEach( project => {
          project.y = project.fteTotal / periodTotal;
        });
        console.log(this.fteSummaryData);
        this.plotFteSummaryPie(period);
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
        text: `Time Period: ${timePeriod.text}`
      },
      tooltip: {
          pointFormat:
            `FTEs in Period: <b>{point.fteTotal}</b><br />
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
          name: 'Percent of Period',
          colorByPoint: true,
          data: this.fteSummaryData,
          point: {
            events: {
              click: function(e) {
                const p = e.point;
                this.displaySummaryTable = false;
                this.showSummaryTable(p.projectID);
              }.bind(this)
            }
          }
      }]
    };

    this.pieChart = Highcharts.chart('pie', this.pieChartOptions);
    this.chartIsLoading = false;
  }

  showSummaryTable(projectID: number) {
    this.fteSummaryData.forEach( project => {
      // find the project that was clicked
      if (project.projectID === projectID) {
        this.selectedProject = project;
      }
    });
    this.displaySummaryTable = true;
  }
}
