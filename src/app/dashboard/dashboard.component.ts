import { Component, OnInit } from '@angular/core';
import { AppDataService } from '../_shared/services/app-data.service';
import { ApiDataOrgService, ApiDataReportService } from '../_shared/services/api-data/_index';
import { AuthService } from '../_shared/services/auth.service';
import { ToolsService } from '../_shared/services/tools.service';

declare var require: any;

import * as highcharts from 'highcharts';
require('highcharts/modules/data.js')(highcharts);
require('highcharts/modules/drilldown.js')(highcharts);
require('highcharts/modules/solid-gauge.js')(highcharts);
import * as moment from 'moment';
import * as _ from 'lodash';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css', '../_shared/styles/common.css']
})
export class DashboardComponent implements OnInit {

  dashboardFTEData: any;
  chartOptions: any;
  showDashboard: boolean;
  highchartsButtons: any;
  completedFTEs: string;
  notCompletedFTEs: string;

  constructor(
    private appDataService: AppDataService,
    private apiDataReportService: ApiDataReportService,
    private apiDataOrgService: ApiDataOrgService,
    private authService: AuthService,
    private toolsService: ToolsService
  ) { }

  ngOnInit() {

    const currentTime = moment();

    console.log('current time');
    console.log(currentTime);

    // format: 2013-02-08

    // console.log(moment('2018-11-06'));
    this.fiscalQuarter(moment('2017-10-31'));

    this.startOfYear(moment());
    this.endOfYear(moment());
    this.currentYearMonths(moment());

    this.apiDataReportService.getDashboardFTEData(this.authService.loggedInUser.email, '05-01-2018', '08-01-2018')
      .subscribe(
        res => {
          console.log('dashboard data:');
          console.log(res);
          this.dashboardFTEData = res;
          this.renderMYFTEsPieChart();
          // this.renderMYFTEsColumnChart();
          // this.renderFTEEntryProgress();
          this.showDashboard = true;
        },
        err => {
          console.log(err);
        }
      );

      this.highchartsButtons = highcharts.getOptions().exporting.buttons.contextButton.menuItems.slice(0, 9);
      // console.log(this.highchartsButtons);

  }

  renderMYFTEsPieChart() {

    // filter to get only the logged in user's fte values
    const fteData = this.dashboardFTEData.filter(data => {
      return data.emailAddress === this.authService.loggedInUser.email;
    });

    console.log('fte data for logged in user:');
    console.log(fteData);

    // if the user does not have any projects, exit here
    if (!fteData.hasOwnProperty('projects')) {
      return;
    }

    // sum up total fte number across all the user's projects (will be for the current quarter always)
    let fteTotal = 0;
    fteData[0].projects.forEach(project => {
      project.ftes.forEach(month => {
        fteTotal += month.fte;
      });
    });

    // console.log(`total fte for the quarter is: ${fteTotal} (should be 3)`);

    // for each project, total up the ftes, calculate the percentages and push into the array
    let seriesData = [];
    fteData[0].projects.forEach(project => {
      let projectFTETotal = 0;
      project.ftes.forEach(month => {
        projectFTETotal += month.fte;
      });
      seriesData.push({
        name: project.projectName,
        y: this.toolsService.roundTo((projectFTETotal / fteTotal) * 100, 1),
        drilldown: project.projectName
      });
    });

    // sort the array by fte value in descending order
    seriesData = _.reverse(_.sortBy(seriesData, ['y']));

    // console.log('series data for your ftes:');
    // console.log(seriesData);

    // show the first data point as sliced
    if (seriesData.length > 1) {
      seriesData[0].sliced = true;
      seriesData[0].selected = true;
    }

    // build the drilldown data
    const drilldownSeries = [];
    fteData[0].projects.forEach(project => {

      // get all team members data for this project into an array of objects (not-unique at this point)
      // at the same time, get sum of FTEs for this project
      // let projectFTESum = 0;
      // const teamMembersData = [];
      // project.ftes.forEach(month => {
      //   month.teamMembers.forEach(teamMember => {
      //     teamMembersData.push(teamMember);
      //     projectFTESum += teamMember.fte;
      //   });
      // });
      // console.log(`teamMembersData for ${project.projectName}`);
      // console.log(teamMembersData);

      // console.log(`sum of ftes for ${project.projectName} is ${projectFTESum}`);


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
      // console.log(`unique team members array for ${project.projectName}`);
      // console.log(teamMembers);
      // console.log(`sum of ftes for ${project.projectName} is ${projectFTESum}`);

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
      // console.log(`drilldownSeries for ${project.projectName}`);
      // console.log(drilldownSeries);

      // store team members in an array of objects
      // const projectDrillDownObj = [];
      // teamMembers.forEach(teamMember => {
      //   projectDrillDownObj.push({
      //     name: teamMember,
      //     fte: 0
      //   });
      // });
      // console.log(`projectDrillDownObj for ${project.projectName}`);
      // console.log(projectDrillDownObj);

      // with the format for drilldown which is unconventional array of arrays,
      // will probably need to go through keys of objects to push into an array,
      // then push that array into the "data": array

    });

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
        text: `${this.authService.loggedInUser.fullName};
          For current fiscal quarter: 5/1/18 - 8/1/18.  Click a slice to view project team members.`
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
            menuItems: this.highchartsButtons
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


    highcharts.chart('chart1', chartOptions);

    // console.log(this.chartOptions);
    // console.log(JSON.stringify(this.chartOptions));

  }


  renderMYFTEsColumnChart() {

    // filter to get only the logged in user's fte values
    const fteData = this.dashboardFTEData.filter(data => {
      return data.emailAddress === this.authService.loggedInUser.email;
    });

    // console.log('fte data for logged in user:');
    // console.log(fteData);

    // sum up total fte number across all the user's projects (will be for the current quarter always)
    let fteTotal = 0;
    fteData[0].projects.forEach(project => {
      project.ftes.forEach(month => {
        fteTotal += month.fte;
      });
    });

    // console.log(`total fte for the quarter is: ${fteTotal} (should be 3)`);

    // for each project, total up the ftes, calculate the percentages and push into the array
    let seriesData = [];
    fteData[0].projects.forEach(project => {
      let projectFTETotal = 0;
      project.ftes.forEach(month => {
        projectFTETotal += month.fte;
      });
      seriesData.push({
        name: project.projectName,
        y: this.toolsService.roundTo((projectFTETotal / fteTotal) * 100, 1),
        drilldown: project.projectName
      });
    });

    // sort the array by fte value in descending order
    seriesData = _.reverse(_.sortBy(seriesData, ['y']));

    // console.log('series data for your ftes:');
    // console.log(seriesData);

    // build the drilldown data
    const drilldownSeries = [];
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
      // console.log(`unique team members array for ${project.projectName}`);
      // console.log(teamMembers);
      // console.log(`sum of ftes for ${project.projectName} is ${projectFTESum}`);

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
      // console.log(`drilldownSeries for ${project.projectName}`);
      // console.log(drilldownSeries);

    });

    const chartOptions = {
      chart: {
        type: 'column',
        height: 450
      },
      title: {
        text: `Your FTEs by Project`
      },
      subtitle: {
        text: `${this.authService.loggedInUser.fullName};
          For current fiscal quarter: 5/1/18 - 8/1/18.  Click a column to view project team members.`
      },
      credits: {
        text: 'jarvis.is.keysight.com',
        href: 'https://jarvis.is.keysight.com'
      },
      xAxis: {
        type: 'category'
      },
      yAxis: {
        title: {
          text: 'Full Time Equivalent (FTE) Percent'
        }
      },
      legend: {
        enabled: false
      },
      plotOptions: {
        series: {
          borderWidth: 0,
          dataLabels: {
            enabled: true,
            format: '{point.y:.1f}%'
          }
        }
      },
      tooltip: {
        headerFormat: '<span style="font-size:11px">{series.name}</span><br>',
        pointFormat: '<span style="color:{point.color}">{point.name}</span>: <b>{point.y:.2f}%</b> of total<br/>'
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


    highcharts.chart('chart2', chartOptions);

    // console.log(this.chartOptions);
    // console.log(JSON.stringify(this.chartOptions));

  }

  renderFTEEntryProgress() {

    const completedFTEsArr = [];
    const notCompletedFTEsArr = [];

    // build arrays of people that have completed or not completed their fte entries
    this.dashboardFTEData.forEach(employee => {
      let fteTotal = 0;
      if (employee.hasOwnProperty('projects')) {
        employee.projects.forEach(project => {
          project.ftes.forEach(fteEntry => {
            fteTotal += fteEntry.fte;
          });
        });
        if (fteTotal === 3) {
          completedFTEsArr.push(employee.name);
        } else {
          notCompletedFTEsArr.push(employee.name);
        }
      } else {
        notCompletedFTEsArr.push(employee.name);
      }
    });

    // build strings to display in the view
    this.completedFTEs = completedFTEsArr.join(', ');
    this.notCompletedFTEs = notCompletedFTEsArr.join(', ');

    console.log('completed ftes:');
    console.log(this.completedFTEs);

    console.log('not completed ftes:');
    console.log(this.notCompletedFTEs);

    console.log(this.dashboardFTEData.length);

    const chartOptions = {
      chart: {
        type: 'solidgauge',
        height: 450
      },
      title: {
        text: `Your Team's FTE Entry Progress`
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
      // the value axis
      yAxis: {
        min: 0,
        max: this.dashboardFTEData.length,
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

    highcharts.chart('chart3', chartOptions);


  }


  renderMYFTEsPieChart2() {

    const chartOptions = {
      chart: {
        plotBackgroundColor: null,
        plotBorderWidth: null,
        plotShadow: false,
        type: 'pie',
        height: 450
      },
      title: {
        text: `Your Team's FTEs By Project`
      },
      subtitle: {
        text: 'Current Fiscal Quarter: 5/1/18 - 8/1/18'
      },
      credits: {
        text: 'jarvis.is.keysight.com',
        href: 'https://jarvis.is.keysight.com'
      },
      tooltip: {
        pointFormat: '{series.name}: <b>{point.percentage:.1f}</b>'
      },
      plotOptions: {
        pie: {
          allowPointSelect: true,
          cursor: 'pointer',
          dataLabels: {
            enabled: true,
            format: '<b>{point.name}</b>: {point.percentage:.1f}%'
          }
        }
      },
      series: [{
        name: 'FTE %',
        colorByPoint: true,
          data: [{
              name: 'Chrome',
              y: 61.41,
              sliced: true,
              selected: true
          }, {
              name: 'Internet Explorer',
              y: 11.84
          }, {
              name: 'Firefox',
              y: 10.85
          }, {
              name: 'Edge',
              y: 4.67
          }, {
              name: 'Safari',
              y: 4.18
          }, {
              name: 'Sogou Explorer',
              y: 1.64
          }, {
              name: 'Opera',
              y: 1.6
          }, {
              name: 'QQ',
              y: 1.2
          }, {
              name: 'Other',
              y: 2.61
          }]
      }]
    };


    highcharts.chart('chart2', chartOptions);



  }

  fiscalQuarter(date: any) {
    const quarter = moment(date).add(2, 'months').quarter();
    const month = moment(date).month() + 1;  // need to add 1 since months are zero indexed
    // console.log(`month: ${month}`);
    const year = moment(date).year();
    // console.log(`year: ${year}`);
    const fiscalYear = month >= 11 ? year + 1 : year;
    console.log(`fiscal quarter: Q${quarter} ${fiscalYear}`);
  }

  startOfYear(date: any) {
    const year = moment(date).year();
    const startOfYear = moment(`${year}-01-01`);
    console.log(`start of year: ${startOfYear.format('dddd, MMMM Do YYYY, h:mm:ss a')}`);
  }

  endOfYear(date: any) {
    const year = moment(date).year();
    const endOfYear = moment(`${year + 1}-01-01`);
    console.log(`end of year: ${endOfYear.format('dddd, MMMM Do YYYY, h:mm:ss a')}`);
  }

  currentYearMonths(date: any) {
    const months = [];
    const year = moment(date).year();
    const startOfYear = moment(`${year}-01-01`);
    for (let i = 0; i < 12; i++) {
      const month = moment(`${year}-01-01`).add(i, 'months');
      months.push(month.format('MMM \'YY'));
    }
    console.log('months array');
    console.log(months);
  }


}
