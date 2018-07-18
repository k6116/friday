import { Component, OnInit, OnDestroy, EventEmitter } from '@angular/core';
import { ApiDataOrgService, ApiDataReportService } from '../../_shared/services/api-data/_index';
import { AuthService } from '../../_shared/services/auth.service';
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

  userIsManager: boolean; // store if the user is a manager (has subordinates) or not
  userIsManagerSubscription: Subscription;  // for fetching subordinate info
  managerEmail: string;

  teamOrgStructure: any;
  getOrgSubscription: Subscription;

  chartIsLoading = true;  // display boolean for "Loading" spinner
  paretoChart: any; // chart obj
  paretoChartOptions: any;  // chart options
  paretoChartSubscription: Subscription;  // for subordinates roster under a given project

  teamFteData: any;
  teamFteSubscription: Subscription;

  dataCompleteSubscription: Subscription;
  dataIsComplete = new EventEmitter;
  dataCounter = 0;

  teamSummaryData: any; // for teamwide FTE summary data
  displaySelectedProjectRoster = false;
  selectedProject: string;
  selectedProjectRoster: any;
  timePeriods = [
    {period: 'current-quarter', text: 'Current Quarter'},
    {period: 'current-fy', text: 'Current Fiscal Year'},
    {period: 'all-time', text: 'All Time'}
  ];

  constructor(
    private apiDataOrgService: ApiDataOrgService,
    private apiDataReportService: ApiDataReportService,
    private authService: AuthService
  ) { }

  ngOnInit() {
    // find out if user is a manager and store it for future display use
    this.userIsManagerSubscription = this.apiDataOrgService.getOrgData(this.authService.loggedInUser.email).subscribe( res => {
      // parse the json response. we only want the top level user, so use only the first index
      const userOrgData = JSON.parse('[' + res[0].json + ']')[0];
      this.userIsManager = userOrgData.numEmployees > 0 ? true : false;
      if (this.userIsManager) {
        this.managerEmail = this.authService.loggedInUser.email;
      } else {
        this.managerEmail = userOrgData.supervisorEmailAddress;
      }
      // then initialize the data for the report
      this.componentDataInit('current-quarter');
    });
  }

  ngOnDestroy() {
    // clean up the subscriptions
    if (this.userIsManagerSubscription) {
      this.userIsManagerSubscription.unsubscribe();
    }
    if (this.getOrgSubscription) {
      this.getOrgSubscription.unsubscribe();
    }
    if (this.teamFteSubscription) {
      this.teamFteSubscription.unsubscribe();
    }
    if (this.dataCompleteSubscription) {
      this.dataCompleteSubscription.unsubscribe();
    }
    if (this.paretoChartSubscription) {
      this.paretoChartSubscription.unsubscribe();
    }
    if (this.paretoChart) {
      this.paretoChart.destroy();
    }
  }

  componentDataInit(period: string) {

    this.dataCounter = 0;
    this.displaySelectedProjectRoster = false;
    this.chartIsLoading = true;

    this.getTeam(this.managerEmail);
    this.getTeamFtePareto(this.managerEmail, period);
    this.getTeamFteData(this.managerEmail, period);

    this.dataCompleteSubscription = this.dataIsComplete.subscribe( event => {
      if (event) {
        this.dataCounter++;
      }
      if (this.dataCounter === 2) {
        this.dataCounter = 0;
        this.dataCompleteSubscription.unsubscribe();
        this.showTeamFteTable();
      }
    });
  }

  getTeam(email: string) {
    // get list of subordinates
    this.getOrgSubscription = this.apiDataOrgService.getOrgData(email)
    .subscribe(
      res => {
        this.teamOrgStructure = JSON.parse('[' + res[0].json + ']')[0];
        this.dataIsComplete.emit(true); // send a message to listener that this piece of data has arrived
      },
      err => {
        console.error('error getting nested org data');
      }
    );
  }

  getTeamFteData(email: string, period: string) {
    // get sum of FTEs for selected time period for all subordinates (may be missing team members if they have no entries)
    this.teamFteSubscription = this.apiDataReportService.getSubordinateFtes(email, period)
    .subscribe( res => {
      this.teamFteData = res;
      this.dataIsComplete.emit(true);
    });
  }

  getTeamFtePareto(email: string, period: string) {
    // get nested project pareto with list of team members and their FTEs underneath each project
    this.paretoChartSubscription = this.apiDataReportService.getSubordinateProjectRoster(email, period)
    .subscribe( res => {
      this.teamSummaryData = res;
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
      console.log(this.teamSummaryData);
      this.plotFteSummaryPareto(period);
    });
  }

  showTeamFteTable() {
    // once data has all arrived, show the data
    // loop through the team roster and look for matches in the teamFtes data pull
    this.teamOrgStructure.employees.forEach( employee => {
      employee.fte = 0;
      this.teamFteData.forEach( teamFte => {
        // if there's a match, copy the value into the team org structure.  otherwise it will be initialized to 0
        if (employee.emailAddress === teamFte.EMAIL_ADDRESS) {
          employee.fte = teamFte.fte;
        }
      });
    });
    this.chartIsLoading = false;
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