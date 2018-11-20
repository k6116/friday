import { Injectable } from '@angular/core';
import { ToolsService } from '../../_shared/services/tools.service';

import * as Highcharts from 'highcharts';
import * as moment from 'moment';


@Injectable()
export class DashboardDonutService {

  constructor(
    private toolsService: ToolsService
  ) { }

  buildChartOptions(dashboardFTEData: any, title: string, selectedManager?: any): any {

    // if the selected manager is passed in, filter that object out from the fte data
    // TO-DO BILL: check with the team to see if this is desired behavior
    if (selectedManager) {
      dashboardFTEData = dashboardFTEData.filter(fteData => {
        return fteData.emailAddress !== selectedManager.emailAddress;
      });
    }

    // get highcharts colors
    const colors = Highcharts.getOptions().colors;

    // initialize the first color index
    let colorIndex = 0;

    // initialize variables
    const categories: string[] = [];
    const data: any[] = [];
    const projectTypesData = [];
    const projectsData = [];

    // sum up total fte across all employees and all projects to use as basis/denominator for fte percentages
    let allFTEs = 0;
    dashboardFTEData.forEach(employee => {
      // if the employee has any projects data
      if (employee.hasOwnProperty('projects')) {
        // iterate through each project
        employee.projects.forEach(project => {
          // if the project has any fte data
          if (project.hasOwnProperty('ftes')) {
            // iterate through each fte
            project.ftes.forEach(fte => {
              allFTEs += fte.fte;
            });
          }
        });
      }
    });

    // build an array of objects with projectType, y, drilldown, and data to put in data

    // iterate through each employee in the 'dashboard data' array of objects
    dashboardFTEData.forEach(employee => {
      // if the employee has any projects data
      if (employee.hasOwnProperty('projects')) {
        // iterate through each project
        employee.projects.forEach(project => {
          // look in the data array to see if the projectType already exists (this is the unique key for this array)
          const foundProjectType = data.find(projectType => {
            return projectType.projectType === project.projectTypeName;
          });
          // if there are ftes, sum them up
          let totalFTEs = 0;
          if (project.hasOwnProperty('ftes')) {
            project.ftes.forEach(fte => {
              totalFTEs += fte.fte;
            });
          }
          // if the object was not found, this is the first time the project type was found, so push the projectType into the array
          if (!foundProjectType) {
            data.push({
              projectType: project.projectTypeName,
              color: colors[colorIndex++],
              y: totalFTEs,
              drilldown: {
                name: project.projectTypeName,
                categories: [project.projectName],
                data: [totalFTEs]
              }
            });
          } else {
            // add to the totalFTEs (y) for the inner circle (project type)
            foundProjectType.y += totalFTEs;
            // look for the projectName in the array of categories in the found projectType object
            const index = foundProjectType.drilldown.categories.indexOf(project.projectName);
            // if the project already exists in the drilldown for this project type, just increment the fte total
            if (index !== -1) {
              foundProjectType.drilldown.data[index] += totalFTEs;
            // otherwise, push both the project name and the fte value into the arrays (add to the end)
            } else {
              foundProjectType.drilldown.categories.push(project.projectName);
              foundProjectType.drilldown.data.push(totalFTEs);
            }
          }
        });
      }
    });

    // go through the data and move the project types in the categories array
    // at the same time, remove/delete the projectType property (not needed for the chart)
    data.forEach(projectType => {
      categories.push(projectType.projectType);
      delete projectType.projectType;
    });

    // build the data arrays
    for (let i = 0; i < data.length; i += 1) {

      // add project types data (inner data)
      projectTypesData.push({
        name: categories[i],
        y: (data[i].y / allFTEs) * 100,
        color: data[i].color
      });

      // add projects data (outer / drilldown data)
      const drillDataLen = data[i].drilldown.data.length;
      for (let j = 0; j < drillDataLen; j += 1) {
        const brightness = 0.5 - (j / drillDataLen) / 5;
        projectsData.push({
          name: data[i].drilldown.categories[j],
          y: (data[i].drilldown.data[j] / allFTEs) * 100,
          color: this.toolsService.shadeHexColor(data[i].color, brightness)
        });
      }

    }

    // slice off the 'View data table' and 'Open in Highcharts Cloud' menu options
    const highchartsButtons = Highcharts.getOptions().exporting.buttons.contextButton.menuItems.slice(0, 9);

    // get the fiscal quarter and months range for the subtitle
    const fiscalQuarter = this.toolsService.fiscalQuarterString(moment());
    const monthsRange = this.toolsService.fiscalQuarterMonthsString(moment());


    // set the chart options
    const chartOptions = {
      chart: {
        type: 'pie',
        height: 450
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
      yAxis: {
        title: {
          text: '...'
        }
      },
      plotOptions: {
        pie: {
          shadow: false,
          center: ['50%', '50%']
        }
      },
      tooltip: {
        pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
      },
      series: [{
        name: 'Project Type',
        data: projectTypesData,
        size: '60%',
        dataLabels: {
          formatter: function () {
            return this.y > 5 ? this.point.name : null;
          },
          color: '#ffffff',
          distance: -30
        }
      }, {
        name: 'Project',
        data: projectsData,
        size: '80%',
        innerSize: '60%',
        // dataLabels: {
        //   formatter: function () {
        //     // display only if larger than 1
        //     return this.y > 1 ? '<b>' + this.point.name + ':</b> ' +
        //       this.y + '%' : null;
        //   }
        // },
        id: 'projects'
      }],
      responsive: {
        rules: [{
          condition: {
            maxWidth: 400
          },
          chartOptions: {
            series: [{
              id: 'projects',
              dataLabels: {
                enabled: false
              }
            }]
          }
        }]
      }

    };


    // return the chart options object
    return chartOptions;


  }


}
