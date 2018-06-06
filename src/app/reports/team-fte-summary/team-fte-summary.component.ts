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

@Component({
  selector: 'app-team-fte-summary',
  templateUrl: './team-fte-summary.component.html',
  styleUrls: ['./team-fte-summary.component.css', '../../_shared/styles/common.css']
})
export class TeamFteSummaryComponent implements OnInit, OnDestroy {

  paretoChart: any;
  paretoChartSubscription: Subscription;
  plmSubscription: Subscription;
  loggedInUser: User; // object for logged in user's info
  paretoChartOptions: any;
  userPlmData: any;
  teamSummaryData: any;
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
      this.getTeamSummaryData('current-quarter');
    });
  }

  ngOnDestroy() {
    // clean up the subscriptions
    if (this.plmSubscription) {
      this.plmSubscription.unsubscribe();
    }
    if (this.paretoChartSubscription) {
      this.paretoChartSubscription.unsubscribe();
    }
    if (this.paretoChart) {
      this.paretoChart.destroy();
    }
  }

  getTeamSummaryData(period: string) {
    this.plmSubscription = this.apiDataService.getUserPLMData(this.loggedInUser.email).subscribe( res => {
      this.userPlmData = res[0];
      this.paretoChartSubscription = this.apiDataService.getSubordinateProjectRoster(this.userPlmData.SUPERVISOR_EMAIL_ADDRESS, period)
      .subscribe( res2 => {
        this.teamSummaryData = res2;
        // total up the number of FTEs contributed to each project
        this.teamSummaryData.forEach( project => {
          project.teamMembers.forEach( employee => {
            project.totalFtes += employee.fte;
          });
        });
        console.log(this.teamSummaryData);
        this.plotFteSummaryPareto(period);
      });
    });
  }

  plotFteSummaryPareto(period: string) {
    const timePeriod = this.timePeriods.find( obj => {
      return obj.period === period;
    });

    // sort the projects by highest total team FTEs
    this.teamSummaryData.sort( (a, b) => {
      return b.totalFtes - a.totalFtes;
    });

    // parse project names and FTEs from the nested object into flat arrays for pareto chart
    const names = [];
    const values = [];
    this.teamSummaryData.forEach( project => {
      names.push(project.projectName);
      values.push(project.totalFtes);
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
        text: `My Team's FTE Pareto`
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
        name: 'Team FTEs Recorded',
        type: 'column',
        colorByPoint: true,
        zIndex: 2,
        data: values
      }]
    };
    this.paretoChart = Highcharts.chart('pareto', this.paretoChartOptions);
  }
}
