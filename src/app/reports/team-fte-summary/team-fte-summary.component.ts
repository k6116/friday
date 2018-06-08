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

  loggedInUser: User; // object for logged in user's info
  userPlmData: any;
  plmSubscription: Subscription;
  userIsManager: boolean;
  userIsManagerSubscription: Subscription;

  chartIsLoading = true;
  paretoChart: any;
  paretoChartSubscription: Subscription;
  paretoChartOptions: any;

  teamSummaryData: any;
  displaySelectedProjectRoster: boolean;
  selectedProject: string;
  selectedProjectRoster: any;
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
      this.displaySelectedProjectRoster = false;

      // find out if user is a manager, too
      this.userIsManagerSubscription = this.apiDataService.getSubordinatesFlat(this.loggedInUser.email).subscribe( res => {
        if (res.length > 1) {
          this.userIsManager = true;
        } else {
          this.userIsManager = false;
        }
        this.getTeamSummaryData('current-quarter');
      });
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
    if (this.userIsManagerSubscription) {
      this.userIsManagerSubscription.unsubscribe();
    }
  }

  getTeamSummaryData(period: string) {
    this.chartIsLoading = true;
    this.plmSubscription = this.apiDataService.getUserPLMData(this.loggedInUser.email).subscribe( res => {
      this.userPlmData = res[0];
      // if user is a manager, roll up their subordinates' projects
      // if not, then roll up their manager's projects (their peers, for individual contributors)
      const queryEmail = this.userIsManager ? this.userPlmData.EMAIL_ADDRESS : this.userPlmData.SUPERVISOR_EMAIL_ADDRESS;
      this.paretoChartSubscription = this.apiDataService.getSubordinateProjectRoster(queryEmail, period)
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

    const projectNames = [];
    const columnData = [];
    this.teamSummaryData.forEach( project => {
      columnData.push({
        name: project.projectName,
        projectID: project.projectID,
        y: project.totalFtes
      });
      projectNames.push(project.projectName);
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
        text: this.userIsManager ? `My Team's Projects` : `My Peers' Projects`
      },
      subtitle: {
        text: `Time Period: ${timePeriod.text}`
      },
      xAxis: {
        categories: projectNames
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
        opposite: true
      }],
      series: [{
        type: 'pareto',
        name: 'Pareto',
        yAxis: 1,
        zIndex: 10,
        baseSeries: 1,
        tooltip: {
          valueSuffix: '%'
        }
      },
      {
        name: 'Total Team FTEs',
        type: 'column',
        colorByPoint: true,
        zIndex: 2,
        data: columnData,
        point: {
          events: {
            click: function(e) {
              const p = e.point;
              this.displaySelectedProjectRoster = false;
              this.showSubordinateTeamRoster(p.projectID);
            }.bind(this)
          }
        }
      }]
    };
    this.paretoChart = Highcharts.chart('pareto', this.paretoChartOptions);
    this.chartIsLoading = false;
  }

  showSubordinateTeamRoster(projectID: number) {
    this.teamSummaryData.forEach( project => {
      // find the project that was clicked
      if (project.projectID === projectID) {
        this.selectedProject = project.projectName;
        this.selectedProjectRoster = project.teamMembers;
      }
    });
    console.log(this.selectedProjectRoster);
    this.displaySelectedProjectRoster = true;
  }
}
