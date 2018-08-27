import { Injectable } from '@angular/core';
import { FormArray } from '@angular/forms';

import { CacheService } from './cache.service';

declare var $: any;

import * as moment from 'moment';
import * as momentTimezone from 'moment-timezone';
import * as _ from 'lodash';

@Injectable()
export class ToolsService {

  constructor(
    private cacheService: CacheService
  ) { }

  // TO-DO BILL: add comments, remove dead code, fix spelling on sentance

  roundTo(number: number, decimalPlaces: number): number {
    if (decimalPlaces === 0) {
      return Math.round(number);
    } else if (decimalPlaces === 1) {
      return Math.round(number * 10) / 10;
    } else if (decimalPlaces >= 2) {
      return Math.round(number * Math.pow(10, decimalPlaces)) / Math.pow(10, decimalPlaces);
    } else {
      return number;
    }
  }


  singularize(singularString: string): string {

    if (singularString.length <= 2) {
      return singularString;
    } else {
      if (singularString.length >= 4 && singularString.substring(singularString.length - 2).toLowerCase() === 'es') {
        return singularString.slice(0, -2);
      } else if (singularString.substring(singularString.length - 1).toLowerCase() === 's') {
        return singularString.slice(0, -1);
      } else {
        return singularString;
      }
    }
  }


  // convert a word like camelCase to Camel Case
  splitCamelCase(camelCaseString: string): string {

    // deal with cases like ID, IDE, etc. which we don't want to convert
    if (camelCaseString.length <= 3) {
      return camelCaseString;
    } else {
      // add a space in front of the uppercase characters
      const result = camelCaseString.replace(/([A-Z])/g, ' $1');
      // capitalize the first character
      return result.charAt(0).toUpperCase() + result.slice(1);
    }

  }


  // convert a word or sentance like peanut butter or PEANUT BUTTER to Peanut Butter
  toSentanceCase(str: string): string {

    return str.replace(/\w\S*/g, text => {
      return text.charAt(0).toUpperCase() + text.substr(1).toLowerCase();
    });

  }

  clearFormArrays(formArrays: string[], form: any) {
    formArrays.forEach(formArray => {
      const formArr = <FormArray>form.controls[formArray];
      this.clearFormArray(formArr);
    });
  }

  clearFormArray(formArray: any) {
    const len = formArray.length;
    for (let i = 0; i < len; i++) {
      formArray.removeAt(0);
    }
  }

  buildPaginationRanges(objects: any, objProp: string, maxPerPage: number): any {

    const charArr = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    const charCounts: number[] = [];
    const returnArr = [];

    charArr.forEach(char => {
      const filteredObjects = objects.filter(object => {
        return char.toUpperCase() === object[objProp][0].toUpperCase();
      });
      charCounts.push(filteredObjects.length);
    });

    let startChar: string = charArr[0];
    let endChar: string;
    let total = 0;
    charCounts.forEach((count, index) => {
      total += +count;
      if (total > maxPerPage) {
        total = 0;
        endChar = charArr[index - 1];
        const range: string = startChar !== endChar ? `${startChar}-${endChar}` : startChar;
        returnArr.push(range);
        startChar = charArr[index];
      } else if (index === charCounts.length - 1) {
        endChar = charArr[index];
        const range: string = startChar !== endChar ? `${startChar}-${endChar}` : startChar;
        returnArr.push(`${startChar}-${endChar}`);
      }
    });

    return returnArr;

  }

  randomBetween(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  displayTimeoutError() {

    // emit an object to the confirm modal component to display a bootstrap modal
    this.cacheService.confirmModalData.emit(
      {
        title: 'Timeout Error',
        message: `The server is not responding.  Please check your connection to the Keysight network.
           If you don't believe there is a problem with your network connection, please contact support.`,
        iconClass: 'fa-exclamation-triangle',
        iconColor: this.cacheService.alertIconColor,
        closeButton: true,
        allowOutsideClickDismiss: true,
        allowEscKeyDismiss: true,
        buttons: [
          {
            text: 'Ok',
            bsClass: 'btn-secondary',
            emit: undefined
          }
        ]
      }
    );

  }


  displayTokenError() {

    // emit an object to the confirm modal component to display a bootstrap modal
    this.cacheService.confirmModalData.emit(
      {
        title: 'Authentication Error',
        message: `There was an issue verifying your identify.  For security you have been logged out.
        If you believe this error is invalid, please contact support`,
        iconClass: 'fa-exclamation-triangle',
        iconColor: this.cacheService.alertIconColor,
        closeButton: true,
        allowOutsideClickDismiss: true,
        allowEscKeyDismiss: true,
        buttons: [
          {
            text: 'Ok',
            bsClass: 'btn-secondary',
            emit: undefined
          }
        ]
      }
    );

  }


  numberToWord(num: number) {

    const numbersArr = `zero one two three four five six seven eight nine ten
      eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen`.split(' ');
    const tensArr = `twenty thirty forty fifty sixty seventy eighty ninety`.split(' ');

    if (num >= 0 && num < 20) {
      return numbersArr[num];
    } else if (num < 100) {
      const digit = num % 10;
      return tensArr[Math.floor(num / 10) - 2] + (digit ? '-' + num[digit] : '');
    } else {
      throw new RangeError('number must be between 0 and 99');
    }

  }


  rgbToHex(r, g, b) {
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }


  hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }


  shadeHexColor(color, percent) {
    const f = parseInt(color.slice(1), 16), t = percent < 0 ? 0 : 255,
      p = percent < 0 ? percent * - 1 : percent , R = f >> 16, G = f >> 8 & 0x00FF, B = f & 0x0000FF;
    return '#' + (0x1000000 + (Math.round((t - R) * p) + R) * 0x10000 +
      (Math.round((t - G) * p) + G) * 0x100 + (Math.round((t - B) * p) + B)).toString(16).slice(1);
  }


  // return the current fiscal quarter as a string: 'Q2 2018'
  fiscalQuarterString(date: any): string {

    // keysight fiscal quarters:
    // Q1: Nov 1 - Jan 31  [11, 12, 1]
    // Q2: Feb 1 - Apr 30  [2, 3, 4]
    // Q3: May 1 - Jul 31  [5, 6, 7]
    // Q4: Aug 1 - Oct 31  [8, 9, 10]

    // set a two dimensional array of fiscal quarters, months
    const fiscalQuarters = [[11, 12, 1], [2, 3, 4], [5, 6, 7], [8, 9, 10]];

    // get the current month as a number
    // NOTE: months are zero indexed, so need to add 1
    const month = moment(date).month() + 1;

    // find the month in the array to get the quarter
    let quarter;
    fiscalQuarters.forEach((fiscalQuarter, index) => {
      if (fiscalQuarter.includes(month)) {
        quarter = index + 1;
      }
    });

    // get the current year as a number
    const year = moment(date).year();

    // return the fiscal quarter as a string
    return `Q${quarter} ${year}`;

  }


  // return the current fiscal quarter as an array of strings with the date range
  // that can be used for a sql query, etc.: ['05-01-2018', '08-01-2018']
  fiscalQuarterRange(date: any, format: string): string[] {

    // set a two dimensional array of fiscal quarters, months
    const fiscalQuarters = [[11, 12, 1], [2, 3, 4], [5, 6, 7], [8, 9, 10]];

    // get the current month as a number
    const month = moment(date).month() + 1;

    // find the month in the array to get the quarter index, and quarter array
    let quarterIndex;
    let quarterArr;
    fiscalQuarters.forEach((fiscalQuarter, index) => {
      if (fiscalQuarter.includes(month)) {
        quarterIndex = index + 1;
        quarterArr = fiscalQuarter;
      }
    });

    // get the current year as a number
    const year = moment(date).year();

    // get the start and end of the quarter in the proper string format
    // NOTE: subtracting 1 from the month here since months are zero indexed in moment
    const startOfQuarter = moment({year: year, month: quarterArr[0] - 1}).format(format);
    const endOfQuarter = moment({year: year, month: quarterArr[2] - 1}).add(1, 'months').format(format);

    // initialize the empty string array to return
    const range: string[] = [];

    // push the start and end of quarters into the array
    range.push(startOfQuarter);
    range.push(endOfQuarter);

    // return the fiscal quarters as an array of two strings
    return range;

  }


  // return the current fiscal quarter as a string in the format Aug - Oct
  fiscalQuarterMonthsString(date: any): string {

    // set a two dimensional array of fiscal quarters, months
    const fiscalQuarters = [[11, 12, 1], [2, 3, 4], [5, 6, 7], [8, 9, 10]];

    // get the current month as a number
    const month = moment(date).month() + 1;

    // find the month in the array to get the quarter index, and quarter array
    let quarterArr;
    fiscalQuarters.forEach(fiscalQuarter => {
      if (fiscalQuarter.includes(month)) {
        quarterArr = fiscalQuarter;
      }
    });

    // get the current year as a number
    const year = moment(date).year();

    // get the start and end of the quarter in the proper string format
    // NOTE: subtracting 1 from the month here since months are zero indexed in moment
    const firstMonth = moment({year: year, month: quarterArr[0] - 1}).format('MMM D');
    const lastMonth = moment({year: year, month: quarterArr[2] - 1}).add(1, 'months').subtract(1, 'days').format('MMM D');

    // return the string
    return `${firstMonth} - ${lastMonth}`;

  }


  // use to get a standardized time (pst / pdt) to insert or update into a sql server datetime2(3) column
  // approach: use moment timezone to convert into pacific time (los angeles),
  // then subtract the utc/gmt offset hours (7 or 8), because the sequelize DATE datatype will always assume you want to use gmt
  // and will add those hours
  pacificTime(): any {

    // NOTES:
    // The Pacific Timezone is an area 8 hours behind Greenwich Mean Time (GMT-8) during the winter months (referred to as PST)
    // and 7 hours behind Greenwich Mean Time ( GMT-7 ) during the summer months (referred to as PDT).
    // At the moment, the following schedule is used:
    // From 2 A.M. on the second Sunday in March to 2 A.M. on the first Sunday in November, Daylight Saving Time is in effect.

    // console.log('moment string, local time:');
    // const localTimeString = moment().format('dddd, MMMM Do YYYY, h:mm:ss a');
    // console.log(localTimeString);

    // console.log('utc offset, local time:');
    // const localTimeOffset = -(moment().utcOffset() / 60);
    // console.log(localTimeOffset);

    // get a moment in pacific time
    const pacificTime = momentTimezone(moment().format('YYYY-MM-DDTHH:mm:ssZ')).tz('America/Los_Angeles');
    // console.log('pacific time moment:');
    // console.log(pacificTime);

    // console.log('pacific time string');
    // const pacificTimeString = pacificTime.format('MMMM Do YYYY, h:mm:ss a Z z');
    // console.log(pacificTimeString);

    // get the utc / greenwich mean time offset of the pacific time (either 7 or 8 hours depending on daylight saving time)
    const pacificTimeOffset = -(pacificTime.utcOffset() / 60);
    // console.log('utc offset, pacific time:');
    // console.log(pacificTimeOffset);

    // console.log('pacific time final string:');
    // console.log(pacificTime.subtract(pacificTimeOffset, 'hours').format('MMMM Do YYYY, h:mm:ss a Z z'));

    // substract the utc offset, since the sequelize date datatype will automatically add this offset
    // sequelize will handle the conversion:  https://github.com/sequelize/sequelize/issues/854
    // "When you pass a date object to sequelize it is converted to UTC before it is saved, not matter what local time zone it has"
    const pacificTimeFinal = pacificTime.subtract(pacificTimeOffset, 'hours');
    // console.log('pacific time final:');
    // console.log(pacificTimeFinal);

    // return the moment
    return pacificTimeFinal;


  }

  hideFooter() {
    $('div.footer-container').css('display', 'none');
  }

  showFooter() {
    $('div.footer-container').css('display', 'block');
  }

    // class binding using the ngClass directive in the html
  // to set project type icon (icon font class)
  setProjctTypeIconClass(projectTypeName) {
    const classes = {
      'nc-icon': true,
      'nc-ram': projectTypeName === 'NCI',
      'nc-keyboard': projectTypeName === 'NMI',
      'nc-keyboard-wireless': projectTypeName === 'NPI',
      'nc-socket-europe-1': projectTypeName === 'NPPI',
      'nc-lab': projectTypeName === 'NTI',
      'nc-microscope': projectTypeName === 'Research',
      'nc-settings-91': projectTypeName === 'MFG',
      'nc-code-editor': projectTypeName === 'Program',
      'nc-book-open-2': projectTypeName === 'Solution',
      'nc-board-28': projectTypeName === 'Initiative',
      'nc-bulb-63': projectTypeName === 'TOF Engaged',
      'nc-sign-closed': projectTypeName === 'Completed',
      'nc-gantt': projectTypeName === 'General'
    };
    return classes;
  }


  // style binding using the ngStyle directive in the html
  // to set the color for the project type name and icon
  setProjctTypeColor(projectTypeName) {
    switch (projectTypeName) {
      case 'NCI':
        return 'rgb(139, 0, 0)';  // red
      case 'NPI':
        return 'rgb(0, 0, 139)';  // dark blue
      case 'NPPI':
        return 'rgb(16, 140, 160)';  // turquiose
      case 'NTI':
        return 'rgb(215, 123, 10)';  // orange
      case 'Research':
        return 'rgb(0, 100, 0)';  // green
      case 'Initiative':
        return 'rgb(184, 134, 11)';  // dark yellow-gold
      case 'General':
        return 'rgb(0, 101, 209)';  // blue
      default:
        return 'rgb(139, 0, 139)';  // magenta
    }
  }


}
