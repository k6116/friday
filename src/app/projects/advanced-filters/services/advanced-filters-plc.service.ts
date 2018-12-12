import { Injectable } from '@angular/core';

export interface NewPLC {
  index: number;
  PLCStatusID: string;
  PLCStatusName: string;
  PLCDateFrom: string;
  PLCDateTo: string;
}
@Injectable()
export class AdvancedFiltersPLCService {

  // PLC information for filterObjects
  newPLC: NewPLC = {
    index: null,
    PLCStatusID: '',
    PLCStatusName: '',
    PLCDateFrom: '',
    PLCDateTo: ''
  };

  constructor() { }

  onPLCStatusCheck(objPLC: any, plcStatus: any, index: number) {

    // use interface to sort out all the attributes
    this.newPLC = {
      index: index,                           // to macth up date-input box with status-checkbox onInputPLCChange
      PLCStatusID: plcStatus.PLCStatusID,     // probably don't need this
      PLCStatusName: plcStatus.PLCStatusName, // for filterObject
      PLCDateFrom: 'NULL',                    // for filterObject
      PLCDateTo: 'NULL'                       // for filterObject
    };

    // Add checked PLC Status to local PLC object
    objPLC.push(this.newPLC);

    return objPLC;
  }

  onPLCStatusUncheck(objPLC: any, index: number) {

      // find the right object to delete by comparing their index
      for (let i = 0; i < objPLC.length; i++) {
        if (objPLC[i].index === index) {

          // remove from array
          objPLC.splice(i, 1);

          return objPLC;
        }
      }
  }

  // Changing the from-date
  onInputPLCChangeFrom(objPLC: any, date: any, index: number) {

    // Find the plc status checkbox that belongs to this input and save the date
    for (let i = 0; i < objPLC.length; i++) {
      if (objPLC[i].index === index) {

        objPLC[i].PLCDateFrom = date;

        return objPLC;
      }
    }
  }

  // Changing the to-date
  onInputPLCChangeTo(objPLC: any, date: any, index: number) {

    // Find the plc status checkbox that belongs to this input and save the date
    for (let i = 0; i < objPLC.length; i++) {
      if (objPLC[i].index === index) {

        objPLC[i].PLCDateTo = date;

        return objPLC;
      }
    }
  }

  // On go-button click
  getPLCFilterObject(objPLC: any, filterObject: any) {
    const arrID = [];
    const arrDate = [];

    // note: string needs to be in this format:
    //       filterObject.PLCStatusIDs = 1,2
    //       filterObject.PLCDateRanges = '2017/01/01|2017/01/01, 2017/01/01|2017/01/01'

    // organize the data into array buckets then convert them each into strings and save to filterObject
    for (let i = 0; i < objPLC.length; i++) {
      arrID.push(objPLC[i].PLCStatusID);
      arrDate.push(objPLC[i].PLCDateFrom + '|' + objPLC[i].PLCDateTo);
    }

    // save strings into the db object
    filterObject.PLCStatusIDs = String(arrID);
    filterObject.PLCDateRanges = String(arrDate);

    return filterObject;

  }

}
