import { Injectable } from '@angular/core';
import { ToolsService } from './tools.service';
import { CacheService } from './cache.service';

import * as XlsxPopulate from 'xlsx-populate';
import * as FileSaver from 'file-saver';
import * as moment from 'moment';

declare var XlsxPopulate: any;

@Injectable()
export class ExcelExportService {

  constructor(
    private toolsService: ToolsService,
    private cacheService: CacheService
  ) { }

  export(fileName: string, sheetName: string, data: any, colsToExport?: any[]) {

    const t0 = performance.now();

    // create a new blank workbook
    XlsxPopulate.fromBlankAsync()
    .then(workbook => {

      // get the column names and aliases into separate arrays
      let colNames: string[];
      let colAliases: string[];
      if (colsToExport) {
        colNames = colsToExport.map(colToExport => colToExport.name);
        colAliases = colsToExport.map(colToExport => {
          if (colToExport.hasOwnProperty('alias')) {
            return colToExport.alias;
          } else {
            return '';
          }
        });
      }

      // set the sheet object and rename the first sheet (will be there by default so don't need to add)
      const sheet = workbook.sheet(0).name(sheetName);

      // declare variables to set ranges
      let topLeftCell;
      let bottomRightCell;
      let range;

      // get the first object in the data object array, to access the property names (to use as column names)
      const firstObj = data[0];

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
          return this.toolsService.splitCamelCase(colAliases[ci] ? colAliases[ci] : colNames[ci]);
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
        colNames.forEach((col, index) => {
          // use the first row to test data types; assume they are not mixed
          // get the value in the column
          const value = data[0][col];
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
          const value = data[0][index];
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

      // set the table cell values
      topLeftCell = sheet.row(2).cell(1);
      bottomRightCell = sheet.row(1 + data.length).cell(numCols);
      range = topLeftCell.rangeTo(bottomRightCell);

      // set the table cell values
      range.value((cell, ri, ci, range2) => {
        if (colsToExport) {
          // data[ri] will reference the row
          // then using bracket notation with the property name string to get the value
          if (colDataTypes[ci] === 'date') {
            cell.style('numberFormat', 'm/d/yyyy h:mm am/pm');
            const dateString = moment(data[ri][colNames[ci]]).format('MM/D/YYYY H:mm');
            return new Date(dateString);
          } else {
            return data[ri][colNames[ci]];
          }
        } else {
          // Object.values(data[ri]) will return an array of the row values
          // then using ci to get value at the index
          return Object.values(data[ri])[ci];
        }
      });

      // style the table contents
      range.style({
        verticalAlignment: 'top',
        wrapText: true
      });

      // build a two-dimensional array of character lengths
      const numChars = [];
      if (colsToExport) {
        colNames.forEach((col, cIndex) => {
          // init empty array for the column, to hold text lengths
          const colNumChars = [];
          // loop through each row in the array
          data.forEach((row, rIndex) => {
            // get the value / text ('cell')
            // using bracket notation with property name string
            const value = row[colNames[cIndex]];
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
          data.forEach(row => {
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

      // get the max number of characters for the values (for each 'column')
      const maxLengths: number[] = [];
      numChars.forEach(col => {
        maxLengths.push(Math.max(...col));
      });

      // set the column widths
      if (colsToExport) {
        colNames.forEach((col, index) => {
          // get the max length for this column from the maxLengths array
          const colMaxChars = maxLengths[index];
          // set width to min of 10, max of 50, or the length of characters in the column or column header with some buffer
          const colWidth = Math.min(50,
            Math.max(10,
            Math.max(this.toolsService.splitCamelCase(
            colAliases[index] ? colAliases[index] : colNames[index]).length + 2, colMaxChars + 2)));
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

      const t1 = performance.now();
      // console.log(`time to prepare excel file: ${t1 - t0} milliseconds`);

      const t2 = performance.now();

      // export the workbook into the downloads folder using the FileSaver library
      workbook.outputAsync()
      .then(blob => {
        FileSaver.saveAs(blob, `${fileName}.xlsx`);
      });

      const t3 = performance.now();
      // console.log(`time to download excel file: ${t3 - t2} milliseconds`);

      this.cacheService.showDownloadingIcon.emit(false);

    });

  }



}
