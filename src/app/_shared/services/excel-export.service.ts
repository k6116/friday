import { Injectable } from '@angular/core';
import { ToolsService } from './tools.service';

import * as XlsxPopulate from 'xlsx-populate';
import * as FileSaver from 'file-saver';
import * as moment from 'moment';
declare var XlsxPopulate: any;

@Injectable()
export class ExcelExportService {

  constructor(
    private toolsService: ToolsService
  ) { }

  export(fileName: string, sheetName: string, json: any, colsToExport?: string[]) {

    // create a new blank workbook
    XlsxPopulate.fromBlankAsync()
    .then(workbook => {

      console.log('columns to export:');
      console.log(colsToExport);

      console.log('testing bracket notation to get value');
      console.log(json[0][colsToExport[0]]);

      console.log('testing for date format');
      console.log(moment('2017-12-14T10:49:21.030Z', moment.ISO_8601, true).isValid());

      // console.log('moment testing');
      // console.log(moment(json[0]['CreationDate']));

      // console.log('excel date number testing (num days since 1/1/1990');
      // const date = moment('2017-12-14T10:49:21.030Z');
      // const excelEpoch = moment('1/1/1900');
      // const numDays = date.diff(excelEpoch, 'seconds');
      // console.log(numDays / (60 * 60 * 24));

      // set the sheet object and rename the first sheet (will be there by default so don't need to add)
      const sheet = workbook.sheet(0).name(sheetName);

      // declare variables to set ranges
      let topLeftCell;
      let bottomRightCell;
      let range;

      // get the first object in the json object array, to access the property names (to use as column names)
      const firstObj = json[0];

      // get the number of columns (object properties)
      // the Object.keys() method returns an array of a given object's own property names
      let numCols;
      if (colsToExport) {
        numCols = colsToExport.length;
      } else {
        numCols = Object.keys(firstObj).length;
      }

      // set the header row range
      topLeftCell = sheet.row(1).cell(1);
      bottomRightCell = sheet.row(1).cell(numCols);
      range = topLeftCell.rangeTo(bottomRightCell);

      // set the header row values/titles
      range.value((cell, ri, ci, range2) => {
        const rowValues = Object.keys(firstObj);
        if (colsToExport) {
          return this.toolsService.splitCamelCase(colsToExport[ci]);
        } else {
          return this.toolsService.splitCamelCase(rowValues[ci]);
        }
      });

      // style the header row
      range.style({
        bold: true,
        fill: 'ececec',
        horizontalAlignment: 'left'
      });

      // build an array of the column data types (string, number, or date)
      const colDataTypes: string[] = [];
      if (colsToExport) {
        colsToExport.forEach((col, index) => {
          // use the first row to test data types; assume they are not mixed
          // get the value in the column
          const value = json[0][col];
          // check the datatype and push it into the array
          if (typeof(value) === 'number') {
            colDataTypes.push('number');
          } else if (moment(value, moment.ISO_8601, true).isValid()) {
            colDataTypes.push('date');
          } else {
            colDataTypes.push('string');
          }
        });
      } else {
        Object.keys(firstObj).forEach((col, index) => {
          // use the first row to test data types; assume they are not mixed
          // get the value in the column
          const value = json[0][index];
          // check the datatype and push it into the array
          if (typeof(value) === 'number') {
            colDataTypes.push('number');
          } else if (moment(value, moment.ISO_8601, true).isValid()) {
            colDataTypes.push('date');
          } else {
            colDataTypes.push('string');
          }
        });
      }

      console.log('column data types:');
      console.log(colDataTypes);


      // set the table cell values
      topLeftCell = sheet.row(2).cell(1);
      bottomRightCell = sheet.row(1 + json.length).cell(numCols);
      range = topLeftCell.rangeTo(bottomRightCell);

      // set the table cell values
      range.value((cell, ri, ci, range2) => {
        if (colsToExport) {
          // json[ri] will reference the row
          // then using bracket notation with the property name string to get the value
          if (colDataTypes[ci] === 'date') {
            // const cellValue = moment(json[ri][colsToExport[ci]]);
            cell.style('numberFormat', 'm/d/yyyy h:mm am/pm');
            // return cellValue;
            const dateString = moment(json[ri][colsToExport[ci]]).format('MM/D/YYYY H:mm');
            // const dateString = moment(json[ri][colsToExport[ci]]).utc().format('MM/D/YYYY H:mm');
            // const excelEpoch = moment('1/1/1900');
            // const numDays = date.diff(excelEpoch, 'days');
            return new Date(dateString);
            // 2017-12-14
            // return cell.value(new Date(json[ri][colsToExport[ci]])).style('numberFormat', 'dddd, mmmm dd, yyyy');
          } else {
            return json[ri][colsToExport[ci]];
          }
        } else {
          // Object.values(json[ri]) will return an array of the row values
          // then using ci to get value at the index
          return Object.values(json[ri])[ci];
        }
      });

      // style the table contents
      range.style({
        verticalAlignment: 'top',
        wrapText: true
      });

      // turn the autofilter on for the range
      // sheet.autoFilter(range);

      // build a two-dimensional array of character lengths
      const numChars = [];
      if (colsToExport) {
        colsToExport.forEach((col, cIndex) => {
          // init empty array for the column, to hold text lengths
          const colNumChars = [];
          // loop through each row in the array
          json.forEach((row, rIndex) => {
            // get the value / text ('cell')
            // using bracket notation with property name string
            const value = row[colsToExport[cIndex]];
            // push the length of the string into the array, if there is no value push zero
            colNumChars.push(value ? value.toString().length : 0);
          });
          numChars.push(colNumChars);
        });
      } else {
        Object.keys(firstObj).forEach((col, index) => {
          // init empty array for the column, to hold text lengths
          const colNumChars = [];
          // loop through each row in the array
          json.forEach(row => {
            // the Object.values() method returns an array of a given object's own enumerable property values
            // note row is an array of objects for the row
            // get the value / text ('cell')
            const value = Object.values(row)[index];
            // push the length of the string into the array, if there is no value push zero
            colNumChars.push(value ? value.toString().length : 0);
          });
          numChars.push(colNumChars);
        });
      }


      // console.log('number of characters array');
      // console.log(numChars);

      // get the max number of characters for the values (for each 'column')
      const maxLengths: number[] = [];
      numChars.forEach(col => {
        maxLengths.push(Math.max(...col));
      });

      console.log('max lengths array');
      console.log(maxLengths);

      // set the column widths
      if (colsToExport) {
        colsToExport.forEach((col, index) => {
          // get the max length for this column from the maxLengths array
          const colMaxChars = maxLengths[index];
          // set width to min of 10, max of 50, or the length of characters in the column with some buffer
          const colWidth = Math.min(50, Math.max(10, Math.max(this.toolsService.splitCamelCase(col).length + 2, colMaxChars + 2)));
          // set the column width (note .column is 1 based)
          sheet.column(index + 1).width(colWidth);
        });
      } else {
        Object.keys(firstObj).forEach((col, index) => {
          // get the max length for this column from the maxLengths array
          const colMaxChars = maxLengths[index];
          // set width to min of 10, max of 50, or the length of characters in the column with some buffer
          const colWidth = Math.min(50, Math.max(10, Math.max(this.toolsService.splitCamelCase(col).length + 2, colMaxChars + 2)));
          // set the column width (note .column is 1 based)
          sheet.column(index + 1).width(colWidth);
        });
      }


      // export the workbook into the downloads folder using the FileSaver library
      workbook.outputAsync()
      .then(blob => {
        FileSaver.saveAs(blob, `${fileName}.xlsx`);
      });

    });

  }



}
