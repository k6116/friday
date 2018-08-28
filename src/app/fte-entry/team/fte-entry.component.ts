import { Component, OnInit, ViewChild, AfterViewInit, OnDestroy, Input, ChangeDetectorRef } from '@angular/core';
import { FormGroup, FormArray, FormControl, Validators, FormBuilder } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import { HostListener } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';

import { AuthService } from '../../_shared/services/auth.service';
import { ApiDataProjectService, ApiDataFteService, ApiDataJobTitleService,
        ApiDataOrgService } from '../../_shared/services/api-data/_index';
import { CacheService } from '../../_shared/services/cache.service';
import { ToolsService } from '../../_shared/services/tools.service';
import { ComponentCanDeactivate } from '../../_shared/guards/unsaved-changes.guard';
import { TeamFTEs, AllocationsArray} from './fte-model';
import { utils, write, WorkBook } from 'xlsx';
import { saveAs } from 'file-saver';
import { JAN } from '@angular/material';

import { ProjectsCreateModalComponent } from '../../modals/projects-create-modal/projects-create-modal.component';
import { format } from 'util';
import { yearsPerPage } from '../../../../node_modules/@angular/material/datepicker/typings/multi-year-view';

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
  mainSliderConfig: any;  // slider config
  fqLabelArray = new Array; // for labeling fiscal quarters in FTE table
  fyLabelArray = new Array; // for labeling fiscal years in slider header
  fteProjectVisible = new Array;  // boolean array for by-project row display
  FTEFormGroup: FormGroup;
  sliderRange: number[] = []; // contains the live slider values
  allTeamFTEs: any;
  teamFTEs: any;  // array to store team FTE data
  teamFTEsFlat: any;  // array to store team FTE data (flattened/non-treeized version)
  teamFTEsFlatLive: any;
  display: boolean; // TODO: find a better solution to FTE display timing issue
  displayFTETable = false;
  projects: any;  // for aliasing formarray
  allProjects: any;
  months: string[] = [];
  monthlyTotals: number[];
  monthlyTotalsValid: boolean[];
  showProjectsModal: boolean;
  projectList: any;
  timer: any;
  jobTitleList: any;
  fteEmployeeVisible: any;
  teamOrgStructure: any;
  employees: any[] = [];
  allEmployees: any[] = [];
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
  FTEFormGroupLive: any;

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
    enableSearch: true,
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
    enableSearch: true,
    // checkedStyle: 'fontawesome',
    buttonClasses: 'btn btn-primary btn-block',
    dynamicTitleMaxItems: 0,
    displayAllSelectedText: true,
    maxHeight: '500px',
};

  fteTutorialState = 0; // for keeping track of which part of the tutorial we're in, and passing to child component

  @ViewChild(ProjectsCreateModalComponent) projectsCreateModalComponent;
  // Accessing the model to update the rendering manually because the author of this package never fixed a bug
  @ViewChild('filterEmployeesDropdown') filterEmployeesDropdown: MultiselectDropdownComponent;
  @ViewChild('filterProjectsDropdown') filterProjectsDropdown: MultiselectDropdownComponent;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private apiDataProjectService: ApiDataProjectService,
    private apiDataFteService: ApiDataFteService,
    private apiDataJobTitleService: ApiDataJobTitleService,
    private apiDataOrgService: ApiDataOrgService,
    private cacheService: CacheService,
    private toolsService: ToolsService,
    private decimalPipe: DecimalPipe,
    private changeDetectorRef: ChangeDetectorRef
  ) {
    // initialize the FTE formgroup
    this.FTEFormGroup = this.fb.group({
      FTEFormArray: this.fb.array([])
    });

    this.monthlyTotals = new Array(36).fill(null);
    this.monthlyTotalsValid = new Array(36).fill(true);

    this.changeDetectorRef.detach();
    this.timer = setInterval(() => {
      this.changeDetectorRef.detectChanges();
    }, 200);
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

  ngOnInit() {
    this.filterEmployeesModel = [];
    this.filterEmployeesOptions = [];
    this.filterProjectsModel = [];
    this.filterProjectsOptions = [];

    this.apiDataProjectService.getProjects()
      .subscribe(
        res => {
          console.log('get project data successfull:');
          console.log(res);
          this.projectList = res;
          // this.trimProjects(500);
        },
        err => {
          console.log('get project data error:');
          console.log(err);
        }
    );

    // Using promises to avoid async
    // First, get the list of Plans for current user
    // Second, get all subordinates for current user
    // Third, retrieve data for that plan
    // If plan does not exist, create one
    this.getPlanList(this.authService.loggedInUser.id).then(
      res1 => {
      if (this.defaultPlan === undefined) {
        this.getTeam('ethan_hunt@keysight.com').then(
          res2 => this.createNewPlan(this.teamEditableMembers, this.authService.loggedInUser.id, 'New Plan 1'));
      } else {
        this.getTeam('ethan_hunt@keysight.com').then(res => this.getPlan(this.authService.loggedInUser.id, this.defaultPlan).then(
          res2 => {
            this.createFtePlanningChartXAxis();
            this.createFtePlanningChartData(this.allProjects);
          }
        ));
      }}
    );

    this.fteFormChangeListener();

    $('[data-toggle="tooltip"]').tooltip();

    // Initialize to current month/year
    this.currentMonth = moment(1, 'DD');
    this.currentMonthName = moment(this.currentMonth).format('MMMM');
    this.setMonth = this.currentMonth;
    this.setMonthName = moment(this.setMonth).format('MMMM');
    this.setYear = moment().year();

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

  onAddProjectClick() {
    // if user selects add project while in the tutorial, kill part1 and hide the FTE entry elements due to
    // introjs z-index css problems
    if (this.fteTutorialState === 1) {
      this.fteTutorialState++;
      introJs().exit();
      this.display = false;
    }
    this.showProjectsModal = true;
  }


  // output from the projects modal; in the event that any projects are added when the modal is open
  // and the projects list is refreshed via websockets
  onAddedProjects(projects: any) {
    // update the projects list
    this.projectList = projects;
  }

  onModalClosed(selectedProject: any) {
    console.log('on modal closed fired');
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

    const alreadyExists = currentProjectsList.find( value => {
      return value === selectedProject.ProjectID;
    });
    if (!alreadyExists) {

      const newProject = new TeamFTEs;
      newProject.userID = this.authService.loggedInUser.id;
      newProject.projectID = selectedProject.ProjectID;
      newProject.projectName = selectedProject.ProjectName;

      // loop through the already-built months array and initialize null FTEs for each month in this new project
      newProject.allocations = new Array<AllocationsArray>();
      // this.months.forEach( month => {
      //   const newMonth = new AllocationsArray;
      //   // newMonth.fullName = moment(month).utc().format();
      //   newMonth.fte = null;
      //   newMonth.recordID = null;
      //   newProject.allocations.push(newMonth);
      // });

      const FTEFormArray = <FormArray>this.FTEFormGroup.controls.FTEFormArray;
      this.addProjectToFteForm(FTEFormArray, newProject, true);

      // Since a new project is being added, we need to move the last array thats
      //  being used dynamically for case-by-case updates, back to the end
      const tempArr = this.FTEFormGroupLive[this.FTEFormGroupLive.length - 1];
      this.FTEFormGroupLive.pop();
      this.FTEFormGroupLive.push(this.FTEFormGroup.value.FTEFormArray[this.FTEFormGroup.value.FTEFormArray.length - 1]);
      this.FTEFormGroupLive.push(tempArr);

      this.teamFTEs.push({
        planName: this.currentPlan,
        projectID: newProject.projectID,
        projectName: newProject.projectName,
        allocations: newProject.allocations
      });

      this.allTeamFTEs.push({
        planName: this.currentPlan,
        projectID: newProject.projectID,
        projectName: newProject.projectName,
        allocations: newProject.allocations
      });

      this.allProjects.push(FTEFormArray.controls[FTEFormArray.controls.length - 1]);
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
        projectID: 12,
        projectName: 'Arges50',
        ['allocations:recordID']: null,
        ['allocations:fullName']: this.allEmployees[0].fullName,
        ['allocations:emailAddress']: this.allEmployees[0].emailAddress,
        ['allocations:fiscalDate']: this.currentMonth,
        ['allocations:fte']: null
      });

      this.displayFTETable = true;
    } else {
      this.cacheService.raiseToast('error', `Failed to add Project ${selectedProject.ProjectName}.  It already exists in your FTE table`);
    }

  }

  onModalCancelClick() {
    console.log('on modal cancel fired');
    this.display = true;  // make sure FTE entry form is visible
    setTimeout(() => {
      this.showProjectsModal = false;
    }, 500);
  }


  onFTEChange(i, j, value) {
    console.log(`fte entry changed for project ${i}, month ${j}, with value ${value}`);

    let fteReplace: boolean;
    let fteReplaceValue: any;

    // check for match on the standard three digit format 0.5, 1.0
    const match = /^[0][.][1-9]{1}$/.test(value) || /^[1][.][0]{1}$/.test(value);
    // if not a match, will want to update/patch it to use the standard format
    if (!match) {
      fteReplace = true;

      // first, strip out all dots except the first
      const dotPosition = value.indexOf( '.' );
      if ( dotPosition > -1 ) {
        fteReplaceValue = value.substr( 0, dotPosition + 1 ) + value.slice( dotPosition ).replace( /\./g, '' );
      } else {
        fteReplaceValue = value;
      }

      // if string has a trailing dot, append a zero so it will look like a number
      if (dotPosition === fteReplaceValue.length - 1) {
        fteReplaceValue = fteReplaceValue + '0';
      }

      // if the value is 0, replace with null, else decimalPipe it into the proper format
      if (Number(fteReplaceValue) === 0) {
        fteReplaceValue = null;
      } else {
        fteReplaceValue = this.decimalPipe.transform(Number(fteReplaceValue), '1.1-1');
      }

    }
    // console.log(`match is ${match}, replacement value: ${fteReplaceValue}, at ${i}, ${j}`);

    const FTEFormArray = <FormArray>this.FTEFormGroup.controls.FTEFormArray;
    const FTEFormProjectArray = <FormArray>FTEFormArray.at(i);
    const FTEFormGroup = FTEFormProjectArray.at(j);

    if ( (fteReplaceValue === null) && (FTEFormGroup.value.recordID !== null) ) {
      // if the replacement value is a null and the recordID is accessible, delete that record
      // TODO: get the newly created recordID after a save transaction is completed
      FTEFormGroup.patchValue({
        toBeDeleted: true,
        updated: false
      });
    } else {
      FTEFormGroup.patchValue({
        updated: true
      });
    }

    if (fteReplace) {
      FTEFormGroup.patchValue({
        fte: fteReplaceValue
      });
      // {
      //   onlySelf: true,
      //   emitEvent: true,
      //   emitModelToViewChange: true,
      //   emitViewToModelChange: true
      // });
    }

    // update the monthly total
    this.updateMonthlyTotal(j);

    // set the border color for the monthly totals inputs
    this.setMonthlyTotalsBorder();

    // In order to browse month by month without having to click "Save" everytime,
    // we need to cache all the modified data and either update it as it changes or add a new object if its a new instance
    // The teamFTEsFlatLive is a realtime array that will track the updates and be referenced everytime the buildFTEEntryForm is called
    //  So in order to keep this array up to date, anytime a user edits the fte input box, it will look for the index in the array
    //  If the index is found, the fte will be updated, otherwise a new object will be pushed
    const foundIndex = this.teamFTEsFlatLive.findIndex(o =>
      o['allocations:emailAddress'] === FTEFormGroup.value.emailAddress &&
      o.projectID === FTEFormGroup.value.projectID &&
      moment(o['allocations:fiscalDate']).utc().format('YYYY-MM-DD') ===
      moment(FTEFormGroup.value.month, 'MM-DD-YYYY').format('YYYY-MM-DD')
    );

    if (foundIndex !== -1) {
      this.teamFTEsFlatLive[foundIndex]['allocations:fte'] = FTEFormGroup.value.fte;
    } else {
      this.teamFTEsFlatLive.push({
        planName: this.currentPlan,
        projectID: FTEFormGroup.value.projectID,
        projectName: FTEFormGroup.value.projectName,
        ['allocations:recordID']: FTEFormGroup.value.recordID,
        ['allocations:fullName']: FTEFormGroup.value.fullName,
        ['allocations:emailAddress']: FTEFormGroup.value.emailAddress,
        ['allocations:fiscalDate']: moment(FTEFormGroup.value.month, 'MM-DD-YYYY').format('YYYY-MM-DD HH:mm:ss'),
        ['allocations:fte']: FTEFormGroup.value.fte
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

    this.createFtePlanningChartData(this.projects);

  }


  updateMonthlyTotal(index) {

    // initialize a temporary variable, set to zero
    let total = 0;

    // set the outer form array of projects and months
    const FTEFormArray = <FormArray>this.FTEFormGroup.controls.FTEFormArray;

    // loop through each project
    FTEFormArray.controls.forEach( project => {
      project['controls'].forEach( (month, i) => {
        if (i === index) {
          total += +month.value.fte;
        }
      });
    });

    // set to null if zero (to show blank) and round to one significant digit
    total = total === 0 ? null : Math.round(total * 10) / 10;

    // set the monthly totals property at the index
    this.monthlyTotals[index] = total;

  }


  updateMonthlyTotals() {

    // initialize a temporary array with zeros to hold the totals
    let totals = new Array(36).fill(0);

    // set the outer form array of projects and months
    const FTEFormArray = <FormArray>this.FTEFormGroup.controls.FTEFormArray;

    // loop through each project
    FTEFormArray.controls.forEach( project => {
      project['controls'].forEach( (month, i) => {
        totals[i] += +month.value.fte;
      });
    });

    // replace the zeros with nulls to show blanks
    totals = totals.map(total => {
      return total === 0 ? null : total;
    });

    // round the totals to one significant digit
    totals = totals.map(total => {
      return total ? Math.round(total * 10) / 10 : null;
    });

    // set the monthly totals property
    this.monthlyTotals = totals;
  }

  // set red border around totals that don't total to 1
  setMonthlyTotalsBorder() {

    this.monthlyTotals.forEach((total, index) => {

      // get a reference to the input element using jquery
      const $totalEl = $(`input.fte-totals-column[month-index="${index}"]`);

      if (!total) {
        // console.log(`month ${index} total is null(${total})`);
        this.monthlyTotalsValid[index] = true;
      } else if (total !== 1) {
        // console.log(`month ${index} does NOT total to 1.0 (${total})`);
        this.monthlyTotalsValid[index] = false;
      } else {
        // console.log(`month ${index} DOES total to 1.0 (${total})`);
        this.monthlyTotalsValid[index] = true;
      }
    });
  }


  onTestFormClick() {
    // console.log('form object (this.form):');
    // console.log(this.FTEFormGroup);
    // console.log('form data (this.form.value.FTEFormArray):');
    // console.log(this.FTEFormGroup.value.FTEFormArray);
    // console.log('fte-project-visible array');
    // console.log(this.fteProjectVisible);
    // console.log('teamFTE', this.teamFTEs);
    // console.log('allTeamFTE', this.allTeamFTEs);
    // console.log('teamFTEFlat', this.teamFTEsFlat);
    // console.log('teamFTEFlatLive', this.teamFTEsFlatLive);
    // console.log('FTE Form Group LIVE', this.FTEFormGroupLive);
    // console.log('this.allProjects', this.allProjects)
    // console.log('this.projects', this.projects)
    // console.log('this.allEmployees', this.allEmployees);
    // console.log('this.employees', this.employees)
    // console.log('this.fteMonthsChart', this.fteMonthsChart)
    // console.log('this.fteChartData', this.fteChartData)
    console.log('team org', this.teamOrgStructure)

  }

  onSaveClick() {

    // const fteData = this.FTEFormGroup.value.FTEFormArray;
    const fteData = this.FTEFormGroupLive;

    const t0 = performance.now();

    // call the api data service to send the put request
    this.apiDataFteService.updateTeamData(fteData, this.authService.loggedInUser.id, this.currentPlan)
    .subscribe(
      res => {
        const t1 = performance.now();
        console.log(`save fte values took ${t1 - t0} milliseconds`);
        this.cacheService.raiseToast('success', res.message);
        // this.resetProjectFlags();
        // this.fteComponentInit();  // re-fetch the data to get newly inserted recordIDs

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

    // // Create an array of only newly added projects to add to the project-employee-role table
    // const newlyAddedProjects: any = [];
    // for (let i = 0; i < fteData.length; i++) {
    //   if (fteData[i][0].newlyAdded === true) {
    //     newlyAddedProjects.push({
    //       projectID: fteData[i][0].projectID,
    //       jobTitleID: this.authService.loggedInUser.jobTitleID,
    //       jobSubTitleID: this.authService.loggedInUser.jobSubTitleID
    //     });
    //   }
    // }
    // // If array is empty, new roles don't have to be updated
    // if (newlyAddedProjects !== undefined || newlyAddedProjects.length !== 0) {
    //   this.apiDataProjectService.insertBulkProjectEmployeeRole(newlyAddedProjects, this.authService.loggedInUser.id)
    //   .subscribe(
    //     res => {
    //       console.log('Successfully inserted bulk data into project employee role table');
    //     },
    //     err => {
    //       console.log(err);
    //     }
    //   );
    // }

  }

  buildMonthsArray() {
    // build an array of months that matches the slider length, based on today's date
    const startDate = moment().utc().startOf('year').subtract(2, 'months').subtract(1, 'years');
    const endDate = moment(startDate).add(3, 'years');

    const numMonths = endDate.diff(startDate, 'months');

    for (let i = 0; i < numMonths; i++) {
      this.months.push(moment(startDate).add(i, 'months'));
    }

    for (let i = 0; i < this.teamOrgStructure.employees.length; i++) {
      this.allEmployees.push({
        employeeID: this.teamOrgStructure.employees[i].employeeID,
        fullName: this.teamOrgStructure.employees[i].fullName,
        emailAddress: this.teamOrgStructure.employees[i].emailAddress
      });
      this.employees = this.allEmployees;
    }

  }

  buildFteEntryForm() {
    this.FTEFormGroup = this.fb.group({
      FTEFormArray: this.fb.array([])
    });
    // grab the Project formarray
    const FTEFormArray = <FormArray>this.FTEFormGroup.controls.FTEFormArray;

    this.toolsService.clearFormArray(FTEFormArray); // remove any existing form groups in the array

    this.fteProjectVisible.length = 0;  // clear out project visibility

    // loop through each project to get into the FTE entry elements
    this.teamFTEs.forEach( (proj: TeamFTEs) => {

      this.addProjectToFteForm(FTEFormArray, proj, false);
    });

    // update the totals row
    this.updateMonthlyTotals();

    // set red border around total inputs that don't sum up to 1
    this.setMonthlyTotalsBorder();

    this.checkIfNoProjectsVisible();

  }

  addProjectToFteForm(FTEFormArray: FormArray, proj: TeamFTEs, newProject: boolean) {

    // make each project visible to start
    this.fteProjectVisible.push(true);

    const projFormArray = this.fb.array([]); // instantiating a temp formarray for each project

    this.employees.forEach(employee => {
      // for each FTE entry in a given project, push the FTE controller into the temp formarray
      // so we will have 1 controller per month, one array of controllers per project

      // attempt to find a record/object for this project and month
      const foundEntry = this.teamFTEsFlatLive.find(teamFTE => {
        if (newProject) {
          return false;
        } else {
          return proj.projectID === teamFTE.projectID &&
            moment(this.setMonth).format('MM-DD-YYYY') === moment(teamFTE['allocations:fiscalDate']).utc().format('MM-DD-YYYY') &&
            employee.emailAddress === teamFTE['allocations:emailAddress'];
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
          month: [moment(this.setMonth).format('MM-DD-YYYY')],
          fte: [foundEntry ? this.decimalPipe.transform(foundEntry['allocations:fte'], '1.1') : null],
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

  onTrashClick(index: number) {
    console.log('user clicked to delete project index ' + index);
    const FTEFormArray = <FormArray>this.FTEFormGroup.controls.FTEFormArray;
    const deletedProject: any = FTEFormArray.controls[index];
    // emit confirmation modal after they click delete button
    this.cacheService.confirmModalData.emit(
      {
        title: 'Confirm Deletion',
        message: `Are you sure you want to permanently delete all FTE values for project ${deletedProject.projectName}?`,
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
            this.fteProjectVisible.splice(index, 1);
            FTEFormArray.controls.splice(index, 1);
            this.updateMonthlyTotals();
            this.setMonthlyTotalsBorder();
            this.cacheService.raiseToast('success', deleteResponse.message);
            deleteActionSubscription.unsubscribe();

            this.getPlan(this.authService.loggedInUser.id, this.currentPlan);
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

  updateProjectVisibility(posStart: number, posDelta: number) {
    // reset project visibility
    this.fteProjectVisible.length = 0;

    // set new project visibility
    const FTEFormArray = <FormArray>this.FTEFormGroup.controls.FTEFormArray;  // get the formarray and loop through each project

    FTEFormArray.controls.forEach( project => {
      let nullCounter = posStart;

      for (let i = posStart; i < (posStart + posDelta); i++) {  // only look at the cells that are visible based on the slider
        const currProjControls = project['controls'][i].controls;
        if (currProjControls.fte.value) {
          // if any of the controls have an FTE value, break out of the loop and make the whole project visible
          i = posStart + posDelta;
          nullCounter = posStart; // reset nullCounter
          this.fteProjectVisible.push(true);
        } else { nullCounter++; }
      }
      if (nullCounter === (posStart + posDelta)) {
        // all nulls, so project shouldn't be displayed
        this.fteProjectVisible.push(false);
      }
    });
  }

  checkIfEmptyProjects(): string {
    const FTEFormArray = <FormArray>this.FTEFormGroup.controls.FTEFormArray;  // get the formarray and loop through each project
    let emptyCounter = 0;
    let emptyProjectName: string = null;

    FTEFormArray.controls.forEach( project => {
      // check if ALL months for a given project have an empty FTE value
      const projectEmpty = project['controls'].every( month => {
        const currProjControls = month.controls;
        return !currProjControls.fte.value;
      });
      // if so, disable the slider
      if (projectEmpty) {
        emptyCounter++;
        emptyProjectName = project.value[0].projectName;
      }
    });


    return emptyProjectName;
  }

  checkIfNoProjectsVisible() {
    // if all projects in the slider-defined view are false, then hide the FTE form div and display a different one
    if (this.fteProjectVisible.every( value => {
      return value === false;
    })) {
      this.displayFTETable = false;
    } else { this.displayFTETable = true; }
  }

  fteFormChangeListener() {
    // listen for any changes to the FTE form
    this.FTEFormGroup.valueChanges.subscribe( () => {
      this.checkIfEmptyProjects();
    });
  }

  trimProjects(numProjects: number) {
    this.projectList = this.projectList.slice(0, numProjects);
  }

  createProject() {
    setTimeout(() => {
      this.projectsCreateModalComponent.resetForm();
    }, 0);
  }

  onCreateSuccess(selectedProject: any) {

    console.log('Create project success. My Project List Refreshed');
    console.log('selectedProject', selectedProject);
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

      // loop through the already-built months array and initialize null FTEs for each month in this new project
      newProject.allocations = new Array<AllocationsArray>();

      const FTEFormArray = <FormArray>this.FTEFormGroup.controls.FTEFormArray;
      this.addProjectToFteForm(FTEFormArray, newProject, true);

      // Since a new project is being added, we need to move the last array thats
      //  being used dynamically for case-by-case updates, back to the end
      const tempArr = this.FTEFormGroupLive[this.FTEFormGroupLive.length - 1];
      this.FTEFormGroupLive.pop();
      this.FTEFormGroupLive.push(this.FTEFormGroup.value.FTEFormArray[this.FTEFormGroup.value.FTEFormArray.length - 1]);
      this.FTEFormGroupLive.push(tempArr);

      this.teamFTEs.push({
        planName: this.currentPlan,
        projectID: newProject.projectID,
        projectName: newProject.projectName,
        allocations: newProject.allocations
      });

      this.allTeamFTEs.push({
        planName: this.currentPlan,
        projectID: newProject.projectID,
        projectName: newProject.projectName,
        allocations: newProject.allocations
      });

      this.allProjects.push(FTEFormArray.controls[FTEFormArray.controls.length - 1]);
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
        projectID: 12,
        projectName: 'Arges50',
        ['allocations:recordID']: null,
        ['allocations:fullName']: this.allEmployees[0].fullName,
        ['allocations:emailAddress']: this.allEmployees[0].emailAddress,
        ['allocations:fiscalDate']: this.currentMonth,
        ['allocations:fte']: null
      });

      this.displayFTETable = true;
    } else {
      this.cacheService.raiseToast('error', `Failed to add Project ${selectedProject.ProjectName}.  It already exists in your FTE table`);
    }
  }

  getTeam(email: string) {
    return new Promise((p_res, p_err) => {
      // get list of subordinates
      this.apiDataOrgService.getOrgData(email)
      .subscribe(
        res => {
          this.teamOrgStructure = JSON.parse('[' + res[0].json + ']')[0];
          this.updateEmployeeFilters();
          this.buildMonthsArray();
          this.buildTeamEditableMembers();
          p_res();
        },
        err => {
          console.error('error getting nested org data');
          p_err();
        }
      );
    });
  }

  buildTeamEditableMembers() {
    // build the string of employee email address to use as a parameter for the SP resources.DisplayTeamFTE
    for (let i = 0; i < this.employees.length; i++) {
      this.teamEditableMembers = this.employees[i].emailAddress + '\',\'' + this.teamEditableMembers;
    }
    this.teamEditableMembers = this.teamEditableMembers.substr(0, this.teamEditableMembers.lastIndexOf(','));
    this.teamEditableMembers = '\'\'' + this.teamEditableMembers + '\'';
  }

  createNewPlan(emailAddress: any, userID: any, planName: string) {

    if (emailAddress === null) {
      emailAddress = this.teamEditableMembers;
    }
    if (userID === null) {
      userID = this.authService.loggedInUser.id;
    }

    // create new plan and get FTE data
    this.apiDataFteService.indexNewPlan(emailAddress, userID, planName)
    .subscribe(
      res => {
        this.allTeamFTEs = res.nested;
        this.teamFTEs = this.allTeamFTEs;
        this.teamFTEsFlat = res.flat;
        this.teamFTEsFlatLive = this.teamFTEsFlat;

        // Set month back to current/default
        this.currentMonth = moment(1, 'DD');
        this.currentMonthName = moment(this.currentMonth).format('MMMM');
        this.setMonth = this.currentMonth;
        this.setMonthName = moment(this.setMonth).format('MMMM');
        this.setYear = moment().year();

        this.buildFteEntryForm(); // initialize the FTE Entry form, which is dependent on FTE data being retrieved
        this.display = true;  // ghetto way to force rendering after FTE data is fetched
        const FTEFormArray = <FormArray>this.FTEFormGroup.controls.FTEFormArray;
        this.allProjects = FTEFormArray.controls;
        this.projects = this.allProjects;

        // Initialize the cache array for the FTEFormGroup, then add an extra element to add all edits in months other than the current
        this.FTEFormGroupLive = this.FTEFormGroup.value.FTEFormArray;
        this.FTEFormGroupLive.push([]);

        this.updateProjectFilters();

        this.getPlanList(this.authService.loggedInUser.id); // update the plan list with the new plan
      },
      err => {
        console.error(err);
      }
    );
  }

  getPlan(userID: any, planName: string) {
    return new Promise((p_res, p_err) => {
      // get FTE data for specific plan
      this.apiDataFteService.indexPlan(userID, planName)
      .subscribe(
        res => {
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

          this.updateProjectFilters();
          p_res();
        },
        err => {
          console.error(err);
          p_err();
        }
      );
    });
  }

  updateEmployeeFilters() {
    // Update list for employee dropdown filter
    for (let i = 0; i < this.teamOrgStructure.employees.length; i++ ) {
      this.filterEmployeesOptions.push({
        id: i + 1,
        name: this.teamOrgStructure.employees[i].fullName
      });
      this.filterEmployeesModel.push(i + 1);
    }

    // For some reason, this does not render dynamically, so this will force the rendering
    //  by accessing the model and updating the renderFilteredOptions manually
    this.filterEmployeesDropdown.renderFilteredOptions = this.filterEmployeesOptions;
  }

  updateProjectFilters() {
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
    // For some reason, this does not render dynamically, so this will force the rendering
    //  by accessing the model and updating the renderFilteredOptions manually
    this.filterProjectsDropdown.renderFilteredOptions = this.filterProjectsOptions;
    this.filterProjectsDropdown.model = this.filterProjectsModel;
  }

  getPlanList(userID: any) {
    // get the list of plans to load the Selection dropdown
    return new Promise((p_res, p_err) => {
      this.apiDataFteService.indexPlanList(userID)
      .subscribe(
        res => {
          this.planList = res;
          // If user doesn't have any plans, then set the default to undefined
          if (this.planList.length === 0) {
            this.defaultPlan = undefined;
          } else {
            // set the default plan to the latest plan
            this.defaultPlan = this.planList[0].planName;
            this.currentPlan = this.defaultPlan;
          }
          p_res();
        },
        err => {
          console.error(err);
          p_err();
        }
      );
    });
  }

  selectPlan(planName: string) {
    // set plan after selection
    this.currentPlan = planName;

    // get data for selected plan
    this.getPlan(this.authService.loggedInUser.id, this.currentPlan);
    this.setMonth = this.currentMonth;
    this.setMonthName = moment(this.setMonth).format('MMMM');
    this.setYear = moment().year();
  }

  deletePlan() {
    // hide the fte form while delete and reload functions are running
    this.displayFTETable = false;

    // create object with delete data
    const planData = {
      planName: this.currentPlan,
      userID: this.authService.loggedInUser.id
    };

    this.apiDataFteService.deletePlan(planData)
      .subscribe(
        res => {
          console.log('plan deleted', res);

          // empty arrays so it won't have objects appended when the buildMonthsArray() function runs
          this.employees = [];
          this.teamEditableMembers = '';

          // if user deletes the last plan, need to handle it the same as ngoninit
          this.getPlanList(this.authService.loggedInUser.id).then(
            res1 => {
            if (this.defaultPlan === undefined) {
              this.getTeam('ethan_hunt@keysight.com').then(
                res2 => this.createNewPlan(this.teamEditableMembers, this.authService.loggedInUser.id, 'New Plan 1'));
            } else {
              this.getTeam('ethan_hunt@keysight.com').then(res3 => this.getPlan(this.authService.loggedInUser.id, this.defaultPlan));
            }
          });
          this.currentMonth = moment(1, 'DD');
          this.currentMonthName = moment(this.currentMonth).format('MMMM');
          this.setMonth = this.currentMonth;
          this.setMonthName = moment(this.setMonth).format('MMMM');
          this.setYear = moment().year();
        },
        err => {
          console.error(err);
        }
      );
  }

  onPreviousMonthClick() {
    // Set month to next month and format
    this.setMonth = moment(this.setMonth).subtract(1, 'months');
    this.setMonthName = moment(this.setMonth).format('MMMM');
    this.setYear = moment(this.setMonth).format('YYYY');

    // rebuild the FTE entry page to show selected month
    this.buildFteEntryForm();
    this.displayFTETable = true;

    // disable the previous button to prevent user from going into past months
    if (moment(this.setMonth) <= moment(this.currentMonth)) {
      this.disablePreviousMonth = true;
    } else {
      this.disablePreviousMonth = false;
    }
  }

  onNextMonthClick() {
    // Set month to next month and format
    this.setMonth = moment(this.setMonth).add(1, 'months');
    this.setMonthName = moment(this.setMonth).format('MMMM');
    this.setYear = moment(this.setMonth).format('YYYY');

    // rebuild the FTE entry page to show selected month
    this.buildFteEntryForm();
    this.displayFTETable = true;

    // disable the previous button to prevent user from going into past months
    if (moment(this.setMonth) <= moment(this.currentMonth)) {
      this.disablePreviousMonth = true;
    } else {
      this.disablePreviousMonth = false;
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
    // allEmployees will always contain the full project list
    this.employees = this.allEmployees.filter(o1 => this.filterEmployees.some(o2 => o1.fullName === o2.name));

    console.log('employees', this.employees);
    this.buildFteEntryForm(); // initialize the FTE Entry form, which is dependent on FTE data being retrieved
    this.display = true;  // ghetto way to force rendering after FTE data is fetched
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
    // update the teamFTEs to remove the projects from the display
    // allTeamFTEs will always contain the full teamFTE list
    this.teamFTEs = this.allTeamFTEs.filter(o1 => this.projects.some(o2 => o1.projectName === o2.projectName));

    this.buildFteEntryForm(); // initialize the FTE Entry form, which is dependent on FTE data being retrieved
    this.display = true;  // ghetto way to force rendering after FTE data is fetched

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
    // if chart already exists, destroy it before re-drawing
    this.ftePlanningSeriesOptions = {
        chart: {
          type: 'column'
        },
        title: {
          text: 'Team FTE Planning for FY' + this.setYear
        },
        // subtitle: {
        //   text: 'Viewing Plan: ' + this.currentPlan
        // },
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
            '<td style="padding:0"><b>{point.y:.1f} mm</b></td></tr>',
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
        // series: [{name: 'TEST', data: [1, 4, 3, 0, 0, 0, 0, 0, 0, 0, 0, 2]}]
    };

    this.ftePlanningChart = Highcharts.chart('FTEPlanningChart', this.ftePlanningSeriesOptions);
  }
}
