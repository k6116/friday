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
    let colorIndex = 0;

    // iterate through the chart array
    chartData.forEach(data => {

      // for the first level object / level 1 (selected project), set to the color index zero (highcharts blue)
      if (data.level === 1) {
        data.bulletColor = Highcharts.getOptions().colors[0];
      // for level 2 projects, set the colors ...
      } else if (data.level === 2) {
        data.bulletColor = Highcharts.getOptions().colors[colorIndex];
        colorIndex++;
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

    // return chartData;

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

}
