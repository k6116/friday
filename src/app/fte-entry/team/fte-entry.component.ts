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
  fteMonthVisible = new Array(12).fill(true);  // boolean array for by-month FTE form display
  fteMonthEditable = new Array(12).fill(true);  // boolean array for by-month FTE box disabling
  fteProjectVisible = new Array;  // boolean array for by-project row display
  fteProjectDeletable = new Array;  // boolean array for by-project delete-ability
  FTEFormGroup: FormGroup;
  sliderRange: number[] = []; // contains the live slider values
  teamFTEs: any;  // array to store team FTE data
  teamFTEsFlat: any;  // array to store team FTE data (flattened/non-treeized version)
  display: boolean; // TODO: find a better solution to FTE display timing issue
  displayFTETable = false;
  projects: any;  // for aliasing formarray
  months: string[] = [];
  monthlyTotals: number[];
  monthlyTotalsValid: boolean[];
  showProjectsModal: boolean;
  projectList: any;
  timer: any;
  jobTitleList: any;
  fteEmployeeVisible: any;
  teamOrgStructure: any;
  employees: string[] = [];

  fteTutorialState = 0; // for keeping track of which part of the tutorial we're in, and passing to child component

  @ViewChild(ProjectsCreateModalComponent) projectsCreateModalComponent;

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
    this.projectList = [
      {projectID: 9990, projectName: 'testawef1'},
      {projectID: 9991, projectName: 'testawef2'},
      {projectID: 1164, projectName: 'Jarvis'}
    ];
    this.getTeam('ethan_hunt@keysight.com');
    // this.fteComponentInit();  // initialize the FTE entry component

    // this.buildMonthsArray();
    this.fteFormChangeListener();

    $('[data-toggle="tooltip"]').tooltip();

    // this.makeFyLabels();

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
    const fteFormArray = this.FTEFormGroup.controls.FTEFormArray;
    const currentProjectsList = [];
    fteFormArray['controls'].forEach( project => {
      currentProjectsList.push(project.projectID);
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
      this.months.forEach( month => {
        const newMonth = new AllocationsArray;
        // newMonth.fullName = moment(month).utc().format();
        newMonth.fte = null;
        newMonth.recordID = null;
        newProject.allocations.push(newMonth);
      });

      const FTEFormArray = <FormArray>this.FTEFormGroup.controls.FTEFormArray;
      this.addProjectToFteForm(FTEFormArray, newProject, true);
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
    // console.log(`fte entry changed for project ${i}, month ${j}, with value ${value}`);

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
    console.log('form object (this.form):');
    console.log(this.FTEFormGroup);
    console.log('form data (this.form.value.FTEFormArray):');
    console.log(this.FTEFormGroup.value.FTEFormArray);
    console.log('fte-project-visible array');
    console.log(this.fteProjectVisible);
    console.log('Team FTE', this.teamFTEs);
  }

  onSaveClick() {

    const firstEditableMonth = this.fteMonthEditable.findIndex( value => {
      return value === true;
    });

    // validate totals boxes for current quarter (must = 1)
    const currentQuarterValid = this.monthlyTotals.slice(firstEditableMonth, firstEditableMonth + 3).every( value => {
      return value === 1;
    });

    // validate totals boxes for future quarters (must be < 1)
    const futureQuartersValid = this.monthlyTotals.slice(firstEditableMonth + 3).every( value => {
      return value <= 1;
    });

    // only save if all quarters are valid
    if (currentQuarterValid && futureQuartersValid) {
      const fteData = this.FTEFormGroup.value.FTEFormArray;
      const t0 = performance.now();

      // call the api data service to send the put request
      this.apiDataFteService.updateUserData(fteData, this.authService.loggedInUser.id)
      .subscribe(
        res => {
          const t1 = performance.now();
          console.log(`save fte values took ${t1 - t0} milliseconds`);
          this.cacheService.raiseToast('success', res.message);
          this.resetProjectFlags();
          this.fteComponentInit();  // re-fetch the data to get newly inserted recordIDs
          this.FTEFormGroup.markAsUntouched();
        },
        err => {
          console.log(err);
          this.cacheService.raiseToast('error', `${err.status}: ${err.statusText}`);
        }
      );

      // Create an array of only newly added projects to add to the project-employee-role table
      const newlyAddedProjects: any = [];
      for (let i = 0; i < fteData.length; i++) {
        if (fteData[i][0].newlyAdded === true) {
          newlyAddedProjects.push({
            projectID: fteData[i][0].projectID,
            jobTitleID: this.authService.loggedInUser.jobTitleID,
            jobSubTitleID: this.authService.loggedInUser.jobSubTitleID
          });
        }
      }
      // If array is empty, new roles don't have to be updated
      if (newlyAddedProjects !== undefined || newlyAddedProjects.length !== 0) {
        this.apiDataProjectService.insertBulkProjectEmployeeRole(newlyAddedProjects, this.authService.loggedInUser.id)
        .subscribe(
          res => {
            console.log('Successfully inserted bulk data into project employee role table');
          },
          err => {
            console.log(err);
          }
        );
      }


    } else if (!currentQuarterValid) {
      const invalidValues = [];
      this.monthlyTotals.slice(firstEditableMonth, firstEditableMonth + 3).forEach( value => {
        if (value !== 1) {
          invalidValues.push(value);
        }
      });
      this.cacheService.raiseToast('error', `FTE values in the current quarter must total to 1.
      Please correct the ${invalidValues.length} months and try again.`);
    } else if (!futureQuartersValid) {
      const invalidValues = [];
      this.monthlyTotals.slice(firstEditableMonth + 3).forEach( value => {
        if (value > 1) {
          invalidValues.push(value);
        }
      });
      this.cacheService.raiseToast('error', `FTE values in future quarters must not total to more than 1.
      Please correct the ${invalidValues.length} months in future quarters and try again.`);
    } else {
      this.cacheService.raiseToast('error', 'An unknown error has occurred while saving.  Please contact the administrators.');
    }
  }


  fteComponentInit() {
    // get FTE data
    this.apiDataFteService.indexTeamData('paul_sung@keysight.com', '08-01-2018')
    .subscribe(
      res => {
        // console.log('indexUserData', res.nested);
        console.log('Team FTE Comp Init', res);
        this.teamFTEs = res.nested;
        this.teamFTEsFlat = res.flat;
        this.buildFteEditableArray();
        this.buildFteEntryForm(); // initialize the FTE Entry form, which is dependent on FTE data being retrieved
        this.display = true;  // ghetto way to force rendering after FTE data is fetched
        // this.projects = this.userFTEs;
        const FTEFormArray = <FormArray>this.FTEFormGroup.controls.FTEFormArray;
        this.projects = FTEFormArray.controls;
        console.log('this.Projects', this.projects);
      },
      err => {
        console.error(err);
      }
    );
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
      this.employees.push(this.teamOrgStructure.employees[i].fullName);
    }
    console.log('Months', this.months);

    console.log('Employees', this.employees);
  }

  buildFteEditableArray() {
    // build a boolean array of FTE entry months that are editable, based on current month
    const startMonth = this.months[0];
    let currentMonth = moment.utc().startOf('month');
    const secondMonthInQuarter = [2, 5, 8, 11];
    const thirdMonthInQuarter = [0, 3, 6, 9];

    // we want current fiscal quarter to be editable as long as we are in that FQ,
    // so adjust the current month to allow all months in the current quarter to be editable
    if (thirdMonthInQuarter.includes(moment(currentMonth).month())) {
      currentMonth = moment(currentMonth).subtract(2, 'months');
    } else if (secondMonthInQuarter.includes(moment(currentMonth).month())) {
      currentMonth = moment(currentMonth).subtract(1, 'month');
    }

    // find the number of months between the start of the FTE display and current month
    const monthsBetween = currentMonth.diff(startMonth, 'months');
    this.fteMonthEditable.fill(false, 0, monthsBetween);  // zero-indexed
  }

  buildFteEntryForm() {
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

    this.updateProjectDeletability();

  }

  addProjectToFteForm(FTEFormArray: FormArray, proj: TeamFTEs, newProject: boolean) {

    // make each project visible to start
    this.fteProjectVisible.push(true);
    if (newProject) {
      // if function call is triggered by a new project addition, automatically make it deletable
      this.fteProjectDeletable.push(true);
    }
    const projFormArray = this.fb.array([]); // instantiating a temp formarray for each project

    this.employees.forEach(employee => {
      // for each FTE entry in a given project, push the FTE controller into the temp formarray
      // so we will have 1 controller per month, one array of controllers per project

      // attempt to find a record/object for this project and month
      const foundEntry = this.teamFTEsFlat.find(teamFTE => {
        if (newProject) {
          return false;
        } else {
          return proj.projectID === teamFTE.projectID && employee === teamFTE['allocations:fullName'];
        }
      });

      projFormArray.push(
        this.fb.group({
          recordID: [foundEntry ? foundEntry['allocations:recordID'] : null],
          projectID: [proj.projectID],
          projectName: [proj.projectName],
          fullName: [employee],
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

  makeFyLabels() {
    // generate slider labels based on current date
    let startDate = moment().startOf('year').subtract(2, 'months'); // first day of this FY
    startDate = moment(startDate).subtract(1, 'year');  // first day of last FY
    const month = moment(startDate).month();
    let firstQuarter = moment(startDate).fquarter(-3).quarter;
    let firstYear = moment(startDate).fquarter(-3).year;

    // make an array of label strings, ie - [Q4'17, Q1'18]
    for ( let i = 0; i < 12; i++) {
      this.fqLabelArray.push(`Q${firstQuarter} - ${firstYear.toString().slice(2)}`);
      firstQuarter++;
      if (firstQuarter > 4) {
        this.fyLabelArray.push(`${firstYear.toString()}`);
        firstYear++;
        firstQuarter = 1;
      }
    }
  }

  onTrashClick(index: number) {
    console.log('user clicked to delete project index ' + index);
    const FTEFormArray = <FormArray>this.FTEFormGroup.controls.FTEFormArray;
    const deletedProject: any = FTEFormArray.controls[index];
    // emit confirmation modal after they click delete button
    this.cacheService.confirmModalData.emit(
      {
        title: 'Confirm Deletion',
        message: `Are you sure you want to permanently delete all of your FTE values for project ${deletedProject.projectName}?`,
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

        const deleteActionSubscription = this.apiDataFteService.destroyUserProject(toBeDeleted, this.authService.loggedInUser.id).subscribe(
          deleteResponse => {
            // only delete from the projectemployeerole table if user is deleting a non-newlyAdded project
            this.fteProjectVisible.splice(index, 1);
            this.fteProjectDeletable.splice(index, 1);
            FTEFormArray.controls.splice(index, 1);
            this.updateMonthlyTotals();
            this.setMonthlyTotalsBorder();
            console.log('stuff was updated');
            this.cacheService.raiseToast('success', deleteResponse.message);
            deleteActionSubscription.unsubscribe();
          },
          deleteErr => {
            this.cacheService.raiseToast('warn', `${deleteErr.status}: ${deleteErr.statusText}`);
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

  updateProjectDeletability() {
    // reset project deletability
    this.fteProjectDeletable.length = 0;

    const FTEFormArray = <FormArray>this.FTEFormGroup.controls.FTEFormArray;  // get the formarray and loop through each project
    const firstDeletableMonth = this.fteMonthEditable.findIndex( value => {
      return value; // look for the first month that is editable
    });

    FTEFormArray.controls.forEach( project => {
      let nullCounter = 0;

      for (let i = 0; i < firstDeletableMonth; i++) {
        const currProjControls = project['controls'][i].controls;
        if (currProjControls.fte.value) {
          // if any of the controls have an FTE value, break out of the loop and make the whole project not deletable
          i = firstDeletableMonth;
          nullCounter = 0; // reset nullCounter
          this.fteProjectDeletable.push(false);
        } else { nullCounter++; }
      }
      if (nullCounter === firstDeletableMonth) {
        // all historic FTE values are null, so project can safely be deleted
        this.fteProjectDeletable.push(true);
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

  getTeam(email: string) {
    // get list of subordinates
    this.apiDataOrgService.getOrgData(email)
    .subscribe(
      res => {
        this.teamOrgStructure = JSON.parse('[' + res[0].json + ']')[0];
        console.log('this.teamOrgStructure', this.teamOrgStructure);
        this.fteMonthVisible = new Array(this.teamOrgStructure.employees.length).fill(true);
        this.buildMonthsArray();
        // console.log('Build month array');
        this.makeFyLabels();
        this.fteComponentInit();
      },
      err => {
        console.error('error getting nested org data');
      }
    );
  }

}
