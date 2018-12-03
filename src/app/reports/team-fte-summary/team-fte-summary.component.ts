import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { ApiDataReportService } from '../../_shared/services/api-data/_index';
import { TeamFteSummaryTeamSelectService } from './services/team-fte-summary-team-select.service';
import { TeamFteSummaryTeamSelectModalComponent
  } from './modal/team-fte-summary-team-select-modal/team-fte-summary-team-select-modal.component';
import { AuthService } from '../../_shared/services/auth.service';
import * as Highcharts from 'highcharts';

declare var require: any;
declare const $: any;
require('highcharts/modules/pareto.js')(Highcharts);

@Component({
  selector: 'app-team-fte-summary',
  templateUrl: './team-fte-summary.component.html',
  styleUrls: ['./team-fte-summary.component.css', '../../_shared/styles/common.css'],
  providers: [TeamFteSummaryTeamSelectService]
})
export class TeamFteSummaryComponent implements OnInit, OnDestroy {

  @ViewChild(TeamFteSummaryTeamSelectModalComponent)
  private teamSelectModalComponent: TeamFteSummaryTeamSelectModalComponent;

  chartIsLoading = true;  // display boolean for "Loading" spinner
  paretoChart: any; // chart obj
  paretoChartOptions: any;  // chart options

  displayEditTeamButton: boolean;
  showTeamSelectModal: boolean;
  chartColumn: any;
  nestedManagerData: any = [];

  displaySelectedProjectRoster = false;
  teamSummaryData: any; // for teamwide FTE summary data
  selectedProject: string;
  selectedProjectRoster: any;

  timePeriods = [
    {period: 'current-quarter', text: 'Current Quarter'},
    {period: 'current-fy', text: 'Current Fiscal Year'},
    {period: 'all-time', text: 'All Time'}
  ];

  constructor(
    private apiDataReportService: ApiDataReportService,
    private teamFteSummaryTeamSelectService: TeamFteSummaryTeamSelectService,
    private authService: AuthService,
    ) {}

  async ngOnInit() {

    const period = 'current-quarter';

    if (this.authService.loggedInUser.isManager || this.authService.loggedInUser.roleName === 'Admin') {
      this.displayEditTeamButton = true;
    }

    // get management org structure for the manager select dropdown
    const nestedManagerData = await this.teamFteSummaryTeamSelectService.getNestedManagerStructure()
    .catch(err => {
      console.error(err);
    });
    this.nestedManagerData.push(nestedManagerData);

    // get nested project pareto with list of team members and their FTEs underneath each project
    this.teamSummaryData = await this.apiDataReportService.getSubordinateProjectRoster(period).toPromise();
  console.log('this.teamSummaryData', this.teamSummaryData)
    this.renderColumnChart(this.teamSummaryData, period);
  }

  ngOnDestroy() {
    // destroy the highchart if it exists
    if (this.paretoChart) {
      this.paretoChart.destroy();
    }
  }

  renderColumnChart(teamSummaryData: any, period: string, selectedManager?: any) {
    const chartOptions = this.buildChartOptions(teamSummaryData, period);
    this.chartColumn = Highcharts.chart('columnChart', chartOptions);
    setTimeout(() => {
      this.chartColumn.reflow();
    }, 0);
    this.chartIsLoading = false;
  }

  // take in the fte data and return the chart options for the stacked column chart
  // for the team ftes
  buildChartOptions(teamSummaryData: any, period: string): any {

    let teamwideTotal = 0;
    teamSummaryData.forEach( project => {
      project.teamMembers.forEach( employee => {
        project.totalFtes += employee.fte;
        teamwideTotal += employee.fte;
      });
    });
    // convert each project's total FTEs to a percentage of the teamwide FTEs
    teamSummaryData.forEach( project => {
      project.teamwidePercents = 100 * project.totalFtes / teamwideTotal;
    });


    // get the requested time period string's index
    const timePeriod = this.timePeriods.find( obj => {
      return obj.period === period;
    });

    // sort the projects by highest total team FTEs
    teamSummaryData.sort( (a, b) => {
      return b.totalFtes - a.totalFtes;
    });

    // translate data from nested obj into flat arrays for highcharts pareto plotting
    const projectNames = [];
    const projectFTEs = [];
    const teamwidePercents = [];
    teamSummaryData.forEach( project => {
      projectFTEs.push({
        name: project.projectName,
        projectID: project.projectID,
        y: project.totalFtes
      });
      projectNames.push(project.projectName);
      teamwidePercents.push(project.teamwidePercents);
    });

    // set the chart options
    const chartOptions = {
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
                this.showSubordinateTeamRoster(teamSummaryData, p.projectID);
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
    // return the chart options object
    return chartOptions;

    }

    showSubordinateTeamRoster(teamSummaryData: any, projectID: number) {
      teamSummaryData.forEach( project => {
        // find the project that was clicked and store into selectedProject vars for display
        if (project.projectID === projectID) {
          this.selectedProject = project.projectName;
          this.selectedProjectRoster = project.teamMembers;
        }
      });
      this.displaySelectedProjectRoster = true;
    }

  onEditTeamClick(chart: string) {

    // console.log(`edit team button clicked for chart: ${chart}`);

    this.showTeamSelectModal = true;

    // display the modal
    setTimeout(() => {
      $('#teamSelectModal').modal({
        backdrop: true,
        keyboard: true
      });
    }, 0);

    setTimeout(() => {
      this.teamSelectModalComponent.testViewChild();
      this.teamSelectModalComponent.setInitialDropDownEmployee(this.nestedManagerData[0]);
    }, 0);

  }

  onModalClose(selectedManager?: any) {

    // console.log('modal close event fired');
    $('#teamSelectModal').modal('hide');
    setTimeout(() => {
      $('#teamSelectModal').modal('dispose');
    }, 500);

    // console.log('selected manager:');
    // console.log(selectedManager);

    // this.updateColumnChart(selectedManager);

  }

  // async updateColumnChart(selectedManager: any) {

  //   // if the selected manager is the same that is currently displayed, stop here (return early)
  //   if (selectedManager.emailAddress === this.selectedManagerForStackedColumnChart) {
  //     // console.log('update stacked aborted, same manager/team selected');
  //     return;
  //   }

  //   const fteData = await this.getFTEData(selectedManager)
  //   .catch(err => {
  //     console.error(err);
  //   });

  //   // console.log('response from get fte data for selected manager:');
  //   // console.log(fteData);

  //   // set the chart title
  //   let title;
  //   if (selectedManager.emailAddress === this.authService.loggedInUser.managerEmailAddress) {
  //     title = `Your Team's FTEs by Project`;
  //   } else {
  //     title = `${selectedManager.fullName}'s Team's FTEs by Project`;
  //   }

  //   this.renderColumnChart(period, selectedManager);

  //   this.selectedManagerForStackedColumnChart = selectedManager.emailAddress;

  // }

}
