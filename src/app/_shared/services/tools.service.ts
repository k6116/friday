import { Injectable } from '@angular/core';
import { FormArray } from '@angular/forms';

import { AppDataService } from './app-data.service';

import * as moment from 'moment';
import * as _ from 'lodash';

@Injectable()
export class ToolsService {

  constructor(
    private appDataService: AppDataService
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
    this.appDataService.confirmModalData.emit(
      {
        title: 'Timeout Error',
        message: `The server is not responding.  Please check your connection to the Keysight network.
           If you don't believe there is a problem with your network connection, please contact support.`,
        iconClass: 'fa-exclamation-triangle',
        iconColor: 'rgb(193, 27, 27)',
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
  const month = moment(date).month();

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

  // keysight fiscal quarters:
  // Q1: Nov 1 - Jan 31  [11, 12, 1]
  // Q2: Feb 1 - Apr 30  [2, 3, 4]
  // Q3: May 1 - Jul 31  [5, 6, 7]
  // Q4: Aug 1 - Oct 31  [8, 9, 10]

  // set a two dimensional array of fiscal quarters, months
  const fiscalQuarters = [[11, 12, 1], [2, 3, 4], [5, 6, 7], [8, 9, 10]];

  // get the current month as a number
  const month = moment(date).month();

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


}
