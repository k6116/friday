import { Injectable } from '@angular/core';
import { ToolsService } from '../_shared/services/tools.service';

import * as Highcharts from 'highcharts';


@Injectable()
export class DashboardDonutService {

  constructor(
    private toolsService: ToolsService
  ) { }

  buildChartOptions(dashboardFTEData: any): any {


    // get highcharts colors
    const colors = Highcharts.getOptions().colors;

    // initialize the first color index
    let colorIndex = 0;

    // initialize variables
    const categories: string[] = [];
    const data: any[] = [];
    const browserData = [];
    const versionsData = [];

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
          console.log('found project type object:');
          console.log(foundProjectType);
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
            console.log('foundProjectType.drilldown.categories');
            console.log(foundProjectType.drilldown.categories);
            console.log('project.projectName');
            console.log(project.projectName);
            console.log('index');
            console.log(index);
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

    console.log('data');
    console.log(data);

    // go through the data and move the project types in the categories array
    // at the same time, remove/delete the projectType property (not needed for the chart)
    data.forEach(projectType => {
      categories.push(projectType.projectType);
      delete projectType.projectType;
    });

    console.log('categories');
    console.log(categories);


    // build the data arrays
    for (let i = 0; i < data.length; i += 1) {

      // console.log(data[i].color);
      // console.log(this.toolsService.hexToRgb(data[i].color));
      // const color = this.toolsService.hexToRgb(data[i].color);
      // const newColor = `rgba(${color.r}, ${color.g}, ${color.b}, 0.5)`;
      console.log(this.toolsService.shadeHexColor(data[i].color, 0.5));

      // add browser data
      browserData.push({
        name: categories[i],
        y: data[i].y,
        color: data[i].color
      });

      // add version data
      const drillDataLen = data[i].drilldown.data.length;
      for (let j = 0; j < drillDataLen; j += 1) {
        const brightness = 0.5 - (j / drillDataLen) / 5;
        console.log(`brightness:`);
        console.log(brightness);
        versionsData.push({
          name: data[i].drilldown.categories[j],
          y: data[i].drilldown.data[j],
          color: this.toolsService.shadeHexColor(data[i].color, brightness)
        });
      }

    }


    // set the chart options
    const chartOptions = {
      chart: {
        type: 'pie',
        height: 450
      },
      title: {
          text: `Your Team's FTE's by Project Type`
      },
      yAxis: {
        title: {
          text: 'Total percent market share'
        }
      },
      plotOptions: {
        pie: {
          shadow: false,
          center: ['50%', '50%']
        }
      },
      tooltip: {
        valueSuffix: '%'
      },
      series: [{
        name: 'Project Type',
        data: browserData,
        size: '60%',
        dataLabels: {
          // formatter: function () {
          //   return this.y > 5 ? this.point.name : null;
          // },
          color: '#ffffff',
          distance: -30
        }
      }, {
        name: 'Project',
        data: versionsData,
        size: '80%',
        innerSize: '60%',
        // dataLabels: {
        //   formatter: function () {
        //     // display only if larger than 1
        //     return this.y > 1 ? '<b>' + this.point.name + ':</b> ' +
        //       this.y + '%' : null;
        //   }
        // },
        id: 'versions'
      }],
      responsive: {
        rules: [{
          condition: {
            maxWidth: 400
          },
          chartOptions: {
            series: [{
              id: 'versions',
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
