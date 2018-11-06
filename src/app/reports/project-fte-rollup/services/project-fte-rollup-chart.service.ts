import { Injectable } from '@angular/core';
import { ProjectFteRollupTableService } from './project-fte-rollup-table.service';

declare var require: any;
declare var $: any;
import * as Highcharts from 'highcharts';
require('highcharts/modules/drilldown.js')(Highcharts);
require('highcharts/modules/heatmap.js')(Highcharts);
require('highcharts/modules/treemap.js')(Highcharts);
require('highcharts/modules/data.js')(Highcharts);
require('highcharts/modules/no-data-to-display.js')(Highcharts);
require('highcharts/highcharts-more.js')(Highcharts);

@Injectable()
export class ProjectFteRollupChartService {

  constructor(
    private projectFteRollupTableService: ProjectFteRollupTableService
  ) { }

  // set a function to be executed whenever a drillup is executed
  // NOTE: this must be done with this approach using an extension...
  // since the treemap doesn't have a drillup event like some other chart types do (it does have load, click, etc. but not drillup)
  setDrillUpFunction(that) {

    // get a reference to 'this' class
    const that2 = this;

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
      that2.projectFteRollupTableService.removeChildItemsFromTable(that);

      // remove the last chart title from the array
      that2.removeTitlesFromHistory(that);

      // highlight the displayed items (next level up)
      that2.projectFteRollupTableService.highlightDisplayedItems(undefined, that, level);

      // proceed, continue to drillup as it would by default with no code
      proceed.apply(this);
    }

    // wrap the prototype function: https://www.highcharts.com/docs/extending-highcharts/extending-highcharts
    (function(H: any) {
      H.wrap(H.seriesTypes.treemap.prototype, 'drillUp', drillup);
    })(Highcharts);


  }


  getChartOptions(chartData: any, that): any {

    // get a reference to 'this' class
    const that2 = this;

    // slice off the 'View data table' and 'Open in Highcharts Cloud' menu options
    const highchartsButtons = Highcharts.getOptions().exporting.buttons.contextButton.menuItems.slice(0, 9);

    // set the chart options
    const chartOptions = {
      chart: {
        // height: 600,
        events: {
          load: function (e) {
            if (that.hasChartData) {
              that.displayTable = true;
              setTimeout(() => {
                that.calculateBarMultipler();
              }, 0);
            }
          }
        }
      },
      title: {
        text: that.chartTitle
      },
      subtitle: {
        text: that.chartSubTitle
      },
      plotOptions: {
        series: {
          animation: true
        }
      },
      credits: {
        text: 'jarvis.is.keysight.com',
        href: 'https://jarvis.is.keysight.com'
      },
      exporting: {
        buttons: {
          contextButton: {
            menuItems: highchartsButtons
          }
        }
      },
      series: [{
        type: 'treemap',
        layoutAlgorithm: 'squarified',  // sliceAndDice, stripes, squarified or strip
        layoutStartingDirection: 'vertical',
        allowDrillToNode: true,
        interactByLeaf: false,
        animationLimit: 1000,
        stickyTracking: true,
        enableMouseTracking: true,
        dataLabels: {
          enabled: false
        },
        levelIsConstant: false,
        levels: [{
          level: 1,
          dataLabels: {
            enabled: true,
            style: {
              color: 'contrast',
              fontSize: '12px',
              fontWeight: 'bold',
              textOutline: false
            }
          },
          borderWidth: 3
        }],
        events: {
          click: function(e) {

            const tableData = $.extend(true, [], that.tableData);

            if (that2.checkClickedItemIsInChart(e.point.id, tableData)) {

              // const drillDownColors = ['#7cb5ec', '#90ed7d', '#91e8e1', '#f45b5b', '#2b908f',
              //   '#7cb5ec', '#e4d354', '#434348', '#8085e9', '#f15c80'];
              let colorIndex = 1;
              for (let i = 0; i < this.data.length; i++) {
                if (this.data[i].level === 2) {
                  const pointColor = Highcharts.getOptions().colors[colorIndex];
                  this.data[i].update({
                    // color: drillDownColors[colorIndex]
                    color: pointColor
                  });
                  if (colorIndex === 9) {
                    colorIndex = 0;
                  } else {
                    colorIndex++;
                  }
                  that.chartData.color = pointColor;
                }
              }

              let drilledDown = false;

              if (e.point.node.children.length) {
                drilledDown = true;
              }

              if (drilledDown) {

                this.chart.setTitle({text: `Project FTE Rollup for ${e.point.name} ${e.point.type}`});

                that2.projectFteRollupTableService.pushChildItemsIntoTable(e.point.id, that);

                that2.pushChildIDsIntoHistory(e.point.id, that);

                that2.pushTitlesIntoHistory(this.chart.title.textStr, that);

                that2.projectFteRollupTableService.highlightDisplayedItems(e.point.id, that);

              }
            } else {
              throw {error: 'dont drill down'};
            }

          }
        },
        data: chartData
      }]
    };

    // return the chart options object
    return chartOptions;

  }


  pushChildIDsIntoHistory(parentID, that) {

    // filter to get child items
    const childItems = that.chartData.filter(data => {
      return data.parent === parentID;
    });

    const idArray: number[] = [];
    childItems.forEach(item => {
      idArray.push(item.id);
    });

    that.drillDownIDs.push(idArray);

  }


  pushTitlesIntoHistory(title, that) {

    that.drillDownTitles.push(title);

  }


  removeTitlesFromHistory(that) {

    // remove the last title from the array
    that.drillDownTitles.pop();

  }


  checkClickedItemIsInChart(id: number, tableData: any): boolean {
    let returnVal: boolean;
    tableData.forEach(data => {
      if (data.id.toString() === id.toString() && data.highlight) {
        returnVal = true;
      }
    });
    return returnVal ? returnVal : false;
  }


  clearChartData(that) {

    that.chartData = undefined;
    that.tableData.splice(0, that.tableData.length);

    that.drillLevel = 0;
    that.drillHistory.splice(0, that.drillHistory.length);
    that.drillDownIDs.splice(0, that.drillDownIDs.length);
    that.drillDownTitles.splice(0, that.drillDownTitles.length);

    that.barMultiplier = undefined;

    that.hasChartData = false;
    that.displayTable = false;

  }


  // when the 'x' button is clicked or input is cleared (typeahead selection returns no object)
  clearChart(that) {

    this.clearChartData(that);

    that.chartTitle = 'Project FTE Rollup';
    that.chartSubTitle = '';

    that.setChartOptions();

    that.renderChart();

  }


}
