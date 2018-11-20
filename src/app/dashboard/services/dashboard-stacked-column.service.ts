import { Injectable } from '@angular/core';

import { ToolsService } from '../../_shared/services/_index';

import * as Highcharts from 'highcharts';
import * as _ from 'lodash';
import * as moment from 'moment';



@Injectable()
export class DashboardStackedColumnService {

  constructor(
    private toolsService: ToolsService
  ) { }


  // take in the fte data and return the chart options for the stacked column chart
  // for the team ftes
  buildChartOptions(dashboardFTEData: any, title: string, selectedManager?: any): any {

    // if the selected manager is passed in, filter that object out from the fte data
    // TO-DO BILL: check with the team to see if this is desired behavior
    if (selectedManager) {
      dashboardFTEData = dashboardFTEData.filter(fteData => {
        return fteData.emailAddress !== selectedManager.emailAddress;
      });
    }

    // iterate through the data and build an array of object with name, projectName, and fte
    let employeeProjectFTEs = [];
    dashboardFTEData.forEach(employee => {
      if (employee.hasOwnProperty('projects')) {
        employee.projects.forEach(project => {
          if (project.hasOwnProperty('ftes')) {
            project.ftes.forEach(fte => {
              const found = employeeProjectFTEs.find(element => {
                return element.name === employee.name && element.projectName === project.projectName;
              });
              if (found) {
                found.fte += fte.fte;
              } else {
                employeeProjectFTEs.push({
                  name: employee.name,
                  projectName: project.projectName,
                  fte: fte.fte
                });
              }
            });
          }
        });
      } else {
        employeeProjectFTEs.push({
          name: employee.name,
          projectName: null,
          fte: null
        });
      }
    });
    // round fte's to 2 decimal places
    employeeProjectFTEs.forEach(employeeProjectFTE => {
      if (employeeProjectFTE.fte) {
        employeeProjectFTE.fte = this.toolsService.roundTo(employeeProjectFTE.fte, 2);
      }
    });

    // console.log('employeeProjectFTEs:');
    // console.log(employeeProjectFTEs);

    // get a unique list of employee names for the xAxis categories, into a string array
    // ['Bill Schuetzle', 'Brian Ivanoff', 'Bryan Cheung', ...]
    let xAxisCategories: string[] = [];
    employeeProjectFTEs.forEach(employeeProjectFTE => {
      xAxisCategories.push(employeeProjectFTE.name);
    });
    xAxisCategories = _.uniq(xAxisCategories);

    // console.log('unique employee names:');
    // console.log(xAxisCategories);

    // calculate fte percentages
    // build an array of objects with totals for each person
    const totals: any[] = [];
    xAxisCategories.forEach(employee => {
      let total = 0;
      employeeProjectFTEs.forEach(employeeProjectFTE => {
        if (employeeProjectFTE.name === employee) {
          total += employeeProjectFTE.fte;
        }
      });
      employeeProjectFTEs.forEach(employeeProjectFTE => {
        if (employeeProjectFTE.name === employee) {
          employeeProjectFTE.total = employeeProjectFTE.fte ? 3 : null;
          employeeProjectFTE.percentage = employeeProjectFTE.fte ? (employeeProjectFTE.fte / 3) * 100 : null;
        }
      });
    });

    // sort the values by name and fte %
    employeeProjectFTEs = _.reverse(_.sortBy(employeeProjectFTEs, ['percentage']));
    employeeProjectFTEs = _.sortBy(employeeProjectFTEs, ['name']);

    // console.log('employeeProjectFTEs with percentages:');
    // console.log(employeeProjectFTEs);

    // get a unique list of project names, into an array of objects, omitting nulls
    // [{
    //  projectName: 'Application Support',
    //  data: []
    // },
    let uniqueProjectNames: any[] = [];
    employeeProjectFTEs.forEach(employeeProjectFTE => {
      // omit nulls
      if (employeeProjectFTE.projectName) {
        uniqueProjectNames.push({
          name: employeeProjectFTE.projectName,
          data: []
        });
      }
    });
    uniqueProjectNames = _.uniqBy(uniqueProjectNames, 'name');  // remove duplicates

    // console.log('unique project names:');
    // console.log(uniqueProjectNames);

    // go through employee names in string array; then each project in object array
    // try to find a match in the array of objects on name and projectName
    // if found push in the ftes value, if not found push in null (into the data array)
    xAxisCategories.forEach(employee => {
      uniqueProjectNames.forEach(project => {
        const found = employeeProjectFTEs.find(employeeProjectFTE => {
          return employeeProjectFTE.name === employee && employeeProjectFTE.projectName === project.name;
        });
        if (found) {
          project.data.push(found.percentage);
        } else {
          project.data.push(null);
        }
      });
    });

    // console.log('unique project names:');
    // console.log(uniqueProjectNames);

    // slice off the 'View data table' and 'Open in Highcharts Cloud' menu options
    const highchartsButtons = Highcharts.getOptions().exporting.buttons.contextButton.menuItems.slice(0, 9);

    // get the fiscal quarter and months range for the subtitle
    const fiscalQuarter = this.toolsService.fiscalQuarterString(moment());
    const monthsRange = this.toolsService.fiscalQuarterMonthsString(moment());

    // set the chart options
    const chartOptions = {
      chart: {
        type: 'column',
        height: 450,
        marginTop: 100,
        spacingTop: 10
      },
      title: {
        text: title
      },
      subtitle: {
        text: `For current fiscal quarter ${fiscalQuarter} (${monthsRange}).`
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
      xAxis: {
        categories: xAxisCategories
      },
      yAxis: {
        min: 0,
        max: 100,
        title: {
          text: 'FTE %'
        },
        labels: {
          format: '{value:.0f} %'
        },
        stackLabels: {
          enabled: true,
          format: '{total:.0f} %',
          style: {
            fontWeight: 'bold',
            color: 'gray'
          }
        }
      },
      legend: {
        enabled: false
      },
      tooltip: {
        // headerFormat: '<b>{point.x}</b><br/>',
        // pointFormat: '{series.name}: {point.y:.0f}%<br/>Total: {point.stackTotal:.0f}%',
        useHTML: true,
        padding: 0,
        formatter: function() {
          console.log(this);
          return `
          <div class="tev" style="padding: 7px; z-index: 10">
            <span style="font-size: 10px">` + this.key + `</span><br/>
            <span style="color:` + this.point.color + `">\u25CF</span> ` + this.series.name + `: <b>` + this.point.y + `</b><br/>
          </div>`;
        }
      },
      plotOptions: {
        column: {
          stacking: 'normal',
          dataLabels: {
            enabled: true,
            color: 'white',
            format: '{point.y:.0f}'
            }
        }
      },
      series: uniqueProjectNames
    };

    // console.log('chart options');
    // console.log(chartOptions);

    // return the chart options object
    return chartOptions;


  }



}
