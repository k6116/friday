import { Injectable } from '@angular/core';
import { FormArray } from '@angular/forms';

import { AppDataService } from './app-data.service';

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
        message: `The server is not responding.  If you don't believe there is a problem with your network connection,
           please contact support.`,
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


  numberToword(num: number) {

    const numbersArr = `zero one two three four five six seven eight nine ten
      eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen`.split(' ');
    const tensArr = `twenty thirty forty fifty sixty seventy eighty ninety`.split(' ');

    if (num < 20) {
      return numbersArr[num];
    } else if (num < 100) {
      const digit = num % 10;
      return tensArr[Math.floor(num / 10) - 2] + (digit ? '-' + num[digit] : '');
    } else {
      return undefined;
    }

  }


}
