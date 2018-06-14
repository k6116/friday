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

  // userPlmData: any; // for logged in user's PLM info
  // plmSubscription: Subscription;  // for fetching PLM data
  userIsManager: boolean; // store if the user is a manager (has subordinates) or not
  userIsManagerSubscription: Subscription;  // for fetching subordinate info

  teamOrgStructure: any;

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
  displaySelectedProjectRoster: boolean;
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
    this.displaySelectedProjectRoster = false;

    // find out if user is a manager, too
    this.userIsManagerSubscription = this.apiDataOrgService.getOrgData(this.authService.loggedInUser.email).subscribe( res => {
      // parse the json response. we only want the top level user, so use only the first index
      const userOrgData = JSON.parse('[' + res[0].json + ']')[0];
      this.userIsManager = userOrgData.numEmployees > 0 ? true : false;
      if (this.userIsManager) {
        this.getTeam(this.authService.loggedInUser.email);
        this.getTeamFtePareto(this.authService.loggedInUser.email, 'current-quarter');
        this.getTeamFteData(this.authService.loggedInUser.email, 'current-quarter');
      } else {
        this.getTeam(userOrgData.supervisorEmailAddress);
        this.getTeamFtePareto(userOrgData.supervisorEmailAddress, 'current-quarter');
        this.getTeamFteData(userOrgData.supervisorEmailAddress, 'current-quarter');
      }

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
    });

  }

  ngOnDestroy() {
    // clean up the subscriptions
    // if (this.plmSubscription) {
    //   this.plmSubscription.unsubscribe();
    // }
    if (this.paretoChartSubscription) {
      this.paretoChartSubscription.unsubscribe();
    }
    if (this.paretoChart) {
      this.paretoChart.destroy();
    }
    if (this.userIsManagerSubscription) {
      this.userIsManagerSubscription.unsubscribe();
    }
    if (this.dataCompleteSubscription) {
      this.dataCompleteSubscription.unsubscribe();
    }
  }

  getTeam(email: string) {
    this.apiDataOrgService.getOrgData(email)
    .subscribe(
      res => {
        this.teamOrgStructure = JSON.parse('[' + res[0].json + ']')[0];
        console.log(this.teamOrgStructure);
        this.dataIsComplete.emit(true);
      },
      err => {
        console.error('error getting nested org data');
      }
    );
  }

  getTeamFteData(email: string, period: string) {
    this.paretoChartSubscription = this.apiDataReportService.getSubordinateFtes(email, period)
    .subscribe( res => {
      this.teamFteData = res;
      console.log(this.teamFteData);
      this.dataIsComplete.emit(true);
    });
  }

  getTeamFtePareto(email: string, period: string) {
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
    console.log('made it here');
    console.log(this.teamOrgStructure);
  }

  // getTeamSummaryData(period: string) {
  //   this.chartIsLoading = true;
  //   this.plmSubscription = this.apiDataService.getUserPLMData(this.authService.loggedInUser.email).subscribe( res => {
  //     this.userPlmData = res[0];
  //     // if user is a manager, roll up their subordinates' projects
  //     // if not, then roll up their manager's projects (their peers, for individual contributors)
  //     const queryEmail = this.userIsManager ? this.userPlmData.EMAIL_ADDRESS : this.userPlmData.SUPERVISOR_EMAIL_ADDRESS;
  //     this.paretoChartSubscription = this.apiDataService.getSubordinateProjectRoster(queryEmail, period)
  //     .subscribe( res2 => {
  //       this.teamSummaryData = res2;
  //       // total up the number of FTEs contributed to each project
  //       let teamwideTotal = 0;
  //       this.teamSummaryData.forEach( project => {
  //         project.teamMembers.forEach( employee => {
  //           project.totalFtes += employee.fte;
  //           teamwideTotal += employee.fte;
  //         });
  //       });
  //       // convert each project's total FTEs to a percentage of the teamwide FTEs
  //       this.teamSummaryData.forEach( project => {
  //         project.teamwidePercents = 100 * project.totalFtes / teamwideTotal;
  //       });
  //       this.plotFteSummaryPareto(period);
  //     });
  //   });
  // }

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
