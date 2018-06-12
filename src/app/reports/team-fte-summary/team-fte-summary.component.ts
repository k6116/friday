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
  userPlmData: any; // for logged in user's PLM info
  plmSubscription: Subscription;  // for fetching PLM data
  userIsManager: boolean; // store if the user is a manager (has subordinates) or not
  userIsManagerSubscription: Subscription;  // for fetching subordinate info

  chartIsLoading = true;  // display boolean for "Loading" spinner
  paretoChart: any; // chart obj
  paretoChartOptions: any;  // chart options
  paretoChartSubscription: Subscription;  // for subordinates roster under a given project

  teamSummaryData: any; // for teamwide FTE summary data
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
        let teamwideTotal = 0;
        this.teamSummaryData.forEach( project => {
          project.teamMembers.forEach( employee => {
            project.totalFtes += employee.fte;
            teamwideTotal += employee.fte;
          });
        });
        // convert each project's total FTEs to a percentage of the teamwide FTEs
        this.teamSummaryData.forEach( project => {
          project.teamwidePercents = 100 * project.totalFtes / teamwideTotal;
        });
        this.plotFteSummaryPareto(period);
      });
    });
  }

  plotFteSummaryPareto(period: string) {
    // get the requested time period string's index
    const timePeriod = this.timePeriods.find( obj => {
      return obj.period === period;
    });

    // sort the projects by highest total team FTEs
    this.teamSummaryData.sort( (a, b) => {
      return b.totalFtes - a.totalFtes;
    });

    // translate data from nested obj into flat arrays for highcharts pareto plotting
    const projectNames = [];
    const projectFTEs = [];
    const teamwidePercents = [];
    this.teamSummaryData.forEach( project => {
      projectFTEs.push({
        name: project.projectName,
        projectID: project.projectID,
        y: project.totalFtes
      });
      projectNames.push(project.projectName);
      teamwidePercents.push(project.teamwidePercents);
    });

    this.paretoChartOptions = {
      credits: {
        text: 'jarvis.is.keysight.com',
        href: 'https://jarvis.is.keysight.com'
      },
      chart: {
        height: 500
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
      yAxis: [
        { // primary y-axis
          title: {text: 'FTEs'}
        },
          { // secondary y-axis
          title: {text: 'Percent of Team'},
          labels: {format: '{value}%'},
          min: 0,
          max: 100,
          opposite: true
        }
      ],
      tooltip: {
        shared: true
      },
      series: [
        {
          name: 'Total Team FTEs',
          type: 'column',
          data: projectFTEs,
          tooltip: {
            pointFormat: `{series.name}: <b>{point.y:.1f}</b><br />`
          },
          point: {
            events: {
              click: function(e) {  // function if user clicks a point to display team members on selected project
                const p = e.point;
                this.displaySelectedProjectRoster = false;
                this.showSubordinateTeamRoster(p.projectID);
              }.bind(this)
            }
          }
        },
        {
          name: 'Percent of Team',
          type: 'spline',
          zIndex: 2,
          yAxis: 1,  // use secondary y-axis for the spline plot
          data: teamwidePercents,
          tooltip: {
            pointFormat: `{series.name}: <b>{point.y:.1f}%</b>`
          }
        }
      ]
    };
    this.paretoChart = Highcharts.chart('pareto', this.paretoChartOptions);
    this.chartIsLoading = false;
  }

  showSubordinateTeamRoster(projectID: number) {
    this.teamSummaryData.forEach( project => {
      // find the project that was clicked and store into selectedProject vars for display
      if (project.projectID === projectID) {
        this.selectedProject = project.projectName;
        this.selectedProjectRoster = project.teamMembers;
      }
    });
    this.displaySelectedProjectRoster = true;
  }
}
