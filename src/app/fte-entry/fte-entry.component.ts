import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormArray, FormControl, Validators, FormBuilder } from '@angular/forms';
import { NouisliderModule } from 'ng2-nouislider';

import { User } from '../_shared/models/user.model';
import { ApiDataService } from '../_shared/services/api-data.service';
import { UserFTEs, AllocationsArray} from './fte-model';

declare const require: any;

@Component({
  selector: 'app-fte-entry',
  templateUrl: './fte-entry.component.html',
  styleUrls: ['./fte-entry.component.css']
})
export class FteEntryComponent implements OnInit {

  @Input('userObject') userObject: User;

  // initialize variables
  mainSliderConfig: any;  // initialize slider config
  fteMonthVisible = new Array(24).fill(false);  // initialize boolean array for by-month FTE form display
  FTEFormGroup: FormGroup;
  sliderRange: number[] = [6, 8];
  userFTEs: any;  // initialize variable to store user FTE data
  display: boolean; // TODO: find a better solution to FTE display timing issue


  constructor(
    private fb: FormBuilder,
    private apiDataService: ApiDataService
  ) {
    this.FTEFormGroup = this.fb.group({
      FTEFormArray: this.fb.array([])
    });
  }

  ngOnInit() {
    // get FTE data
    this.apiDataService.getFteData(58)
    .subscribe(
      res => {
        this.userFTEs = res;
        this.buildFteEntryForm(); // initialize the FTE Entry form, which is dependent on FTE data being retrieved
        this.setSliderConfig(); // setup the slider, which is dependent on FTE data being retrieved to properly set the slider labels
        this.display = true;  // ghetto way to force rendering after FTE data is fetched
      },
      err => {
        console.log(err);
      }
    );
    // initialize the by-month FTE display with most recent 2 quarters visible
    this.fteMonthVisible = this.fteMonthVisible.fill(true, 18, 24);
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
  }

  setSliderConfig() {
    // import moment and fiscal quarter plugin
    const moment = require('moment');
    require('moment-fquarter');

    // using the first date in the data array, build an array of quarter + FY labels for the slider bar
    const firstDate = this.userFTEs[0].allocations[0].month;
    let firstQuarter = moment(firstDate).fquarter(-3).quarter;
    let firstYear = moment(firstDate).fquarter(-3).year;
    const fyLabelArray = new Array<string>(8).fill('');

    fyLabelArray.forEach(function(element, i) { // make an array of label strings, ie - 'Q4-2017', 'Q1-2018'
      fyLabelArray[i] = 'Q' + firstQuarter + '-' + firstYear;
      firstQuarter++;
      if (firstQuarter > 4) {
        firstYear++;
        firstQuarter = 1;
      }
    });

    this.mainSliderConfig = {
      behaviour: 'tap-drag',
      connect: true,
      range: {
          min: 0,
          max: 8
      },
      margin: 1,  // set minimum distance between the 2 handles
      start: [ 6, 8 ],
      pips: {
          // set the pips (markers) every 0.5 steps. This is a hacky way to get labels in between the steps, as you'll see below
          mode: 'values',
          values: [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8],
          density: 16,

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
            // not using From, which is a slider template to translate pip label formatting back to a useable value
            // from: function ( value ) {
            //   return value.replace(',-', '');
            // }
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

    // translate handle positions to month-quarters
    const posStart = leftHandle * 3;
    const posDelta = ((rightHandle - leftHandle) * 3);

    // set only months that should be visible to true
    this.fteMonthVisible = this.fteMonthVisible.fill(false);
    this.fteMonthVisible = this.fteMonthVisible.fill(true, posStart, posStart + posDelta);
  }
}
