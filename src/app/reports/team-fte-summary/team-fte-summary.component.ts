import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { ApiDataReportService } from '../../_shared/services/api-data/_index';
import { TeamFteSummaryTeamSelectService } from './services/team-fte-summary-team-select.service';
import { TeamFteSummaryTeamSelectModalComponent
  } from './modal/team-fte-summary-team-select-modal/team-fte-summary-team-select-modal.component';
import { AuthService } from '../../_shared/services/auth.service';
import * as Highcharts from 'highcharts';
import { blobToBinaryString } from 'blob-util';

declare var require: any;
declare const $: any;
require('highcharts/modules/pareto.js')(Highcharts);

@Component({
  selector: 'app-team-fte-summary',
  templateUrl: './team-fte-summary.component.html',
  styleUrls: ['./team-fte-summary.component.css', '../../_shared/styles/common.css'],
  providers: [TeamFteSummaryTeamSelectService]
})
export class TeamFteSummaryComponent implements OnInit {

  @ViewChild(TeamFteSummaryTeamSelectModalComponent)
  private teamFteSummaryTeamSelectModalComponent: TeamFteSummaryTeamSelectModalComponent;

  chartIsLoading = true;  // display boolean for "Loading" spinner
  displayEditTeamButton: boolean;
  displaySelectedProjectRoster = false;
  showTeamFteSummaryTeamSelectModal: boolean;
  nestedManagerData: any = [];
  chartColumn: any;
  chartTitle: string;

  teamSummaryData: any; // for teamwide FTE summary data
  teamSummaryData10: any; // for teamwide FTE summary data
  teamSummaryData50: any; // for teamwide FTE summary data
  teamSummaryDataFull: any; // for teamwide FTE summary data

  selectedProject: string;
  selectedProjectRoster: any;
  selectedManager: any;
  selectedManagerEmailAddress: any;
  selectedPeriod: string;
  excludeParentType: string; // if 'Program' is selected, will drill up all the way to program levels

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

    // initialize default vars
    this.selectedPeriod = 'current-quarter';
    this.excludeParentType = 'NULL';
    this.chartTitle = `My Team's Projects`;

    // Need to initialize this object with just checkAllTeams key
    this.selectedManager = {checkAllTeams: false};

    if (this.authService.loggedInUser.isManager || this.authService.loggedInUser.roleName === 'Admin') {
      this.displayEditTeamButton = true;
    }
    if (this.authService.loggedInUser.isManager) {
      this.selectedManagerEmailAddress = this.authService.loggedInUser.email;
    } else {
      this.selectedManagerEmailAddress = this.authService.loggedInUser.managerEmailAddress;
    }

    // get management org structure for the manager select dropdown
    const nestedManagerData = await this.teamFteSummaryTeamSelectService.getNestedManagerStructure()
    .catch(err => {
      console.error(err);
    });
    this.nestedManagerData.push(nestedManagerData);

    await this.getData(false);

    this.renderColumnChart(`My Team's Projects`);
  }

  async getData(renderOnly: boolean) {
    if (!renderOnly) {
      // get nested project pareto with list of team members and their FTEs underneath each project
      if (typeof this.selectedManager !== 'undefined' && this.selectedManager.checkAllTeams === true) {
        this.chartColumn.showLoading();
        this.teamSummaryDataFull = await this.apiDataReportService
          .getSubordinateDrillDownProjectRoster(this.excludeParentType, this.selectedManagerEmailAddress, this.selectedPeriod).toPromise();
        this.chartColumn.hideLoading();
      } else {
        this.teamSummaryDataFull = await this.apiDataReportService
          .getSubordinateProjectRoster(this.selectedManagerEmailAddress, this.selectedPeriod).toPromise();
      }
      this.updatedTeamSummaryDataProperties();
      this.teamSummaryData = JSON.parse(JSON.stringify(this.teamSummaryDataFull));

      // set the title of the chart
      if (this.selectedManagerEmailAddress === this.authService.loggedInUser.managerEmailAddress) {
        this.chartTitle = `My Team's Projects`;
      } else if (typeof this.selectedManager !== 'undefined' && this.selectedManager.checkAllTeams === true) {
        this.chartTitle = `${this.selectedManager.fullName}'s Team's Projects (Aggregated)`;
      } else if (this.selectedManager.checkAllTeams === false) {
        this.chartTitle = `${this.selectedManager.fullName}'s Team's Projects`;
      }
    }

    this.renderColumnChart(this.chartTitle);

  }

  updatedTeamSummaryDataProperties() {
    let teamwideTotal = 0;
    this.teamSummaryDataFull.forEach( project => {
      project.teamMembers.forEach( employee => {
        project.totalFtes += employee.fte;
        teamwideTotal += employee.fte;
      });
    });

    // convert each project's total FTEs to a percentage of the teamwide FTEs
    this.teamSummaryDataFull.forEach( project => {
      project.teamwidePercents = 100 * project.totalFtes / teamwideTotal;
    });

    // sort the projects by highest total team FTEs
    this.teamSummaryDataFull.sort( (a, b) => {
      return b.totalFtes - a.totalFtes;
    });

  }

  renderColumnChart(title: string, selectedManager?: any) {
    this.displaySelectedProjectRoster = false;
    const chartOptions = this.buildChartOptions(this.selectedPeriod, title);
    this.chartColumn = Highcharts.chart('columnChart', chartOptions);
    setTimeout(() => {
      this.chartColumn.reflow();
    }, 0);
    this.chartIsLoading = false;
  }

  async onDateRangeChange(period: string) {
    this.selectedPeriod = period;
    await this.getData(false);
  }

  // take in the fte data and return the chart options for the stacked column chart
  // for the team ftes
  buildChartOptions(period: string, title: string): any {

    // get the requested time period string's index
    const timePeriod = this.timePeriods.find( obj => {
      return obj.period === period;
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
        text: title
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

    // return the chart options object
    return chartOptions;

    }

  showSubordinateTeamRoster(projectID: number) {
    this.teamSummaryDataFull.forEach( project => {
      // find the project that was clicked and store into selectedProject vars for display
      if (project.projectID === projectID) {
        // project.teamMembers.forEach( emp => {
        //   emp.fte = emp.fte * 100 + '%';
        // });
        this.selectedProject = project.projectName;
        this.selectedProjectRoster = project.teamMembers;
      }
    });
    this.displaySelectedProjectRoster = true;
  }

  onEditTeamClick() {

    // console.log(`edit team button clicked for chart: ${chart}`);

    this.showTeamFteSummaryTeamSelectModal = true;

    // display the modal
    setTimeout(() => {
      $('#teamFteSummaryTeamSelectModal').modal({
        backdrop: true,
        keyboard: true
      });
    }, 0);

    setTimeout(() => {
      this.teamFteSummaryTeamSelectModalComponent.testViewChild();
      this.teamFteSummaryTeamSelectModalComponent.setInitialDropDownEmployee(this.nestedManagerData[0]);
    }, 0);

  }

  onModalClose(selectedManager?: any) {

    // console.log('modal close event fired');
    $('#teamFteSummaryTeamSelectModal').modal('hide');
    setTimeout(() => {
      $('#teamFteSummaryTeamSelectModal').modal('dispose');
    }, 500);

    // console.log('selected manager:', selectedManager);

    if (selectedManager) {
      this.updateColumnChart(selectedManager);
    }

  }

  async updateColumnChart(selectedManager: any) {

    // if the selected manager is the same that is currently displayed, stop here (return early)
    if (selectedManager.emailAddress === this.selectedManagerEmailAddress
        && selectedManager.checkAllTeams === this.selectedManager.checkAllTeams) {
      // console.log('update stacked aborted, same manager/team selected');
      return;
    }

    this.selectedManager = JSON.parse(JSON.stringify(selectedManager));
    this.selectedManagerEmailAddress = selectedManager.emailAddress;

    await this.getData(false);
  }

  onTopProjectsSelected(event: any) {
    const top10count = this.teamSummaryDataFull.length * 0.10;
    const top50count = this.teamSummaryDataFull.length * 0.50;

    this.teamSummaryData10 = this.teamSummaryDataFull.slice(0, top10count);
    this.teamSummaryData50 = this.teamSummaryDataFull.slice(0, top50count);

    const selected = event.target.id;
    if (selected === 'top10') {
      this.teamSummaryData = JSON.parse(JSON.stringify(this.teamSummaryData10));
    } else if (selected === 'top50') {
      this.teamSummaryData = JSON.parse(JSON.stringify(this.teamSummaryData50));
    } else if (selected === 'all') {
      this.teamSummaryData = JSON.parse(JSON.stringify(this.teamSummaryDataFull));
    }

    this.getData(true);
  }

  async onMaxParentSelected(event: any) {
    const selected = event.target.id;
    if (selected === 'program') {
      this.excludeParentType = 'NULL';
    } else {
      this.excludeParentType = 'Program';
    }

    await this.getData(false);

    // Reset toggle to Show All
    $('#option1').click();
  }

  onToggleTypeMouseEnter(event: any) {

    const selected = event.target.id;

    const options = {
      title: 'Aggregate data to the ' + selected.toUpperCase() + ' level',
      placement: 'top'
    };

    $('label.tooltip-' + selected).tooltip(options);
    $('label.tooltip-' + selected).tooltip('show');

  }

  onToggleTypeMouseLeave(event: any) {
    const selected = event.target.id;
    $('label.tooltip-' + selected).tooltip('dispose');
  }

}
