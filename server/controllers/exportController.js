
const moment = require('moment');
const XlsxPopulate = require('xlsx-populate');


function generateExcelFile(req, res) {
  
  // get data and options from the request payload
  const data = req.body.data;
  const sheetName = req.body.sheetName;
  const colsToExport = req.body.colsToExport;

  // create a new blank workbook
  XlsxPopulate.fromBlankAsync()
  .then(workbook => {

    // get the column names and aliases into separate arrays
    let colNames;
    let colAliases;
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
        return splitCamelCase(colAliases[ci] ? colAliases[ci] : colNames[ci]);
      } else {
        return splitCamelCase(rowValues[ci]);
      }
    });

    // style the header row
    range.style({
      bold: true,
      fill: 'ececec',
      horizontalAlignment: 'left'
    });

    // build an array of the column data types (string, number, or date)
    const colDataTypes = [];
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
    const maxLengths = [];
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
          Math.max(splitCamelCase(
          colAliases[index] ? colAliases[index] : colNames[index]).length + 2, colMaxChars + 2)));
        // set the column width (note .column is 1 based)
        sheet.column(index + 1).width(colWidth);
      });
    } else {
      Object.keys(firstObj).forEach((col, index) => {
        // get the max length for this column from the maxLengths array
        const colMaxChars = maxLengths[index];
        // set width to min of 10, max of 50, or the length of characters in the column with some buffer
        const colWidth = Math.min(50, Math.max(10, Math.max(splitCamelCase(col).length + 2, colMaxChars + 2)));
        // set the column width (note .column is 1 based)
        sheet.column(index + 1).width(colWidth);
      });
    }

    // export the workbook into the downloads folder using the FileSaver library
    workbook.outputAsync()
    .then(blob => {
      res.writeHead(200, {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      res.end(new Buffer(blob, 'binary'));
    });

  })

}


// convert a word like camelCase to Camel Case
function splitCamelCase(camelCaseString) {

  // deal with cases like ID, IDE, etc. which we don't want to convert
  if (camelCaseString.length <= 3) {
    return camelCaseString;
  } else {
    return camelCaseString.replace(/([A-Z]+)/g, ' $1').replace(/([A-Z][a-z])/g, ' $1').trim();
  }

}


module.exports = {
  generateExcelFile: generateExcelFile
}