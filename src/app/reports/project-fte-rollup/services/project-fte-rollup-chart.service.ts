import { Injectable } from '@angular/core';

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


  getChartOptions(chartData: any, that): any {


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
      // tooltip: {
      //   formatter: function () {
      //     return 'The value for <b>sadfas</b>';
      //   }
      // },
      series: [{
        type: 'treemap',
        layoutAlgorithm: 'squarified',  // sliceAndDice, stripes, squarified or strip
        layoutStartingDirection: 'vertical',
        allowDrillToNode: true,
        interactByLeaf: false,
        animationLimit: 1000,
        stickyTracking: true,
        enableMouseTracking: true,
        // tooltip: {
        //   followPointer: true
        // },
        dataLabels: {
          enabled: false
        },
        // tooltip: {
        //   pointFormatter: function () {
        //     return `<b>{point.name}</b>: {point.value}<br/> YES!`;
        //   }
        // },
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
            // if (1 === 1) {
            //   throw {error: 'dont drill down'};
            // }

            const tableData = $.extend(true, [], that.tableData);
            console.log('table data:');
            console.log(tableData);

            console.log(`clicked on ${e.point.name}; id ${e.point.id}`);
            console.log(e.point);

            if (that.checkClickedItemIsInChart(e.point.id, tableData)) {
              console.log('clicked item IS in the chart');

            // console.log(e);
            // console.log(e.point.level);
            // console.log('this');
            // console.log(this);
            // console.log('rootNode:');
            // const rootNode = this.chart.series[0].rootNode;
            // console.log(rootNode);
            // const drillDownColors = ['#7cb5ec', '#90ed7d', '#91e8e1', '#f45b5b', '#2b908f',
            //   '#7cb5ec', '#e4d354', '#434348', '#8085e9', '#f15c80'];
            let colorIndex = 0;
            for (let i = 0; i < this.data.length; i++) {
              if (this.data[i].level === 2) {
                const pointColor = Highcharts.getOptions().colors[colorIndex];
                this.data[i].update({
                  // color: drillDownColors[colorIndex]
                  color: pointColor
                });
                // console.log(`color for ${e.point.name} is ${pointColor}`);
                colorIndex++;
                that.chartData.color = pointColor;
              }
            }

            let drilledDown = false;

            // console.log('test of that');
            // console.log(that.chartData);
            if (e.point.node.children.length) {
              drilledDown = true;
              // that.drillHistory.push({
              //   level: e.point.level,
              //   id: e.point.id,
              //   name: e.point.name
              // });
            }

            if (drilledDown) {

              console.log('e.point:');
              console.log(e.point);

              this.chart.setTitle({text: `Project FTE Rollup for ${e.point.name} ${e.point.type}`});

              console.log(`chart title: ${this.chart.title.textStr}`);

              that.pushChildItemsIntoTable(e.point.id);

              that.pushChildIDsIntoHistory(e.point.id);

              that.pushTitlesIntoHistory(this.chart.title.textStr);

              that.highlightDisplayedItems(e.point.id);

            }

            // console.log('drill history:');
            // console.log(that.drillHistory);

            // console.log('updated data');
            // console.log(this.data);
          } else {
            console.log('clicked item is NOT in the chart');
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


  clearChartData(that) {

    that.chartData = undefined;
    that.tableData.splice(0, that.tableData.length);

    that.drillHistory.splice(0, that.drillHistory.length);
    that.drillDownIDs.splice(0, that.drillDownIDs.length);
    that.drillDownTitles.splice(0, that.drillDownTitles.length);

    that.barMultiplier = undefined;

    that.hasChartData = false;
    that.displayTable = false;

  }


}
