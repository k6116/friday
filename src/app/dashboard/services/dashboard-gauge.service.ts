import { Injectable } from '@angular/core';

import { ToolsService } from '../../_shared/services/tools.service';
import { AuthService } from '../../_shared/services/auth.service';

import * as Highcharts from 'highcharts';
import * as _ from 'lodash';
import * as moment from 'moment';

@Injectable()
export class DashboardGaugeService {

  constructor(
    private toolsService: ToolsService,
    private authService: AuthService
  ) { }


  buildChart(dashboardFTEData: any): any {

    // initialize arrays to hold employees that have completed and not completed fte entries
    const completedFTEsArr: string[] = [];
    const notCompletedFTEsArr: string[] = [];

    // build arrays of people that have completed or not completed their fte entries
    dashboardFTEData.forEach(employee => {
      let fteTotal = 0;
      if (employee.hasOwnProperty('projects')) {
        employee.projects.forEach(project => {
          project.ftes.forEach(fteEntry => {
            fteTotal += fteEntry.fte;
          });
        });
        // console.log(`total fte for employee ${employee.name} is: ${fteTotal}`);
        if (this.toolsService.roundTo(fteTotal, 2) === 3.00) {
          completedFTEsArr.push(employee.name);
        } else {
          notCompletedFTEsArr.push(employee.name);
        }
      } else {
        notCompletedFTEsArr.push(employee.name);
      }
    });

    // build strings to display in the view
    const completedFTEs = completedFTEsArr.join(', ');
    const notCompletedFTEs = notCompletedFTEsArr.join(', ');

    // slice off the 'View data table' and 'Open in Highcharts Cloud' menu options
    const highchartsButtons = Highcharts.getOptions().exporting.buttons.contextButton.menuItems.slice(0, 9);

    // get the fiscal quarter and months range for the subtitle
    const fiscalQuarter = this.toolsService.fiscalQuarterString(moment());
    const monthsRange = this.toolsService.fiscalQuarterMonthsString(moment());

    // build the chart options
    const chartOptions = {
      chart: {
        type: 'solidgauge',
        height: 450
      },
      title: {
        text: `Your Team's FTE Entry Progress`
      },
      subtitle: {
        text: `For current fiscal quarter ${fiscalQuarter} (${monthsRange}).`
      },
      pane: {
        center: ['50%', 150],
        size: '80%',
        startAngle: -90,
        endAngle: 90,
        background: {
          backgroundColor: '#EEE',
          innerRadius: '60%',
          outerRadius: '100%',
          shape: 'arc'
        }
      },
      tooltip: {
        enabled: false
      },
      credits: {
        enabled: false
      },
      exporting: {
        buttons: {
          contextButton: {
            menuItems: highchartsButtons
          }
        }
      },
      // the value axis
      yAxis: {
        min: 0,
        max: dashboardFTEData.length,
        stops: [
          [.2, '#DF5353'], // red
          [.5, '#DDDF0D'], // yellow
          [.8, '#55BF3B'] // green
        ],
        lineWidth: 0,
        minorTicks: false
        // minorTickInterval: 'auto'
        // tickAmount: 2,
        // tickInterval: 25
        // labels: {
        //   y: 16
        // }
      },
      plotOptions: {
        solidgauge: {
          dataLabels: {
            y: -50,
            borderWidth: 0,
            useHTML: true
          }
        }
      },
      series: [{
        name: 'fteEntryProgress',
        data: [completedFTEsArr.length],
        dataLabels: {
          format: '<div style="text-align:center"><span style="font-size:25px;color:' +
            ('black') + '">{y}</span><br/>' +
               '<span style="font-size:12px;color:silver">Completed</span></div>'
        }
      }]
    };


    // return an object with the chart options and strings
    return {
      chartOptions: chartOptions,
      completedFTEs: completedFTEs,
      notCompletedFTEs: notCompletedFTEs
    };

  }

}
