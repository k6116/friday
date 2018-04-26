import { Component, OnInit, AfterViewInit, Input } from '@angular/core';
import { FormGroup, FormArray, FormControl, Validators, FormBuilder } from '@angular/forms';
import { trigger, state, style, transition, animate, keyframes, group } from '@angular/animations';
import { DecimalPipe } from '@angular/common';
import { NouisliderModule } from 'ng2-nouislider';

import { User } from '../../_shared/models/user.model';
import { AuthService } from '../../auth/auth.service';
import { ApiDataService } from '../../_shared/services/api-data.service';
import { ToolsService } from '../../_shared/services/tools.service';
import { UserFTEs, AllocationsArray} from './fte-model';
import { utils, write, WorkBook } from 'xlsx';
import { saveAs } from 'file-saver';

const moment = require('moment');
require('moment-fquarter');

declare const require: any;
declare const $: any;

@Component({
  selector: 'app-fte-entry',
  templateUrl: './fte-entry.component.html',
  styleUrls: ['./fte-entry.component.css', '../../_shared/styles/common.css'],
  providers: [DecimalPipe]
  // animations: [
  //   trigger('conditionState', [
  //     state('in', style({
  //       opacity: 1,
  //       transform: 'translateY(0)'
  //     })),
  //     transition('in => void', [
  //       animate(100, style({
  //         opacity: 0,
  //         transform: 'translateY(25px)'
  //       }))
  //     ]),
  //     transition('void => in', [
  //       animate(100, style({
  //         opacity: 1
  //       }))
  //     ])
  //   ])
  // ]
})
export class FteEntryEmployeeComponent implements OnInit, AfterViewInit {

  // initialize variables
  mainSliderConfig: any;  // slider config
  fteMonthVisible = new Array(36).fill(false);  // boolean array for by-month FTE form display
  fteProjectVisible = new Array;  // boolean array for by-project row display
  FTEFormGroup: FormGroup;
  sliderRange: number[] = []; // contains the live slider values
  userFTEs: any;  // array to store user FTE data
  userFTEsFlat: any;  // array to store user FTE data (flattened/non-treeized version)
  display: boolean; // TODO: find a better solution to FTE display timing issue
  displayFTETable = false;
  loggedInUser: User; // object for logged in user's info
  projects: any;  // for aliasing formarray
  months: string[] = [];
  state: string; // for angular animation
  monthlyTotals: number[];
  monthlyTotalsValid: boolean[];
  showProjectsModal: boolean;
  projectList: any;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private apiDataService: ApiDataService,
    private toolsService: ToolsService,
    private decimalPipe: DecimalPipe
  ) {
    // initialize the FTE formgroup
    this.FTEFormGroup = this.fb.group({
      FTEFormArray: this.fb.array([])
    });

    this.state = 'in';

    this.monthlyTotals = new Array(36).fill(null);
    this.monthlyTotalsValid = new Array(36).fill(true);

  }

  ngOnInit() {

    this.setSliderConfig(); // initalize slider config

    // get logged in user's info
    this.authService.getLoggedInUser((user, err) => {
      if (err) {
        console.log(`error getting logged in user: ${err}`);
        return;
      }
      console.log('logged in user data received in main component:');
      console.log(user);
      this.loggedInUser = user;
      this.fteComponentInit();  // initialize the FTE entry component
    });

    this.apiDataService.getProjects()
    .subscribe(
      res => {
        console.log('get project data successfull:');
        console.log(res);
        this.projectList = res;
        this.setRandomProjectAvatars();
      },
      err => {
        console.log('get project data error:');
        console.log(err);
      }
    );

   this.buildMonthsArray();


  }

  ngAfterViewInit() {
  }

  onAddProjectClick() {

    this.showProjectsModal = true;
  }

  onModalClosed(selectedProject: any) {
    console.log('on modal closed fired');
    setTimeout(() => {
      this.showProjectsModal = false;
    }, 500);

    const newProject = new UserFTEs;
    newProject.userID = this.loggedInUser.id;
    newProject.projectID = selectedProject.ProjectID;
    newProject.projectName = selectedProject.ProjectName;

    // loop through the already-built months array and initialize null FTEs for each month in this new project
    newProject.allocations = new Array<AllocationsArray>();
    this.months.forEach( month => {
      const newMonth = new AllocationsArray;
      newMonth.month = moment(month).utc().format();
      newMonth.fte = null;
      newMonth.recordID = null;
      newProject.allocations.push(newMonth);
    });

    this.userFTEs.push(newProject); // push to the userFTEs object and rebuild the form
    this.buildFteEntryForm(true);
  }

  onModalCancelClick() {
    console.log('on modal cancel fired');
    setTimeout(() => {
      this.showProjectsModal = false;
    }, 500);
  }

  onTableScroll(event) {
    const scrollTop = $('div.table-scrollable').scrollTop();
    const scrollLeft = $('div.table-scrollable').scrollLeft();
    // console.log(`scroll left: ${scrollLeft}, scroll top: ${scrollTop}`);

    $('div.table-header-underlay').css('top', `${scrollTop}px`);
    $('table.table-ftes thead tr th').css('top', `${scrollTop - 10}px`);
    $('table.table-ftes tbody tr td.col-project-name').css('left', `${scrollLeft - 15}px`);
    $('table.table-ftes tbody tr td.col-total-name').css('left', `${scrollLeft - 15}px`);
    $('table.table-ftes thead tr th.header-project').css('left', `${scrollLeft - 15}px`);
    $('div.table-header-underlay').css('left', `${scrollLeft}px`);

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
    // console.log(`match is ${match}, replacement value: ${fteReplaceValue}`);

    const FTEFormArray = <FormArray>this.FTEFormGroup.controls.FTEFormArray;
    const FTEFormProjectArray = <FormArray>FTEFormArray.at(i);
    const FTEFormGroup = FTEFormProjectArray.at(j);
    FTEFormGroup.patchValue({
      updated: true
    });

    if (fteReplace) {
      FTEFormGroup.patchValue({
        fte: fteReplaceValue
      });
    }

    // update the monthly total
    this.updateMonthlyTotal(j);

    // set the border color for the monthly totals inputs
    this.setMonthlyTotalsBorder();

  }


  updateMonthlyTotal(index) {

    // initialize a temporary variable, set to zero
    let total = 0;

    // set the outer form array of projeccts and months
    const fteTable = this.FTEFormGroup.value.FTEFormArray;

    // loop through each project
    fteTable.forEach((project, i) => {
      // loop through each month
      project.forEach((month, j) => {
        // if the month matches the month that was updated, update the total
        if (j === index) {
          total += +month.fte;
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

    // set the outer form array of projeccts and months
    const fteTable = this.FTEFormGroup.value.FTEFormArray;

    // loop through each project
    fteTable.forEach((project, i) => {
      // loop through each month
      project.forEach((month, j) => {
        totals[j] += +month.fte;
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
  }


  onTestSaveClick() {

    const fteData = this.FTEFormGroup.value.FTEFormArray;
    const t0 = performance.now();
    // call the api data service to send the put request
    this.apiDataService.updateFteData(fteData, this.loggedInUser.id)
    .subscribe(
      res => {
        console.log(res);
        const t1 = performance.now();
        console.log(`save fte values took ${t1 - t0} milliseconds`);
      },
      err => {
        console.log(err);
      }
    );
  }


  fteComponentInit() {
    // get FTE data
    this.apiDataService.getFteData(this.loggedInUser.id)
    .subscribe(
      res => {
        this.userFTEs = res.nested;
        this.userFTEsFlat = res.flat;
        this.buildFteEntryForm(false); // initialize the FTE Entry form, which is dependent on FTE data being retrieved
        this.display = true;  // ghetto way to force rendering after FTE data is fetched
        this.projects = this.userFTEs;
      },
      err => {
        console.log(err);
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

  buildFteEntryForm = (isNewProject: boolean): void => {
    // grab the Project formarray
    const FTEFormArray = <FormArray>this.FTEFormGroup.controls.FTEFormArray;

    // remove any existing form groups in the array
    this.toolsService.clearFormArray(FTEFormArray);

    // if a new project was added that triggered this function call, push a temporary true to display it
    if (isNewProject) {
      this.fteProjectVisible.push(true);
    } else {
      this.fteProjectVisible.length = 0;  // clear out project visibility
    }

    // loop through each project to get into the FTE entry elements
    this.userFTEs.forEach( (proj: UserFTEs) => {

      // add a 'true' for each project in the dataset
      if (!isNewProject) { this.fteProjectVisible.push(true); }

      const projFormArray = this.fb.array([]); // instantiating a temp formarray for each project

      // proj.allocations.forEach( (mo: AllocationsArray) => {
      this.months.forEach(month => {
        // for each FTE entry in a given project, push the FTE controller into the temp formarray
        // so we will have 1 controller per month, one array of controllers per project

        // attempt to find a record/object for this project and month
        const foundEntry = this.userFTEsFlat.find(userFTE => {
          return proj.projectID === userFTE.projectID && moment(month).unix() === moment(userFTE['allocations:month']).unix();
        });
        // console.log(`found object for project ${proj.projectName} and month ${month}:`);
        // console.log(foundEntry);

        projFormArray.push(
          this.fb.group({
            recordID: [foundEntry ? foundEntry['allocations:recordID'] : null],
            projectID: [proj.projectID],
            // month: [moment(month).format('YYYY-MM-DDTHH.mm.ss.SSS') + 'Z'],
            month: [month],
            fte: [foundEntry ? this.decimalPipe.transform(foundEntry['allocations:fte'], '1.1') : null],
            newRecord: [foundEntry ? false : true],
            updated: [false]
          })
        );
      });
      // push the temp formarray as 1 object in the Project formarray
      FTEFormArray.push(projFormArray);
    });
    // this.projects = FTEFormArray.controls;  // alias the FormArray controls for easy reading

    // update the totals row
    this.updateMonthlyTotals();

    // set red border around total inputs that don't sum up to 1
    this.setMonthlyTotalsBorder();

    this.checkIfNoProjectsVisible();

  }


  setSliderConfig() {

    // set slider starting range based on current date
    let startDate = moment().startOf('month');
    let month = moment(startDate).month();
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
    this.fteMonthVisible = this.fteMonthVisible.fill(true, this.sliderRange[0] * 3, this.sliderRange[1] * 3);

    // generate slider labels based on current date
    startDate = moment().startOf('year').subtract(2, 'months'); // first day of this FY
    startDate = moment(startDate).subtract(1, 'year');  // first day of last FY
    month = moment(startDate).month();
    let firstQuarter = moment(startDate).fquarter(-3).quarter;
    let firstYear = moment(startDate).fquarter(-3).year;
    const fyLabelArray = new Array<string>(12).fill('');

    // make an array of label strings, ie - [Q4'17, Q1'18]
    fyLabelArray.forEach(function(element, i) {
      fyLabelArray[i] = `Q${firstQuarter}'${firstYear.toString().slice(2)}`;
      firstQuarter++;
      if (firstQuarter > 4) {
        firstYear++;
        firstQuarter = 1;
      }
    });

    // make array of values for slider pips
    const pipValues = [];
    for (let i = 0; i <= 12; i = i + 0.5) {
      pipValues.push(i);
    }

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
          filter: function filterHalfSteps( value, type ) {
            // a '2' returns the full-size label and marker CSS class
            // a '1' returns the sub-size label and marker css class.  We will override the sub-css to make the marker invisible
            return value % 1 ? 2 : 1;
          },
          format: {
            // format labels usch that full-size pips have no label, but sub-size pips have the FY/Quarter label
            to: function ( value ) {
                if (value % 1 === 0) {
                return '';
                } else {
                return fyLabelArray[value - 0.5];
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
          horizontal: 'horizontal',
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
          pipsHorizontal: 'pips-horizontal',
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

  onSliderChange(value: any) {
    // round the slider values and set the handles to emulate snapping
    const leftHandle = Math.round(value[0]);
    const rightHandle = Math.round(value[1]);
    this.sliderRange = [leftHandle, rightHandle];

    this.clearEmptyProjects();  // only do when slider is dropped, (not mid-drag) for performance
  }

  onSliderUpdate(value: any) {

    // get rounded handle values, but don't set
    const leftHandle = Math.round(value[0]);
    const rightHandle = Math.round(value[1]);

    // translate handle positions to month-quarters
    const posStart = leftHandle * 3;
    const posDelta = ((rightHandle - leftHandle) * 3);

    this.updateProjectVisibility(posStart, posDelta);

    // set only months that should be visible to true
    this.fteMonthVisible = this.fteMonthVisible.fill(false);
    this.fteMonthVisible = this.fteMonthVisible.fill(true, posStart, posStart + posDelta);

    this.checkIfNoProjectsVisible();

    // TEMP CODE: workaround for rendering issue for column headers (months)
    // let scrollTop = $('div.table-scrollable').scrollTop();
    // $('div.table-scrollable').scrollTop(scrollTop - 1);
    // scrollTop = $('div.table-scrollable').scrollTop();
    // $('div.table-scrollable').scrollTop(scrollTop + 1);

  }

  updateProjectVisibility(posStart: number, posDelta: number) {
    // reset project visibility
    this.fteProjectVisible.length = 0;

    // set new project visibility
    const FTEFormArray = <FormArray>this.FTEFormGroup.controls.FTEFormArray;  // get the formarray and loop through each project
    let nullCounter = posStart;

    FTEFormArray.controls.forEach( project => {
      for (let i = posStart; i < (posStart + posDelta); i++) {  // only look at the cells that are visible based on the slider
        const currProjControls = project['controls'][i].controls;
        if (currProjControls.fte.value) {
          // if any of the controls have an FTE value, break out of the loop and make the whole project visible
          i = posStart + posDelta;
          nullCounter = posStart; // reset nullCounter
          this.fteProjectVisible.push(true);
        } else { nullCounter++; }
        if (nullCounter === (posStart + posDelta)) {
          // all nulls, so project shouldn't be displayed
          this.fteProjectVisible.push(false);
          nullCounter = posStart; // reset nullCounter
        }
      }
    });
  }

  clearEmptyProjects() {
    // look for any projects where all FTE values are null, and remove from the data object
    this.userFTEs.forEach( project => {
      const max = project.allocations.length;
      let i = 0;
      project.allocations.forEach( month => {
        if (!month.fte) { i++; }
      });
      if (i === max) {
        const index = this.userFTEs.indexOf(project);
        this.userFTEs.splice(index, 1);
      }
    });
    this.buildFteEntryForm(false);
  }

  checkIfNoProjectsVisible() {
    // if all projects in the slider-defined view are false, then hide the FTE form div and display a different one
    if (this.fteProjectVisible.every(testIfFalse)) {
      this.displayFTETable = false;
    } else { this.displayFTETable = true; }

    function testIfFalse(value) {
      return value === false;
    }
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


  // TEMP CODE: to emulate/spoof project avatars
  setRandomProjectAvatars() {
    const avatarFiles = ['eggs', 'bacon', 'cheese', 'avocado'];
    this.projectList.forEach(project => {
      const randomFileIndex: number = Math.floor((Math.random() * (avatarFiles.length)));
      const randomFile = avatarFiles[randomFileIndex];
      const randomProject: number = Math.floor((Math.random() * (3)));
      if (randomProject === 0) {
        project.avatar = `../assets/${randomFile}.png`;
      } else {
        project.avatar = null;
      }
    });
    console.log('projects with avatars');
    const filteredProjects = this.projectList.filter(project => {
      return project.avatar;
    });
    console.log(filteredProjects);
    console.log('number of project with avatars:');
    console.log(filteredProjects.length);
  }



}
