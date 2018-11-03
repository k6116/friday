import { Injectable } from '@angular/core';

declare var require: any;
import * as Highcharts from 'highcharts';
require('highcharts/modules/drilldown.js')(Highcharts);
require('highcharts/modules/heatmap.js')(Highcharts);
require('highcharts/modules/treemap.js')(Highcharts);
require('highcharts/modules/data.js')(Highcharts);
require('highcharts/modules/no-data-to-display.js')(Highcharts);
require('highcharts/highcharts-more.js')(Highcharts);

@Injectable()
export class ProjectFteRollupChartService {

  constructor() { }

  // set a function to be executed whenever a drillup is executed
  // NOTE: this must be done with this approach using an extension...
  // since the treemap doesn't have a drillup event like some other chart types do (it does have load, click, etc. but not drillup)
  setDrillUpFunction(that) {

    function drillup(proceed) {

      // for level one, update all the data points color to blue
      const rootNode = this.chart.series[0].rootNode;
      const level = rootNode ? rootNode.split('_').length : 0;
      if (level === 1) {
        for (let i = 0; i < this.data.length; i++) {
          if (this.data[i].level === 2) {
            this.data[i].update({
              color: '#7cb5ec'
            });
          }
        }
      }

      // update the title
      if (that.drillDownTitles.length >= 2) {
        this.chart.setTitle({text: that.drillDownTitles[that.drillDownTitles.length - 2]});
      } else if (that.drillDownTitles.length) {
        this.chart.setTitle({text: that.drillDownTitles[0]});
      }

      // remove the drilled down children from the table
      that.removeChildItemsFromTable();

      // remove the last chart title from the array
      that.removeTitlesFromHistory();

      // highlight the displayed items (next level up)
      that.highlightDisplayedItems(undefined, level);

      // proceed, continue to drillup as it would by default with no code
      proceed.apply(this);
    }

    // wrap the prototype function: https://www.highcharts.com/docs/extending-highcharts/extending-highcharts
    (function(H: any) {
      H.wrap(H.seriesTypes.treemap.prototype, 'drillUp', drillup);
    })(Highcharts);



  }

}
