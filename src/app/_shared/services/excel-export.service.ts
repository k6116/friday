import { Injectable } from '@angular/core';

import * as FileSaver from 'file-saver';
declare var XlsxPopulate: any;

@Injectable()
export class ExcelExportService {

  constructor() { }

  export(fileName: string, sheetName: string, json: any) {

    // create a new blank workbook
    XlsxPopulate.fromBlankAsync()
    .then(workbook => {

      // set the sheet object and rename the first sheet (will be there by default so don't need to add)
      const sheet = workbook.sheet(0).name(sheetName);

      // declare variables to set ranges
      let topLeftCell;
      let bottomRightCell;
      let range;

      // get the first object in the json object array
      const firstObj = json[0];

      // get the number of columns (object properties)
      const numCols = Object.keys(firstObj).length;

      // set the header row range
      topLeftCell = sheet.row(1).cell(1);
      bottomRightCell = sheet.row(1).cell(numCols);
      range = topLeftCell.rangeTo(bottomRightCell);

      // set the header row values/titles
      range.value((cell, ri, ci, range2) => {
        const rowValues = Object.keys(firstObj);
        return rowValues[ci];
      });

      // style the header row
      range.style({
        bold: true,
        fill: 'ececec',
        horizontalAlignment: 'center'
      });


      // set the table cell values
      topLeftCell = sheet.row(2).cell(1);
      bottomRightCell = sheet.row(1 + json.length).cell(numCols);
      range = topLeftCell.rangeTo(bottomRightCell);

      // set the table cell values
      range.value((cell, ri, ci, range2) => {
        return Object.values(json[ri])[ci];
      });

      // build a two-dimensional array of character lengths
      const numChars = [];
      Object.keys(firstObj).forEach((col, index) => {
        const colNumChars = [];
        json.forEach(row => {
          const value = Object.values(row)[index];
          colNumChars.push(value ? value.toString().length : 0);
        });
        numChars.push(colNumChars);
      });

      console.log('number of characters array');
      console.log(numChars);

      const maxLengths: number[] = [];
      numChars.forEach(col => {
        maxLengths.push(Math.max(...col));
      });

      console.log('max lengths array');
      console.log(maxLengths);

      // export the workbook into the downloads folder using the FileSaver library
      workbook.outputAsync()
      .then(blob => {
        FileSaver.saveAs(blob, `${sheetName}.xlsx`);
      });

    });

  }



}
