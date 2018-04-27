import { Injectable } from '@angular/core';
import { FormArray } from '@angular/forms';

@Injectable()
export class ToolsService {

  constructor() { }


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
    charArr.forEach(char => {
      const filteredObjects = objects.filter(object => {
        return char.toUpperCase() === object[objProp][0].toUpperCase();
      });
      charCounts.push(filteredObjects.length);
    });
    console.log('character counts');
    console.log(charCounts);
    console.log(charCounts.reduce((accumulator, currentValue) => accumulator + currentValue));
    return charCounts;

  }

}
