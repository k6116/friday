import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormArray, FormControl, Validators, FormBuilder } from '@angular/forms';
import { NouisliderModule } from 'ng2-nouislider';

import { User } from '../_shared/models/user.model';
import { AuthService } from '../auth/auth.service';
import { ApiDataService } from '../_shared/services/api-data.service';
import { UserFTEs, AllocationsArray} from './fte-model';

declare const require: any;

@Component({
  selector: 'app-fte-entry',
  templateUrl: './fte-entry.component.html',
  styleUrls: ['./fte-entry.component.css']
})
export class FteEntryComponent implements OnInit {

  // initialize variables
  mainSliderConfig: any;  // slider config
  fteMonthVisible = new Array(36).fill(false);  // boolean array for by-month FTE form display
  FTEFormGroup: FormGroup;
  sliderRange: number[] = [];
  userFTEs: any;  // array to store user FTE data
  display: boolean; // TODO: find a better solution to FTE display timing issue
  loggedInUser: User; // object for logged in user's info
  projects: any;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private apiDataService: ApiDataService
  ) {
    // initialize the FTE formgroup
    this.FTEFormGroup = this.fb.group({
      FTEFormArray: this.fb.array([])
    });
  }

  ngOnInit() {

    this.setSliderConfig(); // initalize slider config
    // initialize the by-month FTE display with most recent 2 quarters visible
    this.fteMonthVisible = this.fteMonthVisible.fill(true, 18, 24);

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
  }

  fteComponentInit() {
    // get FTE data
    this.apiDataService.getFteData(this.loggedInUser.id)
    .subscribe(
      res => {
        this.userFTEs = res;
        this.buildFteEntryForm(); // initialize the FTE Entry form, which is dependent on FTE data being retrieved
        this.display = true;  // ghetto way to force rendering after FTE data is fetched
      },
      err => {
        console.log(err);
      }
    );
  }

  buildFteEntryForm = (): void => {
    // grab the Project formarray
    const FTEFormArray = <FormArray>this.FTEFormGroup.controls.FTEFormArray;

    // loop through each project to get into the FTE entry elements
    this.userFTEs.forEach( (proj: UserFTEs) => {
      const projFormArray = this.fb.array([]); // instantiating a temp formarray for each project

      proj.allocations.forEach( (mo: AllocationsArray) => {
        // for each FTE entry in a given project, push the FTE controller into the temp formarray
        // so we will have 1 controller per month, one array of controllers per project
        projFormArray.push(
          this.fb.group({
            fte: ['']
          })
        );
      });
      // push the temp formarray as 1 object in the Project formarray
      FTEFormArray.push(projFormArray);
    });
    this.projects = FTEFormArray.controls;  // alias the FormArray controls for easy reading
  }

  setSliderConfig() {
    // import moment and fiscal quarter plugin
    const moment = require('moment');
    require('moment-fquarter');

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
  }

  onSliderUpdate(value: any) {
    // get rounded handle values, but don't set
    const leftHandle = Math.round(value[0]);
    const rightHandle = Math.round(value[1]);

    // translate handle positions to month-quarters
    const posStart = leftHandle * 3;
    const posDelta = ((rightHandle - leftHandle) * 3);

    // set only months that should be visible to true
    this.fteMonthVisible = this.fteMonthVisible.fill(false);
    this.fteMonthVisible = this.fteMonthVisible.fill(true, posStart, posStart + posDelta);
  }
}
