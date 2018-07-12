import { Injectable } from '@angular/core';

import { ToolsService } from '../_shared/services/tools.service';
import { AuthService } from '../_shared/services/auth.service';

import * as highcharts from 'highcharts';
import * as _ from 'lodash';


@Injectable()
export class DashboardPieService {

  constructor(
    private toolsService: ToolsService,
    private authService: AuthService
  ) { }

  buildChartOptions(dashboardFTEData: any): any {


    // initialize arrays to hold chart data
    let seriesData = [];
    const drilldownSeries = [];

    // filter fte data to get only the logged in user's fte values
    const fteData = dashboardFTEData.filter(data => {
      return data.emailAddress === this.authService.loggedInUser.email;
    });

    // sum up the total ftes all the user's projects (will always be for the current quarter)
    // if all the ftes have been entered, it should total to 3
    let fteTotal = 0;
    if (fteData[0].hasOwnProperty('projects')) {
      fteData[0].projects.forEach(project => {
        if (project.hasOwnProperty('ftes')) {
          project.ftes.forEach(month => {
            fteTotal += month.fte;
          });
        }
      });
    }

    // for each project, total up the ftes, calculate the percentages and push into the series data array
    if (fteData[0].hasOwnProperty('projects')) {
      fteData[0].projects.forEach(project => {
        let projectFTETotal = 0;
        if (project.hasOwnProperty('ftes')) {
          project.ftes.forEach(month => {
            projectFTETotal += month.fte;
          });
          seriesData.push({
            name: project.projectName,
            y: this.toolsService.roundTo((projectFTETotal / fteTotal) * 100, 1),
            drilldown: project.projectName
          });
        }
      });
    }

    // sort the array by fte value in descending order
    if (seriesData.length) {
      seriesData = _.reverse(_.sortBy(seriesData, ['y']));
    }

    // show the first data point as sliced and selected
    if (seriesData.length > 1) {
      seriesData[0].sliced = true;
      seriesData[0].selected = true;
    }

    // build the drilldown data
    if (fteData[0].hasOwnProperty('projects')) {

      // iterate through each project
      fteData[0].projects.forEach(project => {

        // build an array of unique team member names for this project
        let teamMembers = [];
        let projectFTESum = 0;
        project.ftes.forEach(month => {
          month.teamMembers.forEach(teamMember => {
            teamMembers.push(teamMember.fullName);
            projectFTESum += teamMember.fte;
          });
        });
        teamMembers = _.uniq(teamMembers);

        // get the fte total and percent for each team member
        const drillDownData = [];
        teamMembers.forEach(teamMemberName => {
          let teamMemberFTETotal = 0;
          project.ftes.forEach(month => {
            month.teamMembers.forEach(teamMember => {
              if (teamMember.fullName === teamMemberName) {
                teamMemberFTETotal += teamMember.fte;
              }
            });
          });
          drillDownData.push([teamMemberName, this.toolsService.roundTo((teamMemberFTETotal / projectFTESum) * 100, 1)]);
        });

        // TO-DO: push into an array of object first, then use _.sortBy to sort by fte percent descending
        // then push into the arrays with just the values with no keys

        // push in an object for each project/slice
        drilldownSeries.push({
          name: project.projectName,
          id: project.projectName,
          data: drillDownData
        });

      });

    }


    // slice off the 'View data table' and 'Open in Highcharts Cloud' menu options
    const highchartsButtons = highcharts.getOptions().exporting.buttons.contextButton.menuItems.slice(0, 9);


    // set the chart options
    const chartOptions = {
      chart: {
        plotBackgroundColor: null,
        plotBorderWidth: null,
        plotShadow: false,
        type: 'pie',
        height: 450
      },
      title: {
        text: `Your FTEs by Project`
      },
      subtitle: {
        text: `For current fiscal quarter.  Click a slice to view project team members.`
        // style: {
        //   color: '#FF00FF',
        //   fontWeight: 'bold'
        // }
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
      tooltip: {
        pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
      },
      plotOptions: {
        series: {
          dataLabels: {
            enabled: true,
            format: '{point.name}: {point.y:.1f}%'
          }
        }
      },
      series: [{
        name: 'FTE %',
        colorByPoint: true,
          data: seriesData
      }],
      drilldown: {
        series: drilldownSeries
      }
    };


    // return the chart options
    return chartOptions;

  }

}
