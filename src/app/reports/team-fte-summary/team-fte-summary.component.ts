import { Component, OnInit, OnDestroy, EventEmitter, HostListener } from '@angular/core';
import { ApiDataOrgService, ApiDataReportService } from '../../_shared/services/api-data/_index';
import { AuthService } from '../../_shared/services/auth.service';
import { CacheService } from '../../_shared/services/cache.service';
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

  loggedInUserEmail: any;
  orgDropdownViewPermissions: any;

  userIsManager: boolean; // store if the user is a manager (has subordinates) or not
  userIsManagerSubscription: Subscription;  // for fetching subordinate info
  managerEmail: string;

  chartIsLoading = true;  // display boolean for "Loading" spinner
  paretoChart: any; // chart obj
  paretoChartOptions: any;  // chart options
  paretoChartSubscription: Subscription;  // for subordinates roster under a given project

  teamSummaryData: any; // for teamwide FTE summary data
  displaySelectedProjectRoster = false;
  selectedProject: string;
  selectedProjectRoster: any;
  timePeriods = [
    {period: 'current-quarter', text: 'Current Quarter'},
    {period: 'current-fy', text: 'Current Fiscal Year'},
    {period: 'all-time', text: 'All Time'}
  ];


  nestedOrgData: any;
  flatOrgData: any;
  subscription1: Subscription;
  waitingForOrgData: boolean;
  displayOrgDropDown: boolean;
  displayedEmployee: any;
  displayResults: boolean;
  employeeElements: any;
  dropDownDisplayedEmployee: string;
  quarterlyEmployeeFTETotals: any;
  currentFiscalQuarter: number;
  currentFiscalYear: number;



  constructor(
    private apiDataOrgService: ApiDataOrgService,
    private apiDataReportService: ApiDataReportService,
    private authService: AuthService,
    private cacheService: CacheService
  ) {
  }

  ngOnInit() {

    this.loggedInUserEmail = this.authService.loggedInUser.email;

    // find out if user is a manager and store it for future display use
    this.userIsManagerSubscription = this.apiDataOrgService.getOrgData(this.loggedInUserEmail).subscribe( res => {
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
    if (this.paretoChartSubscription) {
      this.paretoChartSubscription.unsubscribe();
    }
    if (this.paretoChart) {
      this.paretoChart.destroy();
    }

  }


  componentDataInit(period: string) {

    this.displaySelectedProjectRoster = false;
    this.chartIsLoading = true;

    this.getTeamFtePareto(this.managerEmail, period);

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
      // console.log(this.teamSummaryData);
      this.plotFteSummaryPareto(period);
      this.chartIsLoading = false;
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
        text: `My Team's Projects`
      },
      subtitle: {
        text: `Time Period: ${timePeriod.text}`
      },
      xAxis: {
        categories: projectNames
      },
      yAxis: [
        { // primary y-axis
          title: {text: 'FTEs per month'}
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
          name: 'Total Team FTEs per month',
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
