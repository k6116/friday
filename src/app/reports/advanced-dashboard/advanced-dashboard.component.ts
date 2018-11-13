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
if (!Highcharts.Chart.prototype.addSeriesAsDrilldown) { // fix for really dumb HighCharts bug that errors when drilldown is called twice
  require('highcharts/modules/drilldown.js')(Highcharts);
}
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
  chartJobTitleFTE: any;

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
  jobTitlesList: any;
  jobTitleFTE: any;
  jobTitleFTEDrillDown: any;

  ssAvgFTEAfterSHP: any;
  ssTotalFTEAfterSHP: any;
  ssAvgFTENoPLC: any;
  ssTotalFTENoPLC: any;

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
      // PLCStatusIDs: '1,2,3,4,5,6,7',
      // PLCDateRanges: 'NULL|NULL,NULL|NULL,NULL|NULL,NULL|NULL,NULL|NULL,NULL|NULL,NULL|NULL',
      // PLCStatusIDs: '',
      // PLCDateRanges: '',
      ProjectName: '',
      ProjectTypeIDs: '0,1,2,3,4',
      ProjectStatusIDs: '0,1,2,3,4,5',
      ProjectPriorityIDs: '0,1,3,4,5',
      ProjectOwnerEmails: '',
      FTEMin: '0',
      FTEMax: 'NULL',
      FTEDateFrom: 'NULL',
      FTEDateTo: 'NULL'
    };

    await this.advancedFilter(filterOptions);
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
    this.getScheduleStats();
    this.getJobTitleData();
  }

  renderProjectTypesChart() {
    const chartOptions = this.buildProjectTypesChartOptions();
    this.chartProjectTypes = Highcharts.chart('projectTypesChart', chartOptions);
    setTimeout(() => {
      this.chartProjectTypes.reflow();
    }, 0);
  }

  renderPriorityFTEChart() {
    const chartOptions = this.buildPriorityFTEChartOptions();
    this.chartPriorityFTE = Highcharts.chart('priorityFTEChart', chartOptions);
    setTimeout(() => {
      this.chartPriorityFTE.reflow();
    }, 0);
  }

  renderJobTitleFTEChart() {
    const chartOptions = this.buildJobTitleFTEChartOptions();
    this.chartJobTitleFTE = Highcharts.chart('jobTitleFTEChart', chartOptions);
    setTimeout(() => {
      this.chartJobTitleFTE.reflow();
    }, 0);
  }

  renderSchedulesChart() {
    const chartOptions = this.buildSchedulesChartOptions();
    this.chartSchedules = Highcharts.chart('schedulesChart', chartOptions);
    setTimeout(() => {
      this.chartSchedules.reflow();
    }, 0);
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
      subtitle: {
        text: 'Click bar to drilldown'
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

  buildJobTitleFTEChartOptions() {

    // set the chart options
    const chartOptions = {
      chart: {
        type: 'column',
        backgroundColor: null,
        marginBottom: 100
      },
      title: {
        text: 'JobTitles vs FTEs'
      },
      subtitle: {
        text: 'Click bar to drilldown'
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
        'name': 'JobTitle',
        'colorByPoint': true,
        'data': this.jobTitleFTE
      }],
      drilldown: {
        series: this.jobTitleFTEDrillDown
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
        formatter: function () {
          return '<b>' + this.x + '</b> | <b>CON - SHP </b> | <b>' + Highcharts.dateFormat('%b %d \'%y', this.point.low) + ' - ' +
                  Highcharts.dateFormat('%b %d \'%y', this.point.high) + '</b>';
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

    this.prioritiesCount = _.sortBy(dataSeries, function(pri) { return pri['y']; });
    this.prioritiesCount = this.prioritiesCount.reverse();
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

      // Sort by FTE totals and redistribute arrays for highchart formats
      drillDownData.sort(function(a, b) {return a[1] > b[1] ? -1 : 1; });

      drillDownSeries.push({
        name: this.prioritiesList[k],
        id: this.prioritiesList[k],
        data: drillDownData
      });
    }

    // update the priority-less field to "No Priority" for readability in the charts
    const noPriorityIdx1 = dataSeries.findIndex((obj => obj.name === undefined));
    const noPriorityIdx2 = drillDownSeries.findIndex((obj => obj.name === undefined));

    dataSeries[noPriorityIdx1].name = 'No Priority';
    dataSeries[noPriorityIdx1].drilldown = 'No Priority';
    drillDownSeries[noPriorityIdx2].name = 'No Priority';
    drillDownSeries[noPriorityIdx2].id = 'No Priority';

    this.priorityFTE = _.sortBy(dataSeries, function(pri) { return pri['y']; });
    this.priorityFTE = this.priorityFTE.reverse();
    // round the decimal values to 2 places
    this.priorityFTE.forEach(pr => {pr.y = Math.round( pr.y * 1e2 ) / 1e2; });
    this.priorityFTEDrillDown = drillDownSeries;

    this.renderPriorityFTEChart();
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
    this.statusesCount = _.sortBy(dataSeries, function(pri) { return pri['y']; });
    this.statusesCount = this.statusesCount.reverse();
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
    this.renderProjectTypesChart();
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

    this.ownersCount = _.sortBy(dataSeries, function(pri) { return pri['y']; });
    this.ownersCount = this.ownersCount.reverse();
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

    this.renderSchedulesChart();
  }

  getScheduleStats() {

    let afterSHPCount = 0;
    let noPLCCount = 0;
    this.ssAvgFTEAfterSHP = 0;
    this.ssTotalFTEAfterSHP = 0;
    this.ssAvgFTENoPLC = 0;
    this.ssTotalFTENoPLC = 0;

    // update the dataSeries object with the statistics around schedules
    for (let i = 0; i < this.advancedFilteredResults.length; i++) {
      if ('Schedules' in this.advancedFilteredResults[i]) {
        if (this.advancedFilteredResults[i].Schedules.some(plc => plc.PLCStatusName === 'SHP')) {

          const objSHP = this.advancedFilteredResults[i].Schedules.find(plc => plc.PLCStatusName === 'SHP');
          if (objSHP.PLCDate > moment().format('YYYY-MM-DD')) {
            this.ssTotalFTEAfterSHP = this.ssTotalFTEAfterSHP + this.advancedFilteredResults[i].TotalProjectFTE;
            afterSHPCount = afterSHPCount + 1;
          }
        }
      } else {
        this.ssTotalFTENoPLC = this.ssTotalFTENoPLC + this.advancedFilteredResults[i].TotalProjectFTE;
        noPLCCount = noPLCCount + 1;
      }
    }

    this.ssAvgFTEAfterSHP = Number(this.ssTotalFTEAfterSHP / afterSHPCount).toFixed(0);
    this.ssTotalFTEAfterSHP = Number(this.ssTotalFTEAfterSHP).toFixed(0);
    this.ssAvgFTENoPLC = Number(this.ssTotalFTENoPLC / noPLCCount).toFixed(0);
    this.ssTotalFTENoPLC = Number(this.ssTotalFTENoPLC).toFixed(0);

    console.log('this.ssTotalFTEAfterSHP', this.ssTotalFTEAfterSHP)
    console.log('this.ssTotalFTENoPLC', this.ssTotalFTENoPLC)

  }

  async getJobTitleData() {
    const dataSeries = [];
    const drillDownSeries = [];
    const projectListArray = _.uniq(_.pluck(this.advancedFilteredResults, 'ProjectID'));
    const projectIDString = projectListArray.toString();
    const fromDate = '2018-01-01';
    const toDate = '2019-01-01';

    const projectJobTitles = await this.apiDataAdvancedFilterService
      .getProjectJobTitleAdvancedFilter(projectIDString, fromDate, toDate).toPromise();

    const jobTitles = _.uniq(_.pluck(projectJobTitles.flat, 'jobTitle'));
    this.jobTitlesList = jobTitles;

    // initialize the dataSeries object with the jobtitles
    for (let jt = 0; jt < this.jobTitlesList.length; jt++) {
      dataSeries.push({
        name: this.jobTitlesList[jt],
        y: 0,
        drilldown: this.jobTitlesList[jt]
      });
    }

    // update the dataSeries object with the sum of FTEs per jobtitle
    for (let i = 0; i < dataSeries.length; i++) {
      for (let j = 0; j < projectJobTitles.flat.length; j++) {
        if (dataSeries[i].name === projectJobTitles.flat[j]['jobTitle']) {
          dataSeries[i].y = dataSeries[i].y + projectJobTitles.flat[j]['allocations:fte'];
        }
      }
    }

    // populate the drilldown object to get the project and totalFTE for each priority
    // first loop through each job title
    this.jobTitlesList.forEach(jt => {
      const drillDownData = [];
      for (let k = 0; k < projectJobTitles.nested.length; k++) {
        if (jt === projectJobTitles.nested[k]['jobTitle']) {

          const jobSubTitles = _.uniq(_.pluck(projectJobTitles.nested[k].allocations, 'jobSubTitle'));

          // second loop through each job sub title per job title and sum the total fte for that job sub title
          jobSubTitles.forEach(jst => {
            let jobSubTitleFTETotal = 0;
            for (let l = 0; l < projectJobTitles.nested[k].allocations.length; l++) {
              if (jst === projectJobTitles.nested[k].allocations[l]['jobSubTitle']) {
                jobSubTitleFTETotal = jobSubTitleFTETotal + projectJobTitles.nested[k].allocations[l]['fte'];
              }
            }
            drillDownData.push([jst,  Math.round( jobSubTitleFTETotal * 1e2 ) / 1e2 ]) ;
          });
        }
      }

      // Sort by FTE totals and redistribute arrays for highchart formats
      drillDownData.sort(function(a, b) {return a[1] > b[1] ? -1 : 1; });

      drillDownSeries.push({
        name: jt,
        id: jt,
        data: drillDownData
      });
    });

    this.jobTitleFTE = _.sortBy(dataSeries, function(jt) { return jt['y']; });
    this.jobTitleFTE = this.jobTitleFTE.reverse();
    // round the decimal values to 2 places
    this.jobTitleFTE.forEach(jt => {jt.y = Math.round( jt.y * 1e2 ) / 1e2; });
    this.jobTitleFTEDrillDown = drillDownSeries;

    this.renderJobTitleFTEChart();
  }


  getTopFTEProjects() {
    const topFTEProjectsArray = _.sortBy(this.advancedFilteredResults, function(project) { return project['TotalProjectFTE']; });
    this.topFTEProjects = topFTEProjectsArray.reverse().slice(0, 5);
    // console.log('this.topFTEProjects', this.topFTEProjects)
    this.getTopFTEProjects();
  }

}
