import { Component, OnInit, AfterViewInit, OnDestroy, Input, ChangeDetectorRef } from '@angular/core';
import { FormGroup, FormArray, FormControl, Validators, FormBuilder } from '@angular/forms';
import { trigger, state, style, transition, animate, keyframes, group } from '@angular/animations';
import { DecimalPipe } from '@angular/common';
import { HostListener } from '@angular/core';
import { NouisliderModule } from 'ng2-nouislider';
import { Subscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';

import { AuthService } from '../../_shared/services/auth.service';
import { ApiDataProjectService, ApiDataFteService, ApiDataJobTitleService } from '../../_shared/services/api-data/_index';
import { CacheService } from '../../_shared/services/cache.service';
import { ToolsService } from '../../_shared/services/tools.service';
import { ComponentCanDeactivate } from '../../_shared/guards/unsaved-changes.guard';
import { UserFTEs, AllocationsArray} from './fte-model';
import { utils, write, WorkBook } from 'xlsx';
import { saveAs } from 'file-saver';
import { JAN } from '@angular/material';

const moment = require('moment');
require('moment-fquarter');

declare const require: any;
declare const $: any;
declare const introJs: any;

@Component({
  selector: 'app-fte-entry',
  templateUrl: './fte-entry.component.html',
  styleUrls: ['./fte-entry.component.css', '../../_shared/styles/common.css'],
  providers: [DecimalPipe],
  animations: [
    trigger('colState', [
      state('1', style({
        transform: 'translateX(0)',
        opacity: 1
      })),
      state('0', style({
        transform: 'translateX(-100%)',
        opacity: 0
      })),
      transition('0 => 1', [
        animate('100ms ease-in')
      ]),
      transition('1 => 0', [
        animate('100ms ease-out')
      ])
    ])
  ]
})
export class FteEntryEmployeeComponent implements OnInit, OnDestroy, ComponentCanDeactivate {

  // initialize variables
  deleteModalSubscription: Subscription;
  mainSliderConfig: any;  // slider config
  sliderDisabled = false;
  fqLabelArray = new Array; // for labeling fiscal quarters in FTE table
  fyLabelArray = new Array; // for labeling fiscal years in slider header
  fteQuarterVisible = new Array(12).fill(false);  // boolean array for by-month FTE form display
  fteMonthVisible = new Array(36).fill(false);  // boolean array for by-month FTE form display
  fteMonthEditable = new Array(36).fill(true);  // boolean array for by-month FTE box disabling
  fteProjectVisible = new Array;  // boolean array for by-project row display
  fteProjectDeletable = new Array;  // boolean array for by-project delete-ability
  FTEFormGroup: FormGroup;
  sliderRange: number[] = []; // contains the live slider values
  userFTEs: any;  // array to store user FTE data
  userFTEsFlat: any;  // array to store user FTE data (flattened/non-treeized version)
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

  fteTutorialState = 0; // for keeping track of which part of the tutorial we're in, and passing to child component

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private apiDataProjectService: ApiDataProjectService,
    private apiDataFteService: ApiDataFteService,
    private apiDataJobTitleService: ApiDataJobTitleService,
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
    this.setSliderConfig(); // initalize slider config

    this.fteComponentInit();  // initialize the FTE entry component

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

   this.buildMonthsArray();
   this.fteFormChangeListener();
   this.getJobTitleList();

  }

  ngOnDestroy() {
    clearInterval(this.timer);
    this.changeDetectorRef.detach();
  }

  // define tutorial steps
  // we need to break it into 3 individual tutorial parts, because we need to execute part2 within a child component
  tutorialPart1() {
    this.fteTutorialState = 0;
    this.fteTutorialState++;
    const intro = introJs();
    intro.setOptions({
      steps: [
        {
          // no element means the tutorial step doesn't focus any particular element
          intro: 'Welcome to Jarvis Resources!'
        },
        {
          // define steps like this. element = HTML id for a specific element
          intro: `First, let's add a project to your project list.  Click this button to add a project.`,
          element: '#intro-add-project'
        }
      ],
      overlayOpacity: 0.4,
      exitOnOverlayClick: false,
      showStepNumbers: false,
      keyboardNavigation: false
    });
    intro.start('.tutorial-part1'); // include a specific css class to run only a subset of steps
  }

  tutorialPart3(currentState: number) {
    this.fteTutorialState = currentState;
    const intro = introJs();
    intro.setOptions({
      steps: [
        {
          intro: `Great!  Now you can add FTEs (full-time employee) to show your contribution to this project.
            Please enter a value between 0 and 1, representing the proportion of your time each month you spend
            working on this project.`,
          element: '#intro-add-ftes'
        },
        {
          intro: `Your total FTEs in each month should sum to 1, representing 100% of your time being allocated each month.`,
          element: '#intro-fte-total'
        },
        {
          intro: `You can use the slider to view your past and future FTE entries.  Past values can't be changed anymore,
            but future values can be forecasted if you wish.`,
          element: '#intro-slider'
        },
        {
          intro: `Don't forget to save your work!`,
          element: '#intro-save'
        },
        {
          intro: `That concludes the tutorial.  Thanks for using Jarvis Resources!`
        }
      ],
      overlayOpacity: 0.4,
      exitOnOverlayClick: false,
      showStepNumbers: false,
      keyboardNavigation: false
    });
    intro.start('.tutorial-part3');
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
      const newProject = new UserFTEs;
      newProject.userID = this.authService.loggedInUser.id;
      newProject.projectID = selectedProject.ProjectID;
      newProject.projectName = selectedProject.ProjectName;
      newProject.jobTitleID = selectedProject.JobTitleID;
      newProject.jobSubTitleID = selectedProject.JobSubTitleID;
      newProject.newlyAdded = true;

      // map the jobTitle and jobSubTitle IDs
      for (let i = 0; i < this.jobTitleList.length; i++) {
        for (let j = 0; j < this.jobTitleList[i].jobTitleMap.jobSubTitles.length; j++) {
          if (this.jobTitleList[i].id === selectedProject.JobTitleID) {
            if (this.jobTitleList[i].jobTitleMap.jobSubTitles[j].id === selectedProject.JobSubTitleID) {
              newProject.jobTitle = this.jobTitleList[i].jobTitleName;
              newProject.jobSubTitle = this.jobTitleList[i].jobTitleMap.jobSubTitles[j].jobSubTitleName;
            }
          }
        }
      }

      // loop through the already-built months array and initialize null FTEs for each month in this new project
      newProject.allocations = new Array<AllocationsArray>();
      this.months.forEach( month => {
        const newMonth = new AllocationsArray;
        newMonth.month = moment(month).utc().format();
        newMonth.fte = null;
        newMonth.recordID = null;
        newProject.allocations.push(newMonth);
      });

      const FTEFormArray = <FormArray>this.FTEFormGroup.controls.FTEFormArray;
      this.addProjectToFteForm(FTEFormArray, newProject, true);
      this.sliderDisabled = true;
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
      // check for still valid format such as .6, 1., 1
      if (/^[.][1-9]{1}$/.test(value) || /^[1][.]$/.test(value) || /^[1]$/.test(value)) {
        fteReplaceValue = this.decimalPipe.transform(value, '1.1');
      } else {
        fteReplaceValue = null;
      }
    }
    console.log(`match is ${match}, replacement value: ${fteReplaceValue}, at ${i}, ${j}`);

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
    this.apiDataFteService.indexUserData(this.authService.loggedInUser.id)
    .subscribe(
      res => {
        // console.log('indexUserData', res.nested);
        this.userFTEs = res.nested;
        this.userFTEsFlat = res.flat;
        this.buildFteEditableArray();
        this.buildFteEntryForm(); // initialize the FTE Entry form, which is dependent on FTE data being retrieved
        this.display = true;  // ghetto way to force rendering after FTE data is fetched
        // this.projects = this.userFTEs;
        const FTEFormArray = <FormArray>this.FTEFormGroup.controls.FTEFormArray;
        this.projects = FTEFormArray.controls;
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
    this.userFTEs.forEach( (proj: UserFTEs) => {

      this.addProjectToFteForm(FTEFormArray, proj, false);
    });

    // update the totals row
    this.updateMonthlyTotals();

    // set red border around total inputs that don't sum up to 1
    this.setMonthlyTotalsBorder();

    this.checkIfNoProjectsVisible();

    this.updateProjectDeletability();

  }

  addProjectToFteForm(FTEFormArray: FormArray, proj: UserFTEs, newProject: boolean) {

    // make each project visible to start
    this.fteProjectVisible.push(true);
    if (newProject) {
      // if function call is triggered by a new project addition, automatically make it deletable
      this.fteProjectDeletable.push(true);
    }
    const projFormArray = this.fb.array([]); // instantiating a temp formarray for each project

    this.months.forEach(month => {
      // for each FTE entry in a given project, push the FTE controller into the temp formarray
      // so we will have 1 controller per month, one array of controllers per project

      // attempt to find a record/object for this project and month
      const foundEntry = this.userFTEsFlat.find(userFTE => {
        if (newProject) {
          return false;
        } else {
          return proj.projectID === userFTE.projectID && moment(month).unix() === moment(userFTE['allocations:month']).unix();
        }
      });

      projFormArray.push(
        this.fb.group({
          recordID: [foundEntry ? foundEntry['allocations:recordID'] : null],
          projectID: [proj.projectID],
          projectName: [proj.projectName],
          jobTitleID: [proj.jobTitleID],
          jobSubTitleID: [proj.jobSubTitleID],
          newlyAdded: [proj.newlyAdded],
          month: [month],
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
    // tempProj.projectRole = proj.projectRole;
    tempProj.jobTitle = proj.jobTitle;
    tempProj.jobTitleID = proj.jobTitleID;
    tempProj.jobSubTitle = proj.jobSubTitle;
    tempProj.jobSubTitleID = proj.jobSubTitleID;
    tempProj.newlyAdded = proj.newlyAdded;
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

  setSliderConfig() {

    this.makeFyLabels();

    // set slider starting range based on current date
    const startDate = moment().startOf('month');
    const month = moment(startDate).month();
    if (month === 10 || month === 11 || month === 0) {
      this.sliderRange = [4, 6]; // Q1
    } else if (month === 1 || month === 2 || month === 3) {
      this.sliderRange = [5, 7]; // Q2
    } else if (month === 4 || month === 5 || month === 6) {
      this.sliderRange = [6, 8];
    } else {
      this.sliderRange = [7, 9];
    }

    // initialize the by-month FTE display with the slider range handles
    this.fteQuarterVisible = this.fteQuarterVisible.fill(true, this.sliderRange[0], this.sliderRange[1]);
    this.fteMonthVisible = this.fteMonthVisible.fill(true, this.sliderRange[0] * 3, this.sliderRange[1] * 3);

    // make array of values for slider pips
    const pipValues = [];
    for (let i = 0; i <= 12; i = i + 0.5) {
      pipValues.push(i);
    }
    const fqLabelArray = this.fqLabelArray;

    // set slider config
    this.mainSliderConfig = {
      behaviour: 'tap-drag',
      connect: true,
      range: {
          min: 0,
          max: 12
      },
      margin: 1,  // set minimum distance between the 2 handles
      pips: {
          // set the pips (markers) every 0.5 steps. This is a hacky way to get labels in between the steps, as you'll see below
          mode: 'values',
          values: pipValues,
          density: 24,

          // custom filter to set pips only visible at the major steps
          filter: ( value, type ) => {
            // a '2' returns the full-size label and marker CSS class
            // a '1' returns the sub-size label and marker css class.  We will override the sub-css to make the marker invisible
            return value % 1 ? 2 : 1;
          },
          format: {
            // format labels usch that full-size pips have no label, but sub-size pips have the FY/Quarter label
            to: ( value ) => {
                if (value % 1 === 0) {
                  return '';
                } else {
                  return fqLabelArray[value - 0.5].slice(0, 2);
                }
            }
          }
      },
      // set css overrides.  must include all CSS class names, even if they aren't being overridden
      cssPrefix: 'noUi-',
      cssClasses: {
          target: 'target',
          base: 'base',
          origin: 'origin',
          handle: 'handle-mod', // modified
          // handleLower: 'handle-lower',
          // handleUpper: 'handle-upper',
          horizontal: 'horizontal', // modified
          vertical: 'vertical',
          background: 'background',
          connect: 'connect',
          connects: 'connects',
          ltr: 'ltr',
          rtl: 'rtl',
          draggable: 'draggable',
          drag: 'state-drag',
          tap: 'state-tap',
          active: 'active',
          tooltip: 'tooltip',
          pips: 'pips',
          pipsHorizontal: 'pips-horizontal',  // modified
          pipsVertical: 'pips-vertical',
          marker: 'marker',
          markerHorizontal: 'marker-horizontal',
          markerVertical: 'marker-vertical',
          markerNormal: 'marker-normal',
          markerLarge: 'marker-large',
          markerSub: 'marker-sub-mod', // modified
          value: 'value',
          valueHorizontal: 'value-horizontal',
          valueVertical: 'value-vertical',
          valueNormal: 'value-normal',
          valueLarge: 'value-large',
          valueSub: 'value-sub-mod' // modified
      }
    };
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
            if (!toBeDeleted.newlyAdded) {
              this.deleteProjectEmployeeRole(toBeDeleted);
            }
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

  onResetClick() {
    // emit confirmation modal
    this.cacheService.confirmModalData.emit(
      {
        title: 'Confirm Reset',
        message: `Are you sure you want to reset the form?  Unsaved changes may be lost.`,
        iconClass: 'fa-exclamation-triangle',
        iconColor: 'rgb(193, 193, 27)',
        closeButton: true,
        allowOutsideClickDismiss: true,
        allowEscKeyDismiss: true,
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
    // wait for response to reset confirm modal
    const resetModalSubscription = this.cacheService.confirmModalResponse.subscribe( res => {
      if (res) {
        this.fteComponentInit();
        this.FTEFormGroup.markAsUntouched();
        this.cacheService.raiseToast('success', 'Your FTE form has been reset');
      } else {
        console.log('reset aborted');
        this.cacheService.raiseToast('warn', 'Reset was aborted');
      }
      resetModalSubscription.unsubscribe();
    });
  }

  onSliderChange(value: any) {  // event only fires when slider handle is dropped
    // round the slider values and set the handles to emulate snapping
    const leftHandle = Math.round(value[0]);
    const rightHandle = Math.round(value[1]);
    this.sliderRange = [leftHandle, rightHandle];
  }

  onSliderUpdate(value: any) {  // event fires while slider handle is mid-drag

    // get rounded handle values, but don't set
    const leftHandle = Math.round(value[0]);
    const rightHandle = Math.round(value[1]);

    // translate handle positions to month-quarters
    const posStart = leftHandle * 3;
    const posDelta = ((rightHandle - leftHandle) * 3);

    this.updateProjectVisibility(posStart, posDelta);

    // set only months that should be visible to true
    this.fteQuarterVisible = this.fteQuarterVisible.fill(false);
    this.fteQuarterVisible = this.fteQuarterVisible.fill(true, leftHandle, rightHandle);
    this.fteMonthVisible = this.fteMonthVisible.fill(false);
    this.fteMonthVisible = this.fteMonthVisible.fill(true, posStart, posStart + posDelta);

    this.checkIfNoProjectsVisible();

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
        this.sliderDisabled = true;
        emptyCounter++;
        emptyProjectName = project.value[0].projectName;
      }
    });

    // if we didn't find any hits at all, then re-enable the slider
    if (!emptyCounter) {
      this.sliderDisabled = false;
    }
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

  exportXLSX() {
    const ws_name = 'Sheet1';
    const wb: WorkBook = { SheetNames: [], Sheets: {} };
    const ws: any = utils.json_to_sheet(this.userFTEs);
    wb.SheetNames.push(ws_name);
    wb.Sheets[ws_name] = ws;
    const wbout = write(wb, { bookType: 'xlsx', bookSST: true, type: 'binary' });

    function s2ab(s) {
      const buf = new ArrayBuffer(s.length);
      const view = new Uint8Array(buf);
      for (let i = 0; i !== s.length; ++i) {
        view[i] = s.charCodeAt(i) & 0xFF;
      }
      return buf;
    }

    saveAs(new Blob([s2ab(wbout)], { type: 'application/octet-stream' }), 'userFTE.xlsx');

  }


  trimProjects(numProjects: number) {
    this.projectList = this.projectList.slice(0, numProjects);
  }


  showSliderDisabledToast() {
    const name = this.checkIfEmptyProjects();
    if (this.sliderDisabled) {
      this.cacheService.raiseToast('warn', `Please enter FTE values for project: ${name}`);
    }
  }

  getJobTitleList() {
    this.apiDataJobTitleService.getJobTitleList()
    .subscribe(
      res => {
        this.jobTitleList = res;
        console.log('jobTitleList', res);
      },
      err => {
        console.log(err);
      }
    );

  }

  deleteProjectEmployeeRole(projectID: any) {
    this.apiDataProjectService.deleteProjectEmployeeRole(projectID, this.authService.loggedInUser.id)
    .subscribe(
      res => {
        console.log('Successful deletion in project employee role table');
      },
      err => {
        console.log(err);
      });
  }

  onInstructionsClick() {
    // emit carousel modal after they click instructions button
    this.cacheService.carouselModalData.emit(
      {
        title: `FTE Entry Instructions`,
        iconClass: 'fa-info',
        iconColor: 'rgb(193, 193, 27)',
        closeButton: true,
        allowOutsideClickDismiss: true,
        allowEscKeyDismiss: true,
        buttons: [
          {
            text: 'Close',
            bsClass: 'btn-success',
            emit: true
          }
        ],
        slides: [
          {
            src: '../assets/carousel_slides/FTE/carousel_FTE_1.png',
            alt: 'First FTE Slide',
            captionHeader: 'Step 1:',
            captionBody: 'Click the "Project" button to open the projects window',
            active: true
          },
          {
            src: '../assets/carousel_slides/FTE/carousel_FTE_2.png',
            alt: 'First FTE Slide',
            captionHeader: 'Step 2:',
            captionBody: 'Search for the project and click the "Select" button to add to your FTE list',
            active: false
          },
          {
            src: '../assets/carousel_slides/FTE/carousel_FTE_3.png',
            alt: 'First FTE Slide',
            captionHeader: 'Step 3:',
            captionBody: 'Fill in the monthly FTE values (total monthly FTE should sum to 1)',
            active: false
          },
          {
            src: '../assets/carousel_slides/FTE/carousel_FTE_4.png',
            alt: 'First FTE Slide',
            captionHeader: 'Step 4:',
            captionBody: 'Use the slider to see previous/future FTE months (future FTE values can be filled as well)',
            active: false
          },
          {
            src: '../assets/carousel_slides/FTE/carousel_FTE_5.png',
            alt: 'First FTE Slide',
            captionHeader: 'Step 5:',
            captionBody: 'Click "Save" when finished',
            active: false
          }
        ]
      }
    );

    const carouselModalSubscription = this.cacheService.carouselModalResponse.subscribe( res => {
      if (res) {
        // if they click ok, grab the deleted project info and exec db call to delete
        console.log('CAROUSEL!');
      } else {
        console.log('delete confirm aborted');
      }
      carouselModalSubscription.unsubscribe();
    });
  }

}
