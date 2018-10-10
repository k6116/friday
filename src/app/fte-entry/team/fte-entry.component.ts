import { Component, OnInit, ViewChild, AfterViewInit, OnDestroy, Input, ChangeDetectorRef } from '@angular/core';
import { FormGroup, FormArray, FormControl, Validators, FormBuilder } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import { HostListener } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';
import { forkJoin } from 'rxjs/observable/forkJoin';

import { AuthService } from '../../_shared/services/auth.service';
import { ApiDataProjectService, ApiDataFteService, ApiDataJobTitleService,
        ApiDataOrgService, ApiDataEmployeeService } from '../../_shared/services/api-data/_index';
import { CacheService } from '../../_shared/services/cache.service';
import { ToolsService } from '../../_shared/services/tools.service';
import { ComponentCanDeactivate } from '../../_shared/guards/unsaved-changes.guard';
import { TeamFTEs, AllocationsArray} from './fte-model';

import { ProjectsCreateModalComponent } from '../../modals/projects-create-modal/projects-create-modal.component';

import { IMultiSelectOption, IMultiSelectSettings, IMultiSelectTexts, MultiselectDropdownComponent } from 'angular-2-dropdown-multiselect';

import * as Highcharts from 'highcharts';

const moment = require('moment');
require('moment-fquarter');

declare const require: any;
declare const $: any;
declare const introJs: any;

@Component({
  selector: 'app-fte-entry-team',
  templateUrl: './fte-entry.component.html',
  styleUrls: ['./fte-entry.component.css', '../../_shared/styles/common.css'],
  providers: [DecimalPipe],
})
export class FteEntryTeamComponent implements OnInit, OnDestroy, ComponentCanDeactivate {

  // initialize variables
  deleteModalSubscription: Subscription;
  FTEFormGroup: FormGroup;
  newPlanForm: FormGroup;
  allTeamFTEs: any;
  teamFTEs: any;  // array to store team FTE data
  teamFTEsFlat: any;  // array to store team FTE data (flattened/non-treeized version)
  teamFTEsFlatLive: any;
  display: boolean; // TODO: find a better solution to FTE display timing issue
  displayFTETable = false;
  projects: any;  // for aliasing formarray
  allProjects: any;
  months: string[] = [];
  employeeTotals: number[];
  employeeTotalsValid: boolean[];
  showProjectsModal: boolean;
  projectList: any;
  timer: any;
  teamOrgStructure: any;
  filteredEmployees: any[] = [];
  displayEmployees: any[] = [];
  teamEditableMembers: string;
  currentMonth: any;
  currentMonthName: any;
  setMonth: any;
  setMonthName: any;
  setYear: any;
  setYearName: any;
  planList: any;
  defaultPlan: any;
  currentPlan: any;
  disablePreviousMonth: boolean;
  disableDeletePlan: boolean;
  FTEFormGroupLive: any;
  newPlanName: string;
  planNameRegex: any;
  employeeVisible = new Array;
  projectVisible = new Array;
  displayNewPlanModal: boolean;
  loginAsEmail: string;
  loginAsID: any;
  displayAdminViewMessage: boolean;
  launchDate: string;
  displaySyncNoticeButton: boolean;

  // Highchart Declarations
  ftePlanningChart: any;
  ftePlanningSeriesOptions: any;
  fteMonthsChart: string[] = [];
  fteChartData: any[] = [];

  // Multiselect Declarations
  filterProjectsModelStaging: any[] = [];
  filterProjectsOptionsStaging: any[] = [];
  filterEmployees: any[] = [];
  filterEmployeesModel: number[];
  filterEmployeesOptions: IMultiSelectOption[];
  filterEmployeesTexts: IMultiSelectTexts = {
    checkAll: 'Select all',
    uncheckAll: 'Unselect all',
    checked: 'employee selected',
    checkedPlural: 'employees selected',
    searchPlaceholder: 'Search Employees',
    searchEmptyResult: 'Nothing found...',
    searchNoRenderText: 'Type in search box to see results...',
    defaultTitle: 'Filter Employees',
    allSelected: 'All employees selected',
  };
  filterEmployeesSettings: IMultiSelectSettings = {
    showCheckAll: true,
    showUncheckAll: true,
    enableSearch: false,
    // checkedStyle: 'fontawesome',
    buttonClasses: 'btn btn-primary btn-block',
    dynamicTitleMaxItems: 0,
    displayAllSelectedText: true,
    maxHeight: '500px'
  };
  filterProjects: any[] = [];
  filterProjectsModel: number[];
  filterProjectsOptions: IMultiSelectOption[];
  filterProjectsTexts: IMultiSelectTexts = {
    checkAll: 'Select all',
    uncheckAll: 'Unselect all',
    checked: 'project selected',
    checkedPlural: 'projects selected',
    searchPlaceholder: 'Search Projects',
    searchEmptyResult: 'Nothing found...',
    searchNoRenderText: 'Type in search box to see results...',
    defaultTitle: 'Filter Projects',
    allSelected: 'All projects selected',
};
  filterProjectsSettings: IMultiSelectSettings = {
    showCheckAll: true,
    showUncheckAll: true,
    enableSearch: false,
    buttonClasses: 'btn btn-primary btn-block',
    dynamicTitleMaxItems: 0,
    displayAllSelectedText: true,
    maxHeight: '500px',
};

  @ViewChild(ProjectsCreateModalComponent) projectsCreateModalComponent;
  // Accessing the model to update the rendering manually because the author of this package never fixed a bug
  @ViewChild('filterEmployeesDropdown') filterEmployeesDropdown: MultiselectDropdownComponent;
  @ViewChild('filterProjectsDropdown') filterProjectsDropdown: MultiselectDropdownComponent;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private apiDataProjectService: ApiDataProjectService,
    private apiDataFteService: ApiDataFteService,
    private apiDataOrgService: ApiDataOrgService,
    private apiDataEmployeeService: ApiDataEmployeeService,
    private cacheService: CacheService,
    private toolsService: ToolsService,
    private decimalPipe: DecimalPipe,
    private changeDetectorRef: ChangeDetectorRef
  ) {


    // initialize the FTE formgroup
    this.FTEFormGroup = this.fb.group({
      FTEFormArray: this.fb.array([])
    });

    this.planNameRegex = /^[-a-zA-Z0-9.]+(\s+[-a-zA-Z0-9.]+)*$/;
    this.newPlanForm = this.fb.group({
      newPlanName: [null, [Validators.required, Validators.minLength(2), Validators.pattern(this.planNameRegex)]]
    });

    this.employeeTotals = new Array(36).fill(null);
    this.employeeTotalsValid = new Array(36).fill(true);

    this.changeDetectorRef.detach();
    this.timer = setInterval(() => {
      this.changeDetectorRef.detectChanges();
    }, 200);

    this.displayNewPlanModal = true;
  }

  // canDeactivate checks if the user has unsaved changes in the form and informs the router whether the user can leave
  // HostListener decorator is used to also pick up browser-level changes like refresh, close tab, etc
  @HostListener('window:beforeunload')
  canDeactivate(): Observable<boolean> | boolean {
    // returning true will navigate without confirmation
    // returning false will show a confirm dialog before navigating away
    if ($('#confirm-modal').is(':visible')) {
      // if the user is about to be routed away due to inactivity timeout, always allow deactivation
      return true;
    } else {
      // otherwise, allow immediate deactivation only if the form is untouched
      return this.FTEFormGroup.untouched;
    }
  }

  async ngOnInit() {
    this.filterEmployeesModel = [];
    this.filterEmployeesOptions = [];
    this.filterProjectsModel = [];
    this.filterProjectsOptions = [];

    // get the token from local storage
    // NOTE: we can count on the token being there; if it is not, the user would have been logged out already
    // with the AuthGuardService on the main route
    const token = localStorage.getItem('jarvisToken');

    // check if user has special admin permissions for team FTEs
    // NOTE: this must be done synchronously using async / await
    const permRes = await this.apiDataFteService.checkTeamFTEAdminPermission(token);

    if (permRes.length > 0) {
      this.loginAsEmail = this.authService.loggedInUser.managerEmailAddress;
      // this.loginAsEmail = 'ermina_chua@keysight.com';
      const res2 = await this.apiDataEmployeeService.getEmployeeData(this.loginAsEmail).toPromise();
      this.loginAsID = res2[0].EmployeeID;
      this.displayAdminViewMessage = true;
    } else {
      this.loginAsEmail = this.authService.loggedInUser.email;
      this.loginAsID = this.authService.loggedInUser.id;
    }

    this.getProjects();

    this.planLoadSequence();

    $('[data-toggle="tooltip"]').tooltip();

    // disable the previous button to prevent user from going into past months
    if (moment(this.setMonth) <= moment(this.currentMonth)) {
      this.disablePreviousMonth = true;
    } else {
      this.disablePreviousMonth = false;
    }
  }

  ngOnDestroy() {
    clearInterval(this.timer);
    this.changeDetectorRef.detach();
  }

  onTestFormClick() {
    // console.log('form object (this.form):');
    // console.log(this.FTEFormGroup);
    // console.log('this.FTEFormGroup.value.FTEFormArray', this.FTEFormGroup.value.FTEFormArray);
    // console.log('fte-project-visible array');
    // console.log('teamFTE', this.teamFTEs);
    // console.log('allTeamFTE', this.allTeamFTEs);
    // console.log('teamFTEFlat', this.teamFTEsFlat);
    // console.log('teamFTEFlatLive', this.teamFTEsFlatLive);
    // console.log('FTE Form Group LIVE', this.FTEFormGroupLive);
    // console.log('this.allProjects', this.allProjects)
    // console.log('this.projects', this.projects)
    // console.log('this.teamOrgStructure', this.teamOrgStructure);
    // console.log('this.filterEmployees', this.filterEmployees)
    // console.log('this.employeeVisible', this.employeeVisible)
    // console.log('this.fteMonthsChart', this.fteMonthsChart)
    // console.log('this.fteChartData', this.fteChartData)
    // console.log('this.employeeTotals', this.employeeTotals)
    // console.log('this.projectVisible', this.projectVisible)
    // console.log('this.filterProjects', this.filterProjects)
    // console.log('this.filterProjectsModel', this.filterProjectsModel)
    // console.log('this.filterProjectsOptions', this.filterProjectsOptions)
    // this.updateEmployeeTotals();
    // this.updateProjectFilters()

  }

  getProjects() {
    this.apiDataProjectService.getProjects()
    .subscribe(
      res => {
        this.projectList = res;
      },
      err => {
        console.log('get project data error:');
        console.log(err);
      }
    );
  }

  async planLoadSequence() {
    // First, get the list of Plans for current user and get all subordinates for current user
    // Second, retrieve data for that plan
    // If plan does not exist, create one
    // Promise.all allows us to run two functions asynchronously
    Promise.all([
      this.getPlanList(this.loginAsEmail),
      this.getTeam(this.loginAsEmail),
      this.setCurrentMonthYear()])
    .then(async res => {
        if (this.defaultPlan === undefined) {
          await this.onCreateNewPlanClick(this.teamEditableMembers, this.loginAsEmail, 'Plan 1');
          this.allProjects.forEach(proj => {
            this.projectVisible.push(true);
          });
        } else {
          await this.getPlan(this.loginAsEmail, this.defaultPlan);
          this.updateProjectFilters(true);
          this.comparePlanToFTE();
          this.createFtePlanningChartData(this.allProjects);
          this.checkDisableDeletePlan();
          this.updateEmployeeTotals();
          this.setEmployeeTotalsBorder();
          this.displayFTETable = true;
          this.allProjects.forEach(proj => {
            this.projectVisible.push(true);
          });
        }
        this.teamOrgStructure.forEach(emp => {
          this.employeeVisible.push(true);
        });
        // if (this.allProjects.length > 0) {
        //   this.allProjects.forEach(proj => {
        //     this.projectVisible.push(true);
        //   });
        // }
        this.createFtePlanningChartXAxis();
      }
    );
  }

  setCurrentMonthYear() {
    // Initialize to current quarter's month/year
    // currentMonth is the "real" month
    // setMonth is the month the user is viewing
    const thisMonth = Number(moment().format('M')); // 1 === Jan, 2 === Feb
    if (thisMonth === 11 || thisMonth === 12 || thisMonth === 1) {
      this.currentMonth = moment(1, 'DD').month(10); // When setting the month number: 0 === Jan, 1 === Feb
    } else if (thisMonth === 2 || thisMonth === 3 || thisMonth === 4) {
      this.currentMonth = moment(1, 'DD').month(1);
    } else if (thisMonth === 5 || thisMonth === 6 || thisMonth === 7) {
      this.currentMonth = moment(1, 'DD').month(4);
    } else if (thisMonth === 8 || thisMonth === 9 || thisMonth === 10) {
      this.currentMonth = moment(1, 'DD').month(7);
    }
    this.currentMonthName = moment(this.currentMonth).format('MMMM');
    this.setMonth = this.currentMonth;
    this.setMonthName = moment(this.setMonth).format('MMMM');
    this.setYear = moment().year();
  }

  onNewPlanClick() {
    // using the display flag because the "untouched" feature triggers the moment a user clicks inside a box
    // haven't found a good way to implement "dirty"
    if (!this.displayNewPlanModal) {
      // emit confirmation modal to remind user to Save an edited form first
      this.cacheService.confirmModalData.emit(
        {
          title: 'Unsaved Changes',
          message: `There are unsaved changes to this form.<br><br>
                    Please click 'Save' before creating a new plan`,
          iconClass: 'fa-exclamation-triangle',
          iconColor: 'rgb(193, 193, 27)',
          closeButton: true,
          allowOutsideClickDismiss: true,
          allowEscKeyDismiss: true,
          buttons: [
            {
              text: 'Dismiss',
              bsClass: 'btn-secondary',
              emit: false
            }
          ]
        }
      );
    } else {
      this.newPlanForm = this.fb.group({
        newPlanName: [null, [Validators.required, Validators.minLength(2), Validators.pattern(this.planNameRegex)]]
      });
    }
  }

  onAddProjectClick() {
    this.showProjectsModal = true;
  }

  checkDisableDeletePlan() {
    if (this.teamFTEsFlatLive.length === 0 && this.planList.length === 1) {
      this.disableDeletePlan = true;
    } else {
      this.disableDeletePlan = false;
    }
  }

  // output from the projects modal; in the event that any projects are added when the modal is open
  // and the projects list is refreshed via websockets
  onAddedProjects(projects: any) {
    // update the projects list
    this.projectList = projects;
  }

  onModalClosed(selectedProject: any) {
    // console.log('this.teamFTEs', this.teamFTEs)
    this.display = true;  // make sure FTE entry form is visible
    setTimeout(() => {
      this.showProjectsModal = false;
    }, 500);

    // verify selectedProject has not already been added
    // const fteFormArray = this.FTEFormGroup.controls.FTEFormArray;
    const fteFormArray = this.FTEFormGroupLive;

    const currentProjectsList = [];
    fteFormArray.forEach( project => {
      if (project.length !== 0) {
        currentProjectsList.push(project[0].projectID);
      }
    });

    // add the project to the projectvisible array so it shows as soon as it is added
    this.projectVisible.push(true);

    const alreadyExists = currentProjectsList.find( value => {
      return value === selectedProject.ProjectID;
    });
    if (!alreadyExists) {

      this.addNewProjectToForm(selectedProject.ProjectID, selectedProject.ProjectName);
      this.cacheService.raiseToast('success', `Added Project ${selectedProject.ProjectName}.  Please check the bottom of the list`);
    } else {
      this.cacheService.raiseToast('error', `Failed to add Project ${selectedProject.ProjectName}.  It already exists in your FTE table`);
    }

  }

  onModalCancelClick() {
    this.display = true;  // make sure FTE entry form is visible
    setTimeout(() => {
      this.showProjectsModal = false;
    }, 500);
  }


  onFTEChange(i, j, value) {
    // console.log(`fte entry changed for project ${i}, employee ${j}, with value ${value}`);
    this.displayNewPlanModal = false;

    value = Number(value);

    const FTEFormArray = <FormArray>this.FTEFormGroup.controls.FTEFormArray;
    const FTEFormProjectArray = <FormArray>FTEFormArray.at(i);
    const FTEFormGroup = FTEFormProjectArray.at(j);

    // if user typed a 0, replace with null
    if (value === 0) {
      FTEFormGroup.patchValue({
        fte: null
      });
    }

    if ( (FTEFormGroup.value.fte === null) && (FTEFormGroup.value.recordID !== null) ) {
      // if user typed a null and the recordID is accessible, delete that record
      // TODO: get the newly created recordID after a save transaction is completed
      FTEFormGroup.patchValue({
        toBeDeleted: true,
        updated: false
      });
    } else {
      // user changed the value, so set the update flag for us to update it in the DB
      FTEFormGroup.patchValue({
        updated: true
      });
    }

    // In order to browse month by month without having to click "Save" everytime,
    // we need to cache all the modified data and either update it as it changes or add a new object if its a new instance
    // The teamFTEsFlatLive is a realtime array that will track the updates and be referenced everytime the buildFTEEntryForm is called
    //  So in order to keep this array up to date, anytime a user edits the fte input box, it will look for the index in the array
    //  If the index is found, the fte will be updated, otherwise a new object will be pushed
    const foundIndex = this.teamFTEsFlatLive.findIndex(o =>
      o['allocations:employeeID'] === FTEFormGroup.value.employeeID &&
      o.projectID === FTEFormGroup.value.projectID &&
      moment(o['allocations:fiscalDate']).utc().format('YYYY-MM-DD') ===
      moment(FTEFormGroup.value.month, 'MM-DD-YYYY').format('YYYY-MM-DD')
    );

    if (foundIndex !== -1) {
      this.teamFTEsFlatLive[foundIndex]['allocations:fte'] = FTEFormGroup.value.fte / 100;
    } else {
      this.teamFTEsFlatLive.push({
        planName: this.currentPlan,
        projectID: FTEFormGroup.value.projectID,
        projectName: FTEFormGroup.value.projectName,
        ['allocations:recordID']: FTEFormGroup.value.recordID,
        ['allocations:fullName']: FTEFormGroup.value.fullName,
        ['allocations:employeeID']: FTEFormGroup.value.employeeID,
        ['allocations:emailAddress']: FTEFormGroup.value.emailAddress,
        ['allocations:fiscalDate']: moment(FTEFormGroup.value.month, 'MM-DD-YYYY').format('YYYY-MM-DD HH:mm:ss'),
        ['allocations:fte']: FTEFormGroup.value.fte / 100
      });
    }

    // Just like the above, the FTEFormGroup needs to be cached if we want the user to be able to browse month by month
    // In the Employee FTE page code, the user will always stay on a single page where all the fte entry boxes can be displayed at once.
    // This allows that page to not have to cache the FTEFormGroup data and "Save" what is on the page
    // The Team FTE page is bulit to browse month by month, so we don't want to
    // lose any changes the user made in a month that is not currently displayed
    // The FTEFormGroupLive is initialized to the current month, so all data from the current month is copied
    // Any other month is handled on a case by case basis per edit. This is ok since the controller function only checks the
    //  toBeDeleted, newRecord, updated booleans

    const foundIndexFG = this.FTEFormGroupLive[this.FTEFormGroupLive.length - 1].findIndex(o =>
      o.employeeID === FTEFormGroup.value.employeeID &&
      o.projectID === FTEFormGroup.value.projectID &&
      moment(o.month).utc().format('YYYY-MM-DD') ===
      moment(FTEFormGroup.value.month, 'MM-DD-YYYY').format('YYYY-MM-DD')
    );

    if (FTEFormGroup.value.month === moment(this.currentMonth).format('MM-DD-YYYY')) {
      this.FTEFormGroupLive[i][j].emailAddress = FTEFormGroup.value.emailAddress;
      this.FTEFormGroupLive[i][j].employeeID = FTEFormGroup.value.employeeID;
      this.FTEFormGroupLive[i][j].fte = FTEFormGroup.value.fte;
      this.FTEFormGroupLive[i][j].fullName = FTEFormGroup.value.fullName;
      this.FTEFormGroupLive[i][j].month = FTEFormGroup.value.month;
      this.FTEFormGroupLive[i][j].newRecord = FTEFormGroup.value.newRecord;
      this.FTEFormGroupLive[i][j].projectID = FTEFormGroup.value.projectID;
      this.FTEFormGroupLive[i][j].projectName = FTEFormGroup.value.projectName;
      this.FTEFormGroupLive[i][j].recordID = FTEFormGroup.value.recordID;
      this.FTEFormGroupLive[i][j].toBeDeleted = FTEFormGroup.value.toBeDeleted;
      this.FTEFormGroupLive[i][j].updated = FTEFormGroup.value.updated;
    } else if (foundIndexFG !== -1) {
      this.FTEFormGroupLive[this.FTEFormGroupLive.length - 1][foundIndexFG].fte = FTEFormGroup.value.fte;
    } else {
      this.FTEFormGroupLive[this.allProjects.length].push({
        emailAddress: FTEFormGroup.value.emailAddress,
        employeeID: FTEFormGroup.value.employeeID,
        fte: FTEFormGroup.value.fte,
        fullName: FTEFormGroup.value.fullName,
        month: FTEFormGroup.value.month,
        newRecord: FTEFormGroup.value.newRecord,
        projectID: FTEFormGroup.value.projectID,
        projectName: FTEFormGroup.value.projectName,
        recordID: FTEFormGroup.value.recordID,
        toBeDeleted: FTEFormGroup.value.toBeDeleted,
        updated: FTEFormGroup.value.updated
      });
    }

    // update the monthly total
    this.updateEmployeeTotal(j);

    // set the border color for the monthly totals inputs
    this.setEmployeeTotalsBorder();
    this.createFtePlanningChartData(this.projects);
  }

  updateEmployeeTotal(index: number) {

    const FTEFormArray = this.FTEFormGroup.value.FTEFormArray;

    // initialize a temporary variable, set to zero
    let total = 0;

    // loop through each project
    FTEFormArray.forEach( project => {
      project.forEach( (emp, i) => {
        if (i === index) {
          total += +emp.fte;
        }
      });
    });

    // set to null if zero (to show blank) and convert to an actual decimal percentage. frontend will use percentpipe to display it properly
    total = total === 0 ? null : total / 100;

    // set the monthly totals property at the index
    this.employeeTotals[index] = total;

  }

  updateEmployeeTotals() {
    const employeeCount = this.teamOrgStructure.length;

    const FTEFormArray = this.FTEFormGroup.value.FTEFormArray;

    // initialize a temporary array with zeros to hold the totals
    let totals = new Array(employeeCount).fill(0);

    // loop through each project
    FTEFormArray.forEach( project => {
      project.forEach( (projemp, i) => {
        totals[i] += +projemp.fte;
      });
    });

    // replace the zeros with nulls to show blanks
    totals = totals.map(total => {
      return total === 0 ? null : total;
    });

    // convert the total to a decimal, using percentpipe in the frontend to display
    totals = totals.map(total => {
      return total ? total / 100 : null;
    });

    // set the monthly totals property
    this.employeeTotals = totals;
  }

  // set red border around totals that don't total to 100
  setEmployeeTotalsBorder() {

    this.employeeTotals.forEach((total, index) => {

      // get a reference to the input element using jquery
      const $totalEl = $(`input.fte-totals-column[month-index="${index}"]`);

      if (!total) {
        // console.log(`month ${index} total is null(${total})`);
        this.employeeTotalsValid[index] = true;
      } else if (total !== 1) {
        // console.log(`month ${index} does NOT total to 1.0 (${total})`);
        this.employeeTotalsValid[index] = false;
      } else {
        // console.log(`month ${index} DOES total to 1.0 (${total})`);
        this.employeeTotalsValid[index] = true;
      }
    });
  }

  onSaveClick() {
    // const fteData = this.FTEFormGroup.value.FTEFormArray;
    const fteData = this.FTEFormGroupLive;

    const t0 = performance.now();

    // validate totals boxes per employee (must < 1)
    const employeeTotalsValid = this.employeeTotals.every( value => {
      return value <= 1;
    });

    if (employeeTotalsValid) {
      // call the api data service to send the put request
      this.apiDataFteService.updateTeamData(fteData, this.loginAsID, this.currentPlan)
      .subscribe(
        res => {
          this.cacheService.raiseToast('success', res.message);

          Promise.all([
          // rebuild the FTE entry page
          this.getPlan(this.loginAsEmail, this.currentPlan),
          this.buildFteEntryForm(),
          this.displayFTETable = true,
          this.FTEFormGroup.markAsUntouched(),
          this.checkDisableDeletePlan(),
          this.displayNewPlanModal = true
          ]).then(next => {
            this.updateProjectFilters(false);
          });
        },
        err => {
          console.log(err);
          this.cacheService.raiseToast('error', `${err.status}: ${err.statusText}`);
        }
      );
    } else {
      this.cacheService.raiseToast('error', `FTE totals in each month cannot exceed 100%.`);
    }

  }

  onLaunchClick() {

    if (!this.FTEFormGroup.untouched) {
      // emit confirmation modal to remind user to Save an edited form first
      this.cacheService.confirmModalData.emit(
        {
          title: 'Unsaved Changes',
          message: `There are unsaved changes to this form.<br><br>
                    Please click 'Save' before launching`,
          iconClass: 'fa-exclamation-triangle',
          iconColor: 'rgb(193, 193, 27)',
          closeButton: true,
          allowOutsideClickDismiss: true,
          allowEscKeyDismiss: true,
          buttons: [
            {
              text: 'Dismiss',
              bsClass: 'btn-secondary',
              emit: false
            }
          ]
        }
      );
    } else {

      // emit confirmation modal after they click request button
      this.cacheService.confirmModalData.emit(
        {
          title: 'Confirm Plan Launch',
          message: `Are you sure you want to launch this plan?<br><br>
                    This will overwrite all existing employee FTE data. `,
          iconClass: 'fa-exclamation-triangle',
          iconColor: 'rgb(193, 193, 27)',
          closeButton: true,
          allowOutsideClickDismiss: false,
          allowEscKeyDismiss: false,
          buttons: [
            {
              text: 'Launch',
              bsClass: 'btn-success',
              emit: true
            },
            {
              text: 'Cancel',
              bsClass: 'btn-secondary',
              emit: false
            }
          ]
        }
      );

      const updateModalSubscription = this.cacheService.confirmModalResponse.subscribe( modalRes => {
        if (modalRes) {
          const firstMonth = moment(this.currentMonth).format('YYYY-MM-01');
          // call the api data service to send the put request
          this.apiDataFteService.launchPlan(this.teamEditableMembers, firstMonth, this.loginAsID, this.currentPlan)
          .subscribe(
            res => {
              this.cacheService.raiseToast('success', res.message);

              // rebuild the FTE entry page to show selected month
              this.buildFteEntryForm();
              this.displayFTETable = true;
              this.FTEFormGroup.markAsUntouched();
            },
            err => {
              console.log(err);
              this.cacheService.raiseToast('error', `${err.status}: ${err.statusText}`);
            }
          );
        }
        updateModalSubscription.unsubscribe();
      });
    }
  }

  buildFteEntryForm() {
    this.FTEFormGroup = this.fb.group({
      FTEFormArray: this.fb.array([])
    });
    // grab the Project formarray
    const FTEFormArray = <FormArray>this.FTEFormGroup.controls.FTEFormArray;

    this.toolsService.clearFormArray(FTEFormArray); // remove any existing form groups in the array

    // loop through each project to get into the FTE entry elements
    this.teamFTEs.forEach( (proj: TeamFTEs) => {
      this.addProjectToFormArray(FTEFormArray, proj, false);
    });
  }

  addProjectToFormArray(FTEFormArray: FormArray, proj: TeamFTEs, newProject: boolean) {
    const projFormArray = this.fb.array([]); // instantiating a temp formarray for each project

    this.teamOrgStructure.forEach(employee => {
      // for each FTE entry in a given project, push the FTE controller into the temp formarray
      // so we will have 1 controller per month, one array of controllers per project

      // attempt to find a record/object for this project and month
      const foundEntry = this.teamFTEsFlatLive.find(teamFTE => {
        if (newProject) {
          return false;
        } else {
          return proj.projectID === teamFTE.projectID &&
            moment(this.setMonth).format('MM-DD-YYYY') === moment(teamFTE['allocations:fiscalDate']).utc().format('MM-DD-YYYY') &&
            employee.employeeID === teamFTE['allocations:employeeID'];
        }
      });

      projFormArray.push(
        this.fb.group({
          recordID: [foundEntry ? foundEntry['allocations:recordID'] : null],
          projectID: [proj.projectID],
          projectName: [proj.projectName],
          employeeID: [employee.employeeID],
          emailAddress: [employee.emailAddress],
          fullName: [employee.fullName],
          month: [moment(this.setMonth).format('MM-01-YYYY')],
          // convert db values to a percent without the percent sign. Ensure no decimals XX.000.
          fte: [foundEntry ? (foundEntry['allocations:fte'] * 100).toFixed(0) : null],
          newRecord: [foundEntry ? false : true],
          updated: [false],
          toBeDeleted: [false]
        })
      );
    });
    // cast the new project to an 'any', so we can assign arbitrary properties to each array
    // used to parse the projectName in HTML without having to dive into the controls
    const tempProj: any = projFormArray;
    tempProj.projectID = proj.projectID;
    tempProj.projectName = proj.projectName;

    FTEFormArray.push(tempProj);  // push the temp formarray as 1 object in the Project formarray
  }

  addNewProjectToForm(projectID: number, projectName: string) {
    const newProject = new TeamFTEs;
    newProject.userID = this.authService.loggedInUser.id;
    newProject.projectID = projectID;
    newProject.projectName = projectName;

     // loop through the already-built months array and initialize null FTEs for each month in this new project
     newProject.allocations = new Array<AllocationsArray>();

     const FTEFormArray = <FormArray>this.FTEFormGroup.controls.FTEFormArray;
     this.addProjectToFormArray(FTEFormArray, newProject, true);

     // Since a new project is being added, we need to move the last array thats
     //  being used dynamically for case-by-case updates, back to the end
     const tempArr = this.FTEFormGroupLive[this.FTEFormGroupLive.length - 1];
     this.FTEFormGroupLive.pop();
     this.FTEFormGroupLive.push(this.FTEFormGroup.value.FTEFormArray[this.FTEFormGroup.value.FTEFormArray.length - 1]);
     this.FTEFormGroupLive.push(tempArr);

    // CONFUSED!!!!!
    // For some reason, when onModalClosed is activated and this chunk of code below is uncommented,
    //  this.teamFTEs adds the new project TWICE. Cannot find where teamFTEs is being used when user click the "select"
    //  button on the projectsModal.
    //  this.teamFTEs.push({
    //    planName: this.currentPlan,
    //    projectID: newProject.projectID,
    //    projectName: newProject.projectName,
    //    allocations: newProject.allocations
    //  });

     this.allTeamFTEs.push({
       planName: this.currentPlan,
       projectID: newProject.projectID,
       projectName: newProject.projectName,
       allocations: newProject.allocations
     });

    //  this.allProjects.push(FTEFormArray.controls[FTEFormArray.controls.length - 1]);
     this.projects = FTEFormArray.controls;

     // Update the project filter to add the newly added project
     this.filterProjectsOptions.push({
       id: this.allProjects.length,
       name: this.allProjects[this.allProjects.length - 1].projectName
     });
     this.filterProjectsModel.push(this.allProjects.length);
     this.filterProjectsDropdown.renderFilteredOptions = this.filterProjectsOptions;
     this.filterProjectsDropdown.model = this.filterProjectsModel;

     // In order for the user to filter on and off the newly added project,
     //  a psuedo object referring to that project is needed in the teamFTEsFlatLive array so
     //  when the form entry is built, it will detect this project and add it, even if all the entries are null
     // Also a placeholder employee is needed to match the emailAddress condition in the buildFTEEntryForm function
     this.teamFTEsFlatLive.push({
       planName: this.currentPlan,
       projectID: newProject.projectID,
       projectName: newProject.projectName,
       ['allocations:recordID']: null,
       ['allocations:fullName']: this.teamOrgStructure[0].fullName,
       ['allocations:employeeID']: this.teamOrgStructure[0].employeeID,
       ['allocations:emailAddress']: this.teamOrgStructure[0].emailAddress,
       ['allocations:fiscalDate']: this.currentMonth,
       ['allocations:fte']: null
     });

     this.displayFTETable = true;
  }

  onTrashClick(index: number) {
    console.log('user clicked to delete project index ' + index);
    const FTEFormArray = <FormArray>this.FTEFormGroup.controls.FTEFormArray;
    const deletedProject: any = FTEFormArray.controls[index];
    // emit confirmation modal after they click delete button
    this.cacheService.confirmModalData.emit(
      {
        title: 'Confirm Deletion',
        message: `Are you sure you want to permanently delete project "${deletedProject.projectName}" from this plan?<br><br>
                  If launched, this project will be completely removed from your team
                  and no employee will be associated with this project.<br><br>
                  **If you meant to remove the project from the screen, please use the project filter instead**`,
        iconClass: 'fa-exclamation-triangle',
        iconColor: 'rgb(193, 193, 27)',
        closeButton: true,
        allowOutsideClickDismiss: false,
        allowEscKeyDismiss: false,
        buttons: [
          {
            text: 'Yes',
            bsClass: 'btn-success',
            emit: true
          },
          {
            text: 'Cancel',
            bsClass: 'btn-secondary',
            emit: false
          }
        ]
      }
    );

    const deleteModalSubscription = this.cacheService.confirmModalResponse.subscribe( res => {
      if (res) {
        // if they click ok, grab the deleted project info and exec db call to delete
        const toBeDeleted = {
          projectID: deletedProject.projectID,
          projectName: deletedProject.projectName,
          newlyAdded: deletedProject.newlyAdded
        };

        const deleteActionSubscription = this.apiDataFteService.destroyTeamProject(toBeDeleted).subscribe(
          deleteResponse => {
            // only delete from the projectemployeerole table if user is deleting a non-newlyAdded project
            FTEFormArray.controls.splice(index, 1);
            this.updateEmployeeTotals();
            this.setEmployeeTotalsBorder();
            this.cacheService.raiseToast('success', deleteResponse.message);
            deleteActionSubscription.unsubscribe();

            this.getPlan(this.loginAsEmail, this.currentPlan);
            this.checkDisableDeletePlan();
          },
          deleteErr => {
            this.cacheService.raiseToast('warning', `${deleteErr.status}: ${deleteErr.statusText}`);
            deleteActionSubscription.unsubscribe();
          }
        );
      } else {
        console.log('delete aborted');
      }
      deleteModalSubscription.unsubscribe();
    });
  }

  resetProjectFlags() {
    const FTEFormArray = <FormArray>this.FTEFormGroup.controls.FTEFormArray;  // get the formarray and loop through each project

    FTEFormArray.controls.forEach( project => {
      const currentProject: any = project;
      // loop through each month and reset the flags that were flipped
      project['controls'].forEach( month => {
        if (month.value.fte && month.value.newRecord) {
          // console.log('set newRecord false for: ' + month.value.fte);
          month.controls.newRecord.setValue(false);
          month.controls.updated.setValue(false);
          // console.log('new state: ' + month.value.newRecord);
        } else if (month.value.fte && month.value.updated) {
          // console.log('set updated false for: ' + month.value.fte);
          month.controls.updated.setValue(false);
          // console.log('new state: ' + month.value.updated);
        }
      });
    });
  }

  createProject() {
    setTimeout(() => {
      this.projectsCreateModalComponent.resetForm();
    }, 0);
  }

  onCreateSuccess(selectedProject: any) {

    // console.log('Create project success. My Project List Refreshed');
    // console.log('selectedProject', selectedProject);
    this.display = true;  // make sure FTE entry form is visible

    // verify selectedProject has not already been added
    const fteFormArray = this.FTEFormGroupLive;
    const currentProjectsList = [];
    fteFormArray.forEach( project => {
      currentProjectsList.push(project.projectID);
    });
    const alreadyExists = currentProjectsList.find( value => {
      return value === selectedProject.projectID;
    });
    if (!alreadyExists) {

      const newProject = new TeamFTEs;
      newProject.userID = this.authService.loggedInUser.id;
      newProject.projectID = selectedProject.projectID;
      newProject.projectName = selectedProject.projectName;

      this.addNewProjectToForm(selectedProject.projectID, selectedProject.projectName);

      this.cacheService.raiseToast('success', `Added Project ${selectedProject.ProjectName}.  Please check the bottom of the list`);

    } else {
      this.cacheService.raiseToast('error', `Failed to add Project ${selectedProject.ProjectName}.  It already exists in your FTE table`);
    }
  }

  async getTeam(email: string): Promise<any> {
    this.teamOrgStructure = await this.apiDataOrgService.getEmployeeList(email).toPromise();
    this.cacheService.teamEmployeeList = this.teamOrgStructure;
    // this.displayEmployees = this.teamOrgStructure;
    this.filteredEmployees = this.teamOrgStructure;
    this.updateEmployeeFilters();
    this.buildTeamEditableMembers();
  }

  buildTeamEditableMembers() {
    // build the string of employee email address to use as a parameter for the SP resources.DisplayTeamFTE
    for (let i = 0; i < this.teamOrgStructure.length; i++) {
      this.teamEditableMembers = this.teamOrgStructure[i].emailAddress + '\',\'' + this.teamEditableMembers;
    }
    this.teamEditableMembers = this.teamEditableMembers.substr(0, this.teamEditableMembers.lastIndexOf(','));
    this.teamEditableMembers = '\'\'' + this.teamEditableMembers + '\'';
  }

  async onCreateNewPlanClick(emailAddress: any, creatorEmailAddress: any, planName: string) {

    if (emailAddress === null) {
      emailAddress = this.teamEditableMembers;
    }

    const firstMonth = moment(this.currentMonth).format('YYYY-MM-01');

    // create new plan and get FTE data
    const res = await this.apiDataFteService.indexNewPlan(emailAddress, firstMonth, creatorEmailAddress, planName).toPromise();

    this.allTeamFTEs = res.nested;
    this.teamFTEs = this.allTeamFTEs;
    this.teamFTEsFlat = res.flat;
    this.teamFTEsFlatLive = this.teamFTEsFlat;

    // Set month back to current/default
    this.setCurrentMonthYear();

    this.buildFteEntryForm(); // initialize the FTE Entry form, which is dependent on FTE data being retrieved
    this.display = true;  // ghetto way to force rendering after FTE data is fetched
    const FTEFormArray = <FormArray>this.FTEFormGroup.controls.FTEFormArray;
    this.allProjects = FTEFormArray.controls;
    this.projects = this.allProjects;

    // Initialize the cache array for the FTEFormGroup, then add an extra element to add all edits in months other than the current
    this.FTEFormGroupLive = this.FTEFormGroup.value.FTEFormArray;
    this.FTEFormGroupLive.push([]);

    this.updateEmployeeTotals();
    this.setEmployeeTotalsBorder();

    this.updateProjectFilters(true);

    this.planList.splice(0, 0, {planName: planName});
    this.defaultPlan = this.planList[0].planName;
    this.currentPlan = this.defaultPlan;
    this.checkDisableDeletePlan();

  }

  async getPlan(userID: any, planName: string): Promise<any> {
    const res = await this.apiDataFteService.indexPlan(userID, planName).toPromise();
    this.allTeamFTEs = res.nested;
    this.teamFTEs = this.allTeamFTEs;
    this.teamFTEsFlat = res.flat;
    this.teamFTEsFlatLive = this.teamFTEsFlat;

    this.buildFteEntryForm(); // initialize the FTE Entry form, which is dependent on FTE data being retrieved
    this.display = true;  // ghetto way to force rendering after FTE data is fetched
    const FTEFormArray = <FormArray>this.FTEFormGroup.controls.FTEFormArray;
    this.allProjects = FTEFormArray.controls;
    this.projects = this.allProjects;

    // Initialize the cache array for the FTEFormGroup, then add an extra element to add all edits in months other than the current
    this.FTEFormGroupLive = this.FTEFormGroup.value.FTEFormArray;
    this.FTEFormGroupLive.push([]);

    this.updateEmployeeTotals();
    this.setEmployeeTotalsBorder();

    // this.updateProjectFilters();
  }

  async comparePlanToFTE() {
    // checks if any FTEs have been updated by users since the plan has been generated
    const firstMonth = moment(this.currentMonth).format('YYYY-MM-01');
    this.apiDataFteService.compareFTEToPlan(this.teamEditableMembers, firstMonth, this.loginAsID, this.currentPlan)
      .subscribe(
        res => {
          if (res.length > 0) {
            this.displaySyncNoticeButton = true;
            let updatedFTEsList = `
            <div class="row">
              <div class="col-3" style="font-weight: bold">Employee</div>
              <div class="col-5" style="font-weight: bold">Project</div>
              <div class="col-1" style="font-weight: bold">FTE</div>
              <div class="col-3" style="font-weight: bold">FiscalDate</div>
            </div>`;
            for (let i = 0; i < res.length; i++) {
              updatedFTEsList = updatedFTEsList +
                `
                <div class="row">
                  <div class="col-3">${res[i].FullName}</div>
                  <div class="col-5">${res[i].ProjectName}</div>
                  <div class="col-1">${res[i].FTE}</div>
                  <div class="col-3">${moment(res[i].FiscalDate).utc().format('YYYY-MM-DD')}</div>
                </div>`;
            }
            this.cacheService.confirmModalData.emit(
              {
                title: 'Plan Sync Notice',
                message: `The FTEs below have been updated by the users.<br><br>
                          ${updatedFTEsList}<br><br>
                          Please manually update the form to reflect these changes,
                          otherwise the changes will be overwritten when launched`,
                iconClass: 'fa-exclamation-triangle',
                iconColor: 'rgb(193, 193, 27)',
                closeButton: true,
                allowOutsideClickDismiss: true,
                allowEscKeyDismiss: true,
                buttons: [
                  {
                    text: 'Dismiss',
                    bsClass: 'btn-secondary',
                    emit: false
                  }
                ]
              }
            );
          } else {
            this.displaySyncNoticeButton = false;
          }
        },
        err => {
          console.log(err);
        }
      );
  }

  updateEmployeeFilters() {
    // Update list for employee dropdown filter
    for (let i = 0; i < this.teamOrgStructure.length; i++ ) {
      this.filterEmployeesOptions.push({
        id: i + 1,
        name: this.teamOrgStructure[i].fullName
      });
      this.filterEmployeesModel.push(i + 1);
    }

    // For some reason, this does not render dynamically, so this will force the rendering
    //  by accessing the model and updating the renderFilteredOptions manually
    this.filterEmployeesDropdown.renderFilteredOptions = this.filterEmployeesOptions;
  }

  updateProjectFilters(init: boolean) {
    const tempFilterList = this.filterProjects;

    // Update list for project dropdown filter
    this.filterProjectsModelStaging = [];
    this.filterProjectsOptionsStaging = [];

    for (let i = 0; i < this.allProjects.length; i++ ) {
      this.filterProjectsOptionsStaging.push({
        id: i + 1,
        name: this.allProjects[i].projectName
      });
      this.filterProjectsModelStaging.push(i + 1);
    }

    this.filterProjectsOptions = this.filterProjectsOptionsStaging;
    this.filterProjectsModel = this.filterProjectsModelStaging;

    // // Set the filterProjectsModel back to the selections user had originally
    // if (!init) {
    //   this.filterProjectsModel = [];
    //   for (let i = 0; i < this.filterProjectsOptions.length; i++) {
    //     for (let j = 0; j < tempFilterList.length; j++) {
    //       if (this.filterProjectsOptions[i].name === tempFilterList[j].name) {
    //         this.filterProjectsModel.push(this.filterProjectsOptions[i].id);
    //       }
    //     }
    //   }
    // }

    // For some reason, this does not render dynamically, so this will force the rendering
    //  by accessing the model and updating the renderFilteredOptions manually
    this.filterProjectsDropdown.renderFilteredOptions = this.filterProjectsOptions;
    this.filterProjectsDropdown.model = this.filterProjectsModel;
  }

  async getPlanList(userID: any): Promise<any> {
    this.planList = await this.apiDataFteService.indexPlanList(userID).toPromise();
    // If user doesn't have any plans, then set the default to undefined
    if (this.planList.length === 0) {
      this.defaultPlan = undefined;
    } else {
      // set the default plan to the latest plan
      this.defaultPlan = this.planList[0].planName;
      this.currentPlan = this.defaultPlan;
    }
  }

  selectPlan(planName: string) {

    if (!this.FTEFormGroup.untouched) {
      // emit confirmation modal to remind user to Save an edited form first
      this.cacheService.confirmModalData.emit(
        {
          title: 'Unsaved Changes',
          message: `There are unsaved changes to this form.<br><br>
                    Please click 'Save' before selecting a different plan`,
          iconClass: 'fa-exclamation-triangle',
          iconColor: 'rgb(193, 193, 27)',
          closeButton: true,
          allowOutsideClickDismiss: true,
          allowEscKeyDismiss: true,
          buttons: [
            {
              text: 'Dismiss',
              bsClass: 'btn-secondary',
              emit: false
            }
          ]
        }
      );
    } else {
      // set plan after selection
      this.currentPlan = planName;

      // get data for selected plan
      this.getPlan(this.loginAsEmail, this.currentPlan);
      this.setMonth = this.currentMonth;
      this.setMonthName = moment(this.setMonth).format('MMMM');
      this.setYear = moment().year();
    }
  }

  onDeletePlanClick() {

    // emit confirmation modal after they click request button
    this.cacheService.confirmModalData.emit(
      {
        title: 'Confirm Plan Delete',
        message: `Are you sure you want to delete plan "` + this.currentPlan + `"?`,
        iconClass: 'fa-exclamation-triangle',
        iconColor: 'rgb(193, 193, 27)',
        closeButton: true,
        allowOutsideClickDismiss: false,
        allowEscKeyDismiss: false,
        buttons: [
          {
            text: 'Delete',
            bsClass: 'btn-success',
            emit: true
          },
          {
            text: 'Cancel',
            bsClass: 'btn-secondary',
            emit: false
          }
        ]
      }
    );

    const updateModalSubscription = this.cacheService.confirmModalResponse.subscribe( modalRes => {
      if (modalRes) {
        // hide the fte form while delete and reload functions are running
        this.displayFTETable = false;

        // if empty plan, just delete from planList
        if (this.teamFTEsFlatLive.length === 0) {
          this.planList = this.planList.filter( obj => {
            return obj.planName !== this.currentPlan;
          });
          this.defaultPlan = this.planList[0].planName;
          this.currentPlan = this.defaultPlan;
          this.checkDisableDeletePlan();
        } else {

          // create object with delete data
          const planData = {
            planName: this.currentPlan,
            userID: this.authService.loggedInUser.id
          };

          this.apiDataFteService.deletePlan(planData)
            .subscribe(
              res => {
                console.log('plan deleted', res);

                // empty arrays so it won't have objects appended
                this.filteredEmployees = [];
                this.teamEditableMembers = '';

                this.planLoadSequence();
              },
              err => {
                console.error(err);
              }
            );
          }
      }
      updateModalSubscription.unsubscribe();
    });

  }

  onPreviousMonthClick() {
    // validate totals boxes per employee (must < 1)
    const employeeTotalsValid = this.employeeTotals.every( value => {
      return value <= 1;
    });

    if (employeeTotalsValid) {
      // Set month to next month and format
      this.setMonth = moment(this.setMonth).subtract(1, 'months');
      this.setMonthName = moment(this.setMonth).format('MMMM');
      this.setYear = moment(this.setMonth).format('YYYY');

      // rebuild the FTE entry page to show selected month
      this.buildFteEntryForm();
      this.updateEmployeeTotals();
      this.setEmployeeTotalsBorder();
      this.displayFTETable = true;

      // disable the previous button to prevent user from going into past months
      if (moment(this.setMonth) <= moment(this.currentMonth)) {
        this.disablePreviousMonth = true;
      } else {
        this.disablePreviousMonth = false;
      }
    } else {
      this.cacheService.raiseToast('error', `FTE totals in each month cannot exceed 100%.`);
    }
  }

  onNextMonthClick() {

    // validate totals boxes per employee (must < 1)
    const employeeTotalsValid = this.employeeTotals.every( value => {
      return value <= 1;
    });

    if (employeeTotalsValid) {
      // Set month to next month and format
      this.setMonth = moment(this.setMonth).add(1, 'months');
      this.setMonthName = moment(this.setMonth).format('MMMM');
      this.setYear = moment(this.setMonth).format('YYYY');

      // rebuild the FTE entry page to show selected month
      this.buildFteEntryForm();
      this.updateEmployeeTotals();
      this.setEmployeeTotalsBorder();
      this.displayFTETable = true;

      // disable the previous button to prevent user from going into past months
      if (moment(this.setMonth) <= moment(this.currentMonth)) {
        this.disablePreviousMonth = true;
      } else {
        this.disablePreviousMonth = false;
      }
    } else {
      this.cacheService.raiseToast('error', `FTE totals in each month cannot exceed 100%.`);
    }
  }

  // Angular-2-MultiSelect-Dropdown functions

  onFilterEmployeesChange() {
    this.filterEmployees = [];

    // create an array of all items checked in the filter box with their employees since filterEmployeesModel is only an array of indexes
    for (let i = 0; i < this.filterEmployeesOptions.length; i++) {
      for (let j = 0; j < this.filterEmployeesModel.length; j++) {
        if (this.filterEmployeesOptions[i].id === this.filterEmployeesModel[j]) {
          this.filterEmployees.push(this.filterEmployeesOptions[i]);
        }
      }
    }

    // update the employees list with the filtered list
    // teamOrgStructure will always contain the full employee list
    this.filteredEmployees = this.teamOrgStructure.filter(o1 => this.filterEmployees.some(o2 => o1.fullName === o2.name));

    // update the employee visible array. first set all to false, then selected employees to true
    for (let i = 0; i < this.employeeVisible.length; i++) {
      this.employeeVisible[i] = false;
    }
    for (let j = 0; j < this.filterEmployees.length; j++) {
      this.employeeVisible[this.filterEmployees[j].id - 1] = true;
    }

    // this.buildFteEntryForm(); // initialize the FTE Entry form, which is dependent on FTE data being retrieved
    // this.display = true;  // ghetto way to force rendering after FTE data is fetched
  }

  onFilterProjectsChange() {
    this.filterProjects = [];

    // create an array of all items checked in the filter box with their projectNames since filterProjectModel is only an array of indexes
    for (let i = 0; i < this.filterProjectsOptions.length; i++) {
      for (let j = 0; j < this.filterProjectsModel.length; j++) {
        if (this.filterProjectsOptions[i].id === this.filterProjectsModel[j]) {
          this.filterProjects.push(this.filterProjectsOptions[i]);
        }
      }
    }

    // update the projects list with the filtered list
    // allProjects will always contain the full project list
    this.projects = this.allProjects.filter(o1 => this.filterProjects.some(o2 => o1.projectName === o2.name));

    // update the project visible array. first set all to false, then selected projects to true
    for (let i = 0; i < this.projectVisible.length; i++) {
      this.projectVisible[i] = false;
    }
    for (let j = 0; j < this.filterProjects.length; j++) {
      this.projectVisible[this.filterProjects[j].id - 1] = true;
    }

    // this.buildFteEntryForm(); // initialize the FTE Entry form, which is dependent on FTE data being retrieved
    // this.display = true;  // ghetto way to force rendering after FTE data is fetched

    this.createFtePlanningChartData(this.projects);
  }

  // Highchart Functions
  createFtePlanningChartXAxis() {
    // Generate X-Axis with months starting from current
    // This month = 0, this month next year = 12
    this.fteMonthsChart.push(moment(this.currentMonth).format('MMM'));
    for (let i = 1; i < 12; i++) {
      this.fteMonthsChart.push(moment(this.currentMonth).add(i, 'month').format('MMM'));
    }
  }

  createFtePlanningChartData(projectList: any) {

    this.fteChartData = [];

    const currentMonthNumber = moment(this.currentMonth).format('M');

    for (let i = 0; i < projectList.length; i++) {
    // for (let i = 0; i < 41; i++) {
      // Initialize the data object
      this.fteChartData.push({
        name: projectList[i].projectName,
        data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
      });

      // Loop through all projects the team is engaged in
      for (let j = 0; j < this.teamFTEsFlatLive.length; j++) {
        if (this.teamFTEsFlatLive[j].projectName === projectList[i].projectName) {

          // Store the fiscal month and fiscal year for the found project
          let fiscalMonthFound = moment(this.teamFTEsFlatLive[j]['allocations:fiscalDate']).utc().format('M');
          const fiscalYearFound = moment(this.teamFTEsFlatLive[j]['allocations:fiscalDate']).utc().format('YYYY');

          // If the month found is current or later than current month, and if the fiscal year is current year, then calculate difference
          if (
            Number(fiscalMonthFound) >= Number(currentMonthNumber) &&
            Number(fiscalYearFound) === Number(moment(this.currentMonth).format('YYYY'))
            ) {
                this.fteChartData[i].data[fiscalMonthFound - currentMonthNumber] =
                  Number(this.fteChartData[i].data[fiscalMonthFound - currentMonthNumber]) +
                    Number(this.teamFTEsFlatLive[j]['allocations:fte']);
          // If the month found is less than current month, and if the fiscal year is next year,
          //  then calculate difference with an offset of 12
          // So if this month is Aug-2018, currentmonth  = 8,
          //  then Feb-2019 would be 2 (Feb month num) + 12 (months in a year) - 8 (Aug month num) = 6.
          //  If the chart starts with August which would be index 0, then Feb is index 6
          } else if (
              Number(fiscalMonthFound) < Number(currentMonthNumber) &&
              Number(fiscalYearFound) === Number(moment(this.currentMonth).add(1, 'year').format('YYYY'))
            ) {
                fiscalMonthFound = Number(fiscalMonthFound) + 12;
                this.fteChartData[i].data[fiscalMonthFound - currentMonthNumber] =
                  Number(this.fteChartData[i].data[fiscalMonthFound - currentMonthNumber]) +
                    Number(this.teamFTEsFlatLive[j]['allocations:fte']);
          }
        }
      }
    }

    this.plotFtePlanningChart();
  }

  plotFtePlanningChart() {
    const nextYear = Number(this.setYear) + Number(1);
    this.ftePlanningSeriesOptions = {
        chart: {
          type: 'column'
        },
        title: {
          text: 'Team FTE Planning for FY' + this.setYear + '-' + nextYear
        },
        xAxis: {
          categories: this.fteMonthsChart,
          crosshair: true
        },
        yAxis: {
          min: 0,
          title: {
            text: 'FTE Count'
          }
        },
        tooltip: {
          headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
          pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
            '<td style="padding:0"><b>{point.y:.1f} FTE</b></td></tr>',
          footerFormat: '</table>',
          shared: true,
          useHTML: true
        },
        plotOptions: {
          column: {
            pointPadding: 0.2,
            borderWidth: 0
          }
        },
        colorCount: 0,
        series: this.fteChartData
    };

    this.ftePlanningChart = Highcharts.chart('FTEPlanningChart', this.ftePlanningSeriesOptions);
  }

}
