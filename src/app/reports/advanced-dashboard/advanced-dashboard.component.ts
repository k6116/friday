import { Component, OnInit } from '@angular/core';
import { ToolsService } from '../../_shared/services/tools.service';
import { ApiDataAdvancedFilterService, ApiDataOrgService } from '../../_shared/services/api-data/_index';
import { Subscription } from 'rxjs/Subscription';
import { AuthService } from '../../_shared/services/auth.service';
import { CacheService } from '../../_shared/services/cache.service';

declare var $: any;
declare var require: any;
import * as Highcharts from 'highcharts';
require('highcharts/modules/data.js')(Highcharts);
require('highcharts/modules/drilldown.js')(Highcharts);
require('highcharts/modules/no-data-to-display.js')(Highcharts);
require('highcharts/highcharts-more.js')(Highcharts);
import * as moment from 'moment';
import * as _ from 'underscore';


@Component({
  selector: 'app-advanced-dashboard',
  templateUrl: './advanced-dashboard.component.html',
  styleUrls: ['./advanced-dashboard.component.css', '../../_shared/styles/common.css']
})
export class AdvancedDashboardComponent implements OnInit {

  showDashboard: boolean;
  showSpinner: boolean;
  advancedFilteredResults: any;

  chartPriorities: any;
  chartStatuses: any;
  chartProjectTypes: any;
  chartOwners: any;
  chartPriorityFTE: any;
  chartSchedules: any;

  prioritiesCount: any;
  prioritiesList: any;
  statusesCount: any;
  projectTypesCount: any;
  topFTEProjects: any;
  ownersCount: any;
  priorityFTE: any;
  priorityFTEDrillDown: any;
  schedulesProjectsList: any;
  schedulesList: any;
  schedulesEarliestCONDate: any;
  schedulesLatestSHPDate: any;
  schedulesChartHeight: number;

  constructor(
    private apiDataAdvancedFilterService: ApiDataAdvancedFilterService,
    private apiDataOrgService: ApiDataOrgService,
    private authService: AuthService,
    private toolsService: ToolsService,
    private cacheService: CacheService
  ) { }

  async ngOnInit() {

    this.showDashboard = true;

    const filterOptions = {
      PLCStatusIDs: '7,6',
      PLCDateRanges: '2017-01-01|NULL,2017-01-01|NULL',
      ProjectName: '',
      ProjectTypeIDs: '0,1,2',
      ProjectStatusIDs: '0,1,2,3,4,5',
      ProjectPriorityIDs: '0,1,3,4,5',
      ProjectOwnerEmails: '',
      FTEMin: '0',
      FTEMax: 'NULL',
      FTEDateFrom: 'NULL',
      FTEDateTo: 'NULL'
    };

    await this.advancedFilter(filterOptions);
    this.renderPrioritesChart();
    this.renderStatusesChart();
    this.renderProjectTypesChart();
    this.getTopFTEProjects();
    this.renderOwnersChart();
    this.renderPriorityFTEChart();
    this.renderSchedulesChart();
  }

  async advancedFilter(filterOptions: any) {
    this.advancedFilteredResults = await this.apiDataAdvancedFilterService.getAdvancedFilteredResults(filterOptions).toPromise();
    this.advancedFilteredResults.nested.forEach( project => {
      const schedules = [];
      if ('Schedules' in project) {
        Object.keys(project.Schedules).forEach(function(key) {
          schedules.push({
            PLCStatusName: key,
            PLCDate: project.Schedules[key]
          });
        });
        project.Schedules = schedules;
      }
    });
    this.advancedFilteredResults = this.advancedFilteredResults.nested;
    console.log('this.advancedFilteredResults', this.advancedFilteredResults);
    this.getPriorities();
    this.getStatuses();
    this.getProjectTypes();
    this.getOwners();
    this.getPriorityFTE();
    this.getSchedules();
  }

  renderPrioritesChart() {
    const chartOptions = this.buildPrioritiesChartOptions();
    this.chartPriorities = Highcharts.chart('prioritiesChart', chartOptions);
    setTimeout(() => {
      this.chartPriorities.reflow();
    }, 0);
  }

  renderStatusesChart() {
    const chartOptions = this.buildStatusesChartOptions();
    this.chartStatuses = Highcharts.chart('statusesChart', chartOptions);
    setTimeout(() => {
      this.chartStatuses.reflow();
    }, 0);
  }

  renderProjectTypesChart() {
    const chartOptions = this.buildProjectTypesChartOptions();
    this.chartProjectTypes = Highcharts.chart('projectTypesChart', chartOptions);
    setTimeout(() => {
      this.chartProjectTypes.reflow();
    }, 0);
  }

  renderOwnersChart() {
    const chartOptions = this.buildOwnerChartOptions();
    this.chartOwners = Highcharts.chart('ownersChart', chartOptions);
    setTimeout(() => {
      this.chartOwners.reflow();
    }, 0);
  }

  renderPriorityFTEChart() {
    const chartOptions = this.buildPriorityFTEChartOptions();
    this.chartPriorityFTE = Highcharts.chart('priorityFTEChart', chartOptions);
    setTimeout(() => {
      this.chartPriorityFTE.reflow();
    }, 0);
  }

  renderSchedulesChart() {
    const chartOptions = this.buildSchedulesChartOptions();
    this.chartSchedules = Highcharts.chart('schedulesChart', chartOptions);
    setTimeout(() => {
      this.chartSchedules.reflow();
    }, 0);
  }

  // take in the fte data and return the chart options for the stacked column chart
  // for the team ftes
  buildPrioritiesChartOptions() {

    // set the chart options
    const chartOptions = {
      chart: {
        type: 'column',
        backgroundColor: null,
        marginBottom: 100
      },
      title: {
        text: 'Priorites',
        style: {
          color: '#000000',
          fontSize: '24px'
      }
      },
      xAxis: {
        type: 'category'
      },
      yAxis: {
        title: {
          text: 'Number of Projects'
        }
      },
      legend: {
        enabled: false
      },
      credits: {
        enabled: false
      },
      exporting: {
        enabled: false
      },
      plotOptions: {
        series: {
          borderWidth: 0,
          dataLabels: {
            enabled: true
          }
        }
      },
      tooltip: {
        headerFormat: '<span style="font-size:11px">{series.name}</span><br>',
        pointFormat: '<span style="color:{point.color}">{point.name}</span>: <b>{point.y}</b> projects<br/>'
      },
      series: [
        {
          'name': 'Priorites',
          'colorByPoint': true,
          'data': this.prioritiesCount
        }
      ]
    };

    // return the chart options object
    return chartOptions;
  }

  buildStatusesChartOptions() {

    // set the chart options
    const chartOptions = {
      chart: {
        type: 'column',
        backgroundColor: null,
        marginBottom: 100
      },
      title: {
        text: 'Statuses'
      },
      xAxis: {
        type: 'category'
      },
      yAxis: {
        title: {
          text: 'Number of Projects'
        }
      },
      legend: {
        enabled: false
      },
      credits: {
        enabled: false
      },
      exporting: {
        enabled: false
      },
      plotOptions: {
        series: {
          borderWidth: 0,
          dataLabels: {
            enabled: true
          }
        }
      },
      tooltip: {
        headerFormat: '<span style="font-size:11px">{series.name}</span><br>',
        pointFormat: '<span style="color:{point.color}">{point.name}</span>: <b>{point.y}</b> projects<br/>'
      },
      series: [
        {
          'name': 'Statuses',
          'colorByPoint': true,
          'data': this.statusesCount
        }
      ]
    };

    // return the chart options object
    return chartOptions;
  }

  buildProjectTypesChartOptions() {

    // set the chart options
    const chartOptions = {
      chart: {
        type: 'column',
        backgroundColor: null,
        marginBottom: 100
      },
      title: {
        text: 'Project Types'
      },
      xAxis: {
        type: 'category'
      },
      yAxis: {
        title: {
          text: 'Number of Projects'
        }
      },
      legend: {
        enabled: false
      },
      credits: {
        enabled: false
      },
      exporting: {
        enabled: false
      },
      plotOptions: {
        series: {
          borderWidth: 0,
          dataLabels: {
            enabled: true
          }
        }
      },
      tooltip: {
        headerFormat: '<span style="font-size:11px">{series.name}</span><br>',
        pointFormat: '<span style="color:{point.color}">{point.name}</span>: <b>{point.y}</b> projects<br/>'
      },
      series: [
        {
          'name': 'Project Types',
          'colorByPoint': true,
          'data': this.projectTypesCount
        }
      ]
    };

    // return the chart options object
    return chartOptions;
  }

  buildOwnerChartOptions() {

    // set the chart options
    const chartOptions = {
      chart: {
        type: 'column',
        backgroundColor: null,
        marginBottom: 100
      },
      title: {
        text: 'Project Owners'
      },
      xAxis: {
        type: 'category'
      },
      yAxis: {
        title: {
          text: 'Number of Projects'
        }
      },
      legend: {
        enabled: false
      },
      credits: {
        enabled: false
      },
      exporting: {
        enabled: false
      },
      plotOptions: {
        series: {
          borderWidth: 0,
          dataLabels: {
            enabled: true
          }
        }
      },
      tooltip: {
        headerFormat: '<span style="font-size:11px">{series.name}</span><br>',
        pointFormat: '<span style="color:{point.color}">{point.name}</span>: <b>{point.y}</b> projects<br/>'
      },
      series: [
        {
          'name': 'Project Owners',
          'colorByPoint': true,
          'data': this.ownersCount
        }
      ]
    };

    // return the chart options object
    return chartOptions;
  }

  buildPriorityFTEChartOptions() {

    // set the chart options
    const chartOptions = {
      chart: {
        type: 'column',
        backgroundColor: null,
        marginBottom: 100
      },
      title: {
        text: 'Priorities vs FTEs'
      },
      xAxis: {
        type: 'category'
      },
      yAxis: {
        title: {
            text: 'Total FTEs'
        }
      },
      legend: {
        enabled: false
      },
      credits: {
        enabled: false
      },
      exporting: {
        enabled: false
      },
      plotOptions: {
        series: {
          borderWidth: 0,
          dataLabels: {
            enabled: true
          }
        }
      },
      tooltip: {
        headerFormat: '<span style="font-size:11px">{series.name}</span><br>',
        pointFormat: '<span style="color:{point.color}">{point.name}</span>: <b>{point.y}</b> FTEs<br/>'
      },
      series: [{
        'name': 'Priority',
        'colorByPoint': true,
        'data': this.priorityFTE
      }],
      drilldown: {
        series: this.priorityFTEDrillDown
      }
    };

    // return the chart options object
    return chartOptions;
  }

  buildSchedulesChartOptions() {

    // set the chart options
    const chartOptions = {
      chart: {
        type: 'columnrange',
        inverted: true,
        backgroundColor: null,
        marginBottom: 100,
        height: 400 * this.schedulesChartHeight
      },
      title: {
        text: 'PLC Schedules'
      },
      subtitle: {
        text: 'Displaying projects with CON and SHP dates defined'
      },
      xAxis: {
        categories: this.schedulesProjectsList
      },
      yAxis: {
        type: 'datetime',
        min: Date.UTC(moment(this.schedulesEarliestCONDate).year(), moment(this.schedulesEarliestCONDate).utc().month(), 0),
        max:  Date.UTC(moment(this.schedulesLatestSHPDate).year(), moment(this.schedulesLatestSHPDate).utc().add(1, 'month').month(), 0),
        minTickInterval: 28 * 24 * 3600 * 1000
      },
      legend: {
        enabled: false
      },
      credits: {
        enabled: false
      },
      exporting: {
        enabled: false
      },
      plotOptions: {
        series: {
          borderWidth: 0,
          dataLabels: {
            enabled: true,
            formatter: function () {
              return Highcharts.dateFormat('%b', this.y);
          }
          }
        }
      },
      tooltip: {
        // headerFormat: '<span style="font-size:11px">{series.name}</span><br>',
        // pointFormat: '<span style="color:{point.color}">{point.name}</span>: <b>{point.y}</b> projects<br/>',
        formatter: function () {
          return '<b>CON: </b>' + Highcharts.dateFormat('%d %b \'%y', this.point.low) + ' <b> SHP: </b>' +
                  Highcharts.dateFormat('%d %b \'%y', this.point.high) + '</b>';
      }
      },
      series: [{
        name: 'Dates',
        data: this.schedulesList
        }]
    };

    // return the chart options object
    return chartOptions;
  }

  getPriorities() {
    const dataSeries = [];
    const prioritiesCountArray = _.countBy(this.advancedFilteredResults, function(project) { return project['PriorityName']; });
    Object.keys(prioritiesCountArray).forEach(function(key) {
      dataSeries.push({
        name: key,
        y: prioritiesCountArray[key],
        drilldown: key
      });
    });
    this.prioritiesCount = dataSeries;
  }

  getPriorityFTE() {
    const dataSeries = [];
    const drillDownSeries = [];

    // get list of priorities in an array
    const prioritiesListArray = _.uniq(_.pluck(this.advancedFilteredResults, 'PriorityName'));
    this.prioritiesList = prioritiesListArray;

    // initialize the dataSeries object with the priorities
    for (let pri = 0; pri < this.prioritiesList.length; pri++) {
      dataSeries.push({
        name: this.prioritiesList[pri],
        y: 0,
        drilldown: this.prioritiesList[pri]
      });
    }

    // update the dataSeries object with the sum of FTEs per priority
    for (let i = 0; i < dataSeries.length; i++) {
      for (let j = 0; j < this.advancedFilteredResults.length; j++) {
        if (dataSeries[i].name === this.advancedFilteredResults[j].PriorityName) {
          dataSeries[i].y = dataSeries[i].y + this.advancedFilteredResults[j].TotalProjectFTE;
        }
      }
    }

    // populate the drilldown object to get the project and totalFTE for each priority
    for (let k = 0; k < this.prioritiesList.length; k++) {
      const drillDownData = [];
      for (let l = 0; l < this.advancedFilteredResults.length; l++) {
        if (this.prioritiesList[k] === this.advancedFilteredResults[l].PriorityName) {
          if (this.advancedFilteredResults[l].TotalProjectFTE !== 0) {
            drillDownData.push([
              this.advancedFilteredResults[l].ProjectName,
              this.advancedFilteredResults[l].TotalProjectFTE
            ]);
          }
        }
      }
      drillDownSeries.push({
        name: this.prioritiesList[k],
        id: this.prioritiesList[k],
        data: drillDownData
      });
    }

    // console.log('drillDownSeries', drillDownSeries)
    this.priorityFTE = dataSeries;
    this.priorityFTEDrillDown = drillDownSeries;
  }

  getStatuses() {
    const dataSeries = [];
    const statusesCountArray = _.countBy(this.advancedFilteredResults, function(project) { return project['ProjectStatusName']; });
    Object.keys(statusesCountArray).forEach(function(key) {
      dataSeries.push({
        name: key,
        y: statusesCountArray[key],
        drilldown: key
      });
    });
    this.statusesCount = dataSeries;
  }

  getProjectTypes() {
    const dataSeries = [];
    const projectTypesCountArray = _.countBy(this.advancedFilteredResults, function(project) { return project['ProjectTypeName']; });
    Object.keys(projectTypesCountArray).forEach(function(key) {
      // console.log(key, projectTypesCountArray[key]);
      dataSeries.push({
        name: key,
        y: projectTypesCountArray[key],
        drilldown: key
      });
    });
    this.projectTypesCount = dataSeries;
    // console.log('this.projectTypesCount: ', this.projectTypesCount);
  }

  getOwners() {
    const dataSeries = [];
    const ownersCountArray = _.countBy(this.advancedFilteredResults, function(project) { return project['ProjectOwnerName']; });
    Object.keys(ownersCountArray).forEach(function(key) {
      dataSeries.push({
        name: key,
        y: ownersCountArray[key],
        drilldown: key
      });
    });
    this.ownersCount = dataSeries;
  }

  getSchedules() {
    const projectList = [];
    const projectScheduleData = [];
    const scheduleData = [];

    // update the dataSeries object with the sum of FTEs per priority
    for (let i = 0; i < this.advancedFilteredResults.length; i++) {
      if ('Schedules' in this.advancedFilteredResults[i]) {
        if (this.advancedFilteredResults[i].Schedules.some(plc => plc.PLCStatusName === 'CON') &&
            this.advancedFilteredResults[i].Schedules.some(plc => plc.PLCStatusName === 'SHP')) {

            const objCON = this.advancedFilteredResults[i].Schedules.find(plc => plc.PLCStatusName === 'CON');
            const objSHP = this.advancedFilteredResults[i].Schedules.find(plc => plc.PLCStatusName === 'SHP');

            projectScheduleData.push([
              this.advancedFilteredResults[i].ProjectName,
              moment.utc(objCON.PLCDate).valueOf(),
              moment.utc(objSHP.PLCDate).valueOf()
            ]);
        }
      }
    }

    // Sort by SHP dates and redistribute arrays for highchart formats
    projectScheduleData.sort(function(a, b) {return a[2] > b[2] ? 1 : -1; });

    let minCON = 10000000000000;
    let maxSHP = 0;
    for (let j = 0; j < projectScheduleData.length; j++) {
      // get min and max CON and SHP values
      if (projectScheduleData[j][1] < minCON) {
        minCON = projectScheduleData[j][1];
      }
      if (projectScheduleData[j][2] > maxSHP) {
        maxSHP = projectScheduleData[j][2];
      }
      projectList.push(projectScheduleData[j][0]);
      scheduleData.push([projectScheduleData[j][1], projectScheduleData[j][2]]);
    }

    // dynamically adjust the height of the chart by scaling with the number of projects returned
    this.schedulesChartHeight = projectList.length / 12;

    this.schedulesEarliestCONDate = moment.utc(minCON).toISOString();
    this.schedulesLatestSHPDate = moment.utc(maxSHP).toISOString();
    this.schedulesProjectsList = projectList;
    this.schedulesList = scheduleData;

  }

  getTopFTEProjects() {
    const topFTEProjectsArray = _.sortBy(this.advancedFilteredResults, function(project) { return project['TotalProjectFTE']; });
    this.topFTEProjects = topFTEProjectsArray.reverse().slice(0, 5);
    // console.log('this.topFTEProjects', this.topFTEProjects)
  }

}
