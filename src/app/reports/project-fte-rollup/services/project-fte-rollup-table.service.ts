import { Injectable } from '@angular/core';
import { ToolsService } from '../../../_shared/services/tools.service';

import * as Highcharts from 'highcharts';


@Injectable()
export class ProjectFteRollupTableService {

  constructor(
    private toolsService: ToolsService
  ) { }


  // calculate and return the multiplier to apply to the chart cum. ftes colored bar, to fill the width
  calculateBarMultipler($el: any, maxFTE: number): number {

    // get the width of the bar column
    const colWidth = $el.outerWidth();

    // divide the width in pixels by the max number of cumulative ftes
    const multiplier1 = colWidth / maxFTE;

    // subtract 30% to allow for some padding
    const multiplier2 = this.toolsService.roundTo((multiplier1 - (multiplier1 * 0.33)), 0);

    // return the bar multiplier
    return multiplier2;

  }

  // set the colors that will be used in the table for the bullet and bars, which should match the colors in the chart
  setTableColors(chartData: any) {

    // initialize the color index
    let colorIndex = 1;

    // iterate through the chart array
    chartData.forEach(data => {

      // for the first level object / level 1 (selected project), set to the color index zero (highcharts blue)
      if (data.level === 1) {
        data.bulletColor = Highcharts.getOptions().colors[0];
      // for level 2 projects, set the colors ...
      } else if (data.level === 2) {
        data.bulletColor = Highcharts.getOptions().colors[colorIndex];
        if (colorIndex === 9) {
          colorIndex = 0;
        } else {
          colorIndex++;
        }
      // for level 3+, set the color equal to it's parent color
      } else {
        const foundParent = chartData.find(parent => {
          return parent.id === data.parent;
        });
        if (foundParent) {
          data.bulletColor = foundParent.bulletColor;
        }
      }
    });

  }


  getInitialTableData(chartData: any): any {

    // initialize an empty array
    const tableData = [];

    // filter the chart data down to the first level project (selected project)
    const levelOneItem = chartData.filter(data => {
      return data.level === 1;
    });

    if (levelOneItem.length) {
      tableData.splice(0, 0, ...levelOneItem);
      tableData[0].highlight = true;
    }

    return tableData;

  }


  pushChildItemsIntoTable(parentID, that) {

    // find the position/index of the parentID in the table
    // so that the child items can be spliced in, in the proper location
    let tableRow = 0;
    that.tableData.forEach((data, index) => {
      // console.log(`data.id: ${data.id.toString()}; parentID: ${parentID.toString()}`);
      if (data.id.toString() === parentID.toString()) {
        tableRow = index + 1;
        // console.log(`found match at row: ${tableRow}`);
      }
    });

    const childItems = that.chartData.filter(data => {
      return data.parent === parentID;
    });

    // add the child items to the table, below the parent item
    if (childItems.length) {
      that.tableData.splice(tableRow, 0, ...childItems);
    }

  }


  removeChildItemsFromTable(that) {

    // get the last array of drill down ids
    const tableIds = that.drillDownIDs[that.drillDownIDs.length - 1];

    // loop through the table data in reverse order
    if (tableIds) {
      for (let i = that.tableData.length - 1; i >= 0; i--) {
        if (tableIds.includes(that.tableData[i].id)) {
          that.tableData.splice(i, 1);
        }
      }
    }

    // remove the last table ids array
    if (that.drillDownIDs.length) {
      that.drillDownIDs.pop();
    }

  }


  highlightDisplayedItems(parentID, that, level?) {

    // remove all existing highlighted rows
    this.removeAllRowHighlights(that);

    if (that.chartData) {
      const childItems = that.chartData.filter(data => {
        if (level) {
          return data.level === level;
        } else {
          return data.parent === parentID;
        }
      });

      childItems.forEach(item => {
        item.highlight = true;
      });

    }

  }


  removeAllRowHighlights(that) {

    that.tableData.forEach(row => {
      row.highlight = false;
    });


  }

}
