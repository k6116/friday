import { Component, OnInit, OnDestroy, HostListener, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs/Subject';
import { ApiDataDashboardService } from '../_shared/services/api-data/_index';
import { ApiDataFteService } from '../_shared/services/api-data/api-data-fte.service';
import { AuthService } from '../_shared/services/auth.service';
import { ToolsService } from '../_shared/services/tools.service';
import { CacheService } from '../_shared/services/cache.service';
import { DashboardDonutService } from './services/dashboard-donut.service';
import { DashboardGaugeService } from './services/dashboard-gauge.service';
import { DashboardMessagesService } from './services/dashboard-messages.service';
import { DashboardParetoService } from './services/dashboard-pareto.service';
import { DashboardPieService } from './services/dashboard-pie.service';
import { DashboardStackedColumnService } from './services/dashboard-stacked-column.service';
import { DashboardTeamSelectService } from './services/dashboard-team-select.service';
import { TeamSelectModalComponent } from './modal/team-select-modal/team-select-modal.component';


declare var $: any;
declare var require: any;
import * as Highcharts from 'highcharts';
require('highcharts/modules/data.js')(Highcharts);
require('highcharts/modules/drilldown.js')(Highcharts);
require('highcharts/modules/no-data-to-display.js')(Highcharts);
require('highcharts/highcharts-more.js')(Highcharts);
require('highcharts/modules/solid-gauge.js')(Highcharts);
import * as moment from 'moment';


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css', '../_shared/styles/common.css'],
  providers: [DashboardDonutService, DashboardGaugeService, DashboardMessagesService, DashboardParetoService,
    DashboardPieService, DashboardStackedColumnService, DashboardTeamSelectService]
})
export class DashboardComponent implements OnInit, OnDestroy {

  @ViewChild(TeamSelectModalComponent)
  private teamSelectModalComponent: TeamSelectModalComponent;

  messages: any[] = [];
  dashboardData: any;
  showDashboard: boolean;
  showSpinner: boolean;
  completedFTEs: string;
  notCompletedFTEs: string;
  completedPrefix: string;
  notCompletedPrefix: string;
  displayProgressGauge: boolean;
  subscription1: Subscription;
  ngUnsubscribe = new Subject();
  chartsRendered: boolean;
  chartPie: any;
  chartDonut: any;
  chartStackedColumn: any;
  chartGauge: any;
  nestedManagerData: any = [];
  displayEditTeamButton: boolean;
  showTeamSelectModal: boolean;
  selectedChartForEdit: string;
  selectedManagerForPieChart: string; // email address of team manager for pie chart
  selectedManagerForStackedColumnChart: string; // email address of team manager for stacked column chart


  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.resizeChart();
  }

  // set up a document click hostlistener for the clickable message links
  @HostListener('document:click', ['$event.target'])
  onClick(targetElement) {
    // set the clicked element to a jQuery object
    const $targetElement = $(targetElement);
    // if the element has the message-link class, take some action
    if ($targetElement.hasClass('message-link')) {
      // get the action/method to call from the data-action attribute
      const action = $targetElement.data('action');
      // call the method
      this[action]();
    }
  }


  constructor(
    private router: Router,
    private apiDataDashboardService: ApiDataDashboardService,
    private apiDataFteService: ApiDataFteService,
    private authService: AuthService,
    private toolsService: ToolsService,
    private cacheService: CacheService,
    private dashboardDonutService: DashboardDonutService,
    private dashboardGaugeService: DashboardGaugeService,
    private dashboardMessagesService: DashboardMessagesService,
    private dashboardParetoService: DashboardParetoService,
    private dashboardPieService: DashboardPieService,
    private dashboardStackedColumnService: DashboardStackedColumnService,
    private dashboardTeamSelectService: DashboardTeamSelectService
  ) { }

  async ngOnInit() {

    // get dashboard data, then render dashboard
    this.getDashboardData();

    // listen for emitter to remove profile update message
    this.subscription1 = this.cacheService.profileHasBeenUpdated.subscribe(
      (profileHasBeenUpdated: boolean) => {
        this.removeProfileUpdateMessage();
    });

    // get management org structure for the manager select dropdown
    const nestedManagerData = await this.dashboardTeamSelectService.getNestedManagerStructure()
    .catch(err => {
      console.error(err);
    });
    this.nestedManagerData.push(nestedManagerData);

    // console.log('nested manager data in dashboard component:');
    // console.log(this.nestedManagerData);

    // console.log('logged in user:');
    // console.log(this.authService.loggedInUser);

    // display the edit team butons for the donut and stacked column chart
    // if the user is a manager or is an Admin
    if (this.authService.loggedInUser.isManager || this.authService.loggedInUser.roleName === 'Admin') {
      this.displayEditTeamButton = true;
    }

  }

  ngOnDestroy() {

    this.subscription1.unsubscribe();

    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();

  }

  getDashboardData() {

    // hide the footer until the page is ready to be rendered
    this.toolsService.hideFooter();

    // show the waiting to render spinner
    this.showSpinner = true;

    // get the current fiscal quarter's date range (array of two strings in the format 'MM-DD-YYYY')
    const fiscalQuarterRange = this.toolsService.fiscalQuarterRange(moment(), 'MM-DD-YYYY');

    // get the dashboard data from the database
    // returns as a single response array using forkjoin:
    // [fteData, firstLogin, projectRequests]
    this.apiDataDashboardService.getDashboardData(fiscalQuarterRange[0], fiscalQuarterRange[1])
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(
        res => {
          this.dashboardData = res;
          // console.log('dashboard data (using forkjoin):');
          // console.log(this.dashboardData);
          this.renderDashboard();
          this.showDashboard = true;
          this.showSpinner = false;
          // show the footer
          this.toolsService.showFooter();
        },
        err => {
          // console.log('error response from get dashboard data:');
          // console.log(err);
          this.showSpinner = false;
          // show the footer
          this.toolsService.showFooter();
          // TO-DO BILL: create function in tools service that takes err and handles it from there
          if (err.status === 401) {
            this.authService.logout(true);
            setTimeout(() => {
              this.toolsService.displayTokenError();
            }, 500);
          }
          // this.toolsService.displayTimeoutError();
        }
      );

  }

  renderDashboard() {
    this.displayMessages();
    this.renderPieChart(this.dashboardData[0]);
    // // this.renderParetoChart();
    this.renderDonutChart(this.dashboardData[0], `Your Team's FTEs by Project Type`);
    this.renderStackedColumnChart(this.dashboardData[0], `Your Team's FTEs by Project Type`);
    if (this.authService.loggedInUser.isManager) {
      this.displayProgressGauge = true;
      this.renderProgressGauge();
    } else {
      this.displayProgressGauge = false;
    }
    this.chartsRendered = true;

    // store the team manager's email address for the pie chart and stacked column chart
    this.selectedManagerForPieChart = this.authService.loggedInUser.managerEmailAddress;
    this.selectedManagerForStackedColumnChart = this.authService.loggedInUser.managerEmailAddress;

  }

  displayMessages() {
    this.messages = this.dashboardMessagesService.displayMessages(this.dashboardData);
  }

  renderPieChart(fteData: any) {
    const chartOptions = this.dashboardPieService.buildChartOptions(fteData);
    this.chartPie = Highcharts.chart('pieChart', chartOptions);
    setTimeout(() => {
      this.chartPie.reflow();
    }, 0);
  }

  renderDonutChart(fteData: any, title: string, selectedManager?: any) {
    const chartOptions = this.dashboardDonutService.buildChartOptions(fteData, title, selectedManager);
    this.chartDonut = Highcharts.chart('donutChart', chartOptions);
    setTimeout(() => {
      this.chartDonut.reflow();
    }, 0);
  }

  renderStackedColumnChart(fteData: any, title: string, selectedManager?: any) {
    const chartOptions = this.dashboardStackedColumnService.buildChartOptions(fteData, title, selectedManager);
    this.chartStackedColumn = Highcharts.chart('stackedColumnChart', chartOptions);
    setTimeout(() => {
      this.chartStackedColumn.reflow();
    }, 0);
  }

  renderProgressGauge() {
    const chart = this.dashboardGaugeService.buildChart(this.dashboardData[0]);
    this.completedFTEs = chart.completedFTEs;
    this.completedPrefix = 'Completed:';
    this.notCompletedFTEs = chart.notCompletedFTEs;
    this.notCompletedPrefix = 'Not Completed:';
    this.chartGauge = Highcharts.chart('progressGauge', chart.chartOptions);
    setTimeout(() => {
      this.chartGauge.reflow();
    }, 0);
  }

  renderParetoChart() {
    const chartOptions = this.dashboardParetoService.buildChartOptions(this.dashboardData[0]);
    Highcharts.chart('paretoChart', chartOptions);
  }

  removeProfileUpdateMessage() {
    // find the index of the object in the array, then slice it out of the array
    const index = this.messages.map(message => message.id).indexOf('updateProfileMessage');
    if (index !== -1) {
      this.messages.splice(index, 1);
    }
  }

  async onFTEEntriesClick() {

    // make an api call to get the JobTitleID and JobSubTitleID
    const res = await this.checkProfileIsUpdated()
      .catch(err => {
        // console.log('error getting data from check profile updated');
        // console.log(err);
      });

    // set the job title
    const jobTitle = res.jobTitle[0].JobTitleID;

    // set the path to navigate to
    const path = '/main/fte-entry/employee';

    // navigate to the fte entry route
    this.router.navigate([path]);

    // if the user has a job title, emit the path for the side-nav to pick up via subscription
    // in order to highlight the active menu item
    if (jobTitle) {
      this.cacheService.navigatedPath.emit(path);
    }

  }

  async checkProfileIsUpdated(): Promise<any> {
    return await this.apiDataFteService.checkJobTitleUpdated().toPromise();
  }

  onProfileLinkClick() {
    // emit a value for the top nav component to pick up via subscription
    // and show the profile modal
    this.cacheService.showProfileModal.emit(true);
  }

  onProjectPageLinkClick() {

    // set the path to navigate to
    const path = '/main/projects/my-projects';

    // navigate to the fte entry route
    this.router.navigate([path]);

    //  emit the path for the side-nav to pick up via subscription
    // in order to highlight the active menu item
    this.cacheService.navigatedPath.emit(path);

  }

  resizeChart() {

    // reflow the charts to its container during window resize
    if (this.chartPie) {
      this.chartPie.reflow();
    }
    if (this.chartDonut) {
      this.chartDonut.reflow();
    }
    if (this.chartStackedColumn) {
      this.chartStackedColumn.reflow();
    }
    if (this.chartGauge) {
      this.chartGauge.reflow();
    }

  }


  onEdiTeamClick(chart: string) {

    // console.log(`edit team button clicked for chart: ${chart}`);

    this.selectedChartForEdit = chart;

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

    if (selectedManager && this.selectedChartForEdit === 'donutChart') {
      this.updateDonutChart(selectedManager);
    } else if (selectedManager && this.selectedChartForEdit === 'stackedColumnChart') {
      this.updatedStackedColumnChart(selectedManager);
    }

  }

  async updateDonutChart(selectedManager: any) {

    // if the selected manager is the same that is currently displayed, stop here (return early)
    if (selectedManager.emailAddress === this.selectedManagerForPieChart) {
      // console.log('update donut chart aborted, same manager/team selected');
      return;
    }

    const fteData = await this.getFTEData(selectedManager)
    .catch(err => {
      console.error(err);
    });

    // console.log('response from get fte data for selected manager:');
    // console.log(fteData);

    // set the chart title
    let title;
    if (selectedManager.emailAddress === this.authService.loggedInUser.managerEmailAddress) {
      title = `Your Team's FTEs by Project Type`;
    } else {
      title = `${selectedManager.fullName}'s Team's FTEs by Project Type`;
    }

    this.renderDonutChart(fteData, title, selectedManager);

    this.selectedManagerForPieChart = selectedManager.emailAddress;

  }


  async updatedStackedColumnChart(selectedManager: any) {

    // if the selected manager is the same that is currently displayed, stop here (return early)
    if (selectedManager.emailAddress === this.selectedManagerForStackedColumnChart) {
      // console.log('update stacked aborted, same manager/team selected');
      return;
    }

    const fteData = await this.getFTEData(selectedManager)
    .catch(err => {
      console.error(err);
    });

    // console.log('response from get fte data for selected manager:');
    // console.log(fteData);

    // set the chart title
    let title;
    if (selectedManager.emailAddress === this.authService.loggedInUser.managerEmailAddress) {
      title = `Your Team's FTEs by Project`;
    } else {
      title = `${selectedManager.fullName}'s Team's FTEs by Project`;
    }

    this.renderStackedColumnChart(fteData, title, selectedManager);

    this.selectedManagerForStackedColumnChart = selectedManager.emailAddress;

  }


  getFTEData(selectedManager): Promise<any> {

    const fiscalQuarterRange = this.toolsService.fiscalQuarterRange(moment(), 'MM-DD-YYYY');

    return this.apiDataDashboardService.getFTEData(fiscalQuarterRange[0], fiscalQuarterRange[1], selectedManager.emailAddress).toPromise();

  }


}
