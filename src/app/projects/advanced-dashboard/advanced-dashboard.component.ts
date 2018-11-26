import { Component, OnInit } from '@angular/core';
import { ToolsService } from '../../_shared/services/tools.service';
import { ApiDataAdvancedFilterService, ApiDataOrgService, ApiDataSchedulesService,
      ApiDataFteService } from '../../_shared/services/api-data/_index';
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
  PLCList: any;

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

  ssAvgFTEAfterSHP: any;
  ssTotalFTEAfterSHP: any;
  ssAvgFTENoPLC: any;
  ssTotalFTENoPLC: any;

  constructor(
    private apiDataAdvancedFilterService: ApiDataAdvancedFilterService,
    private apiDataOrgService: ApiDataOrgService,
    private apiDataSchedulesService: ApiDataSchedulesService,
    private apiDataFteService: ApiDataFteService,
    private authService: AuthService,
    private toolsService: ToolsService,
    private cacheService: CacheService
  ) { }

  async ngOnInit() {

    this.showDashboard = true;

    const filterOptions = {
      // PLCStatusIDs: '7,6',
      // PLCDateRanges: '2017-01-01|NULL,2017-01-01|NULL',
      PLCStatusIDs: '1,2,6,7',
      PLCDateRanges: 'NULL|NULL,NULL|NULL,NULL|NULL,NULL|NULL',
      // PLCStatusIDs: '',
      // PLCDateRanges: '',
      ProjectName: '00 Test Project 1,26-42 GHz 1st Mixer,BrixSG,Viking 1.5,Armstrong,Bugs Bunny',
      ProjectTypeIDs: '0,1,2,3,4,14',
      ProjectStatusIDs: '0,1,2,3,4,5',
      ProjectPriorityIDs: '0,1,3,4,5',
      ProjectOwnerEmails: '',
      FTEMin: '0',
      FTEMax: 'NULL',
      FTEDateFrom: 'NULL',
      FTEDateTo: 'NULL'
    };

    this.getPLCList();
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
    this.getOwners();
    this.getPriorityFTE();
    this.getSchedules();
    this.getScheduleStats();
    this.getTopFTEProjects();

  }

  async getPLCList() {
    this.PLCList = await this.apiDataSchedulesService.getPLCList().toPromise();
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

  buildPriorityFTEChartOptions() {

    // set the chart options
    const chartOptions = {
      chart: {
        type: 'column',
        backgroundColor: null,
        marginBottom: 100
      },
      title: {
        text: 'Priorities > Projects > JobTitles > JobSubTitles vs FTEs'
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
        'name': 'Priority List',
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
        text: `- Projects only display PLC schedules selected in the filter<br>
              - PLC duration starts from the end of the previous PLC checkpoint<br>
              - CONs do not have a "CON Start" at the moment, so schedules start at the completion of CON<br>
              - If PLCs have the same checkpoint date (e.g. CON and INV), they are "padded" just for display purposes in the chart.`
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
        enabled: true
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
            enabled: false,
            formatter: function () {
              return this.point.plcDate;
            }
          }
        },
        columnrange: {
          grouping: false
        }
      },
      tooltip: {
        formatter: function () {
          return '<b>' + this.x + '</b> | <b>' + this.series.name + ' </b> | <b>' + this.point.plcDate + '</b>';
      }
      },
      series: this.schedulesList
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

    // update the priority-less field to "No Priority" for readability in the charts
    const noPriorityIdx = dataSeries.findIndex((obj => obj.name === 'undefined'));
    dataSeries[noPriorityIdx].name = 'No Priority';
    dataSeries[noPriorityIdx].drilldown = 'No Priority';

    this.prioritiesCount = _.sortBy(dataSeries, function(pri) { return pri['y']; });
    this.prioritiesCount = this.prioritiesCount.reverse();
  }

  async getPriorityFTE() {
    const dataSeries = [];
    const drillDownObj = [];

    // get list of priorities in an array
    const prioritiesListArray = _.uniq(_.pluck(this.advancedFilteredResults, 'PriorityName'));
    const projectIDListArray = _.uniq(_.pluck(this.advancedFilteredResults, 'ProjectID'));
    this.prioritiesList = prioritiesListArray;

    let projectJobTitles = await this.apiDataFteService
      .indexProjectJobTitleFTE(projectIDListArray.toString(), 'NULL', 'NULL').toPromise();
    projectJobTitles = projectJobTitles.nested;

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

    // update the priority-less field to "No Priority" for readability in the charts
    const noPriorityIdx1 = dataSeries.findIndex((obj => obj.name === undefined));
    dataSeries[noPriorityIdx1].name = 'No Priority';
    dataSeries[noPriorityIdx1].drilldown = 'No Priority';

    // I'm sorry for this :(
    // Blame Highcharts
    for (let pri = 0; pri < projectJobTitles.length; pri++) {
      const drillDownProjData = [];
      for (let proj = 0; proj < projectJobTitles[pri].projects.length; proj++) {
        const drillDownJTData = [];
        let projFTESum = 0;
        if ('jobTitles' in projectJobTitles[pri].projects[proj]) {
          for (let jt = 0; jt < projectJobTitles[pri].projects[proj].jobTitles.length; jt++) {
            const drillDownJSTData = [];
            let jtFTESum = 0;
            for (let jst = 0; jst < projectJobTitles[pri].projects[proj].jobTitles[jt].jobSubTitles.length; jst++) {
              const jstObj = projectJobTitles[pri].projects[proj].jobTitles[jt].jobSubTitles[jst];
              jtFTESum = jtFTESum + jstObj.fte;
              drillDownJSTData.push({
                name: jstObj.jobSubTitleName,
                y: jstObj.fte
                // drilldown: projectJobTitles[pri].projects[proj].projectName + '-' +
                //   projectJobTitles[pri].projects[proj].jobTitles[jt].jobTitleID + '-' +
                //   projectJobTitles[pri].projects[proj].jobTitles[jt].jobSubTitles[jst].jobSubTitleID
              });
            }
            drillDownObj.push({
              id: projectJobTitles[pri].projects[proj].projectName + ' - ' + projectJobTitles[pri].projects[proj].jobTitles[jt].jobTitleID,
              data: drillDownJSTData
            });
            const jtObj = projectJobTitles[pri].projects[proj].jobTitles[jt];
            projFTESum = projFTESum + jtFTESum;
            drillDownJTData.push({
              name: jtObj.jobTitleName,
              y: jtFTESum,
              drilldown: projectJobTitles[pri].projects[proj].projectName + ' - ' +
                          projectJobTitles[pri].projects[proj].jobTitles[jt].jobTitleID
            });
          }
          drillDownObj.push({
            id: projectJobTitles[pri].projects[proj].projectName,
            name: projectJobTitles[pri].projects[proj].projectName + ' Job Titles',
            data: drillDownJTData
          });
          drillDownProjData.push({
            name: projectJobTitles[pri].projects[proj].projectName,
            y: projFTESum,
            drilldown: projectJobTitles[pri].projects[proj].projectName
          });
        }
      }
      drillDownObj.push({
        id: projectJobTitles[pri].priorityName,
        name: projectJobTitles[pri].priorityName + ' Projects',
        data: drillDownProjData
      });
    }

    this.priorityFTE = _.sortBy(dataSeries, function(pri) { return pri['y']; });
    this.priorityFTE = this.priorityFTE.reverse();
    // round the decimal values to 2 places
    this.priorityFTE.forEach(pr => {pr.y = Math.round( pr.y * 1e2 ) / 1e2; });

    this.priorityFTEDrillDown = drillDownObj;

// console.log('this.priorityFTEDrillDown', this.priorityFTEDrillDown)
// console.log('this.priorityFTE', this.priorityFTE)
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

    // update the priority-less field to "No Priority" for readability in the charts
    const noPriorityIdx = dataSeries.findIndex((obj => obj.name === 'undefined'));
    dataSeries[noPriorityIdx].name = 'No Priority';
    dataSeries[noPriorityIdx].drilldown = 'No Priority';

    this.statusesCount = _.sortBy(dataSeries, function(pri) { return pri['y']; });
    this.statusesCount = this.statusesCount.reverse();
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
    const PLCSeries = [];

    // generate the y axis project list
    this.advancedFilteredResults.forEach(proj => {
      projectList.push(proj.ProjectName + ' - ' + proj.ProjectTypeName);
    });

    // update the dataSeries object with the sum of FTEs per priority
    this.PLCList.forEach(plc => {
      const PLCDataSeries = [];
      for (let i = 0; i < this.advancedFilteredResults.length; i++) {
        // if ('Schedules' in this.advancedFilteredResults[i]) {
          // Loop through each PLC and if it exists, add to the data set
          const projPLC = this.advancedFilteredResults[i].Schedules.find(o1 => o1.PLCStatusName === plc.PLCStatusName);
          // skip if this project does not have this plc
          if (projPLC !== undefined) {
            if (projPLC.PLCDate !== '') {
              PLCDataSeries.push({
                projectName: this.advancedFilteredResults[i].ProjectName + ' - ' + this.advancedFilteredResults[i].ProjectTypeName,
                plcDate: projPLC.PLCDate
              });
            }
          }
        // }
      }
      if ( PLCDataSeries.length ) {
        PLCSeries.push({
          name: plc.PLCStatusName,
          stack: 'Schedule',
          data: PLCDataSeries
        });
      }
    });

    // Need to do some data maniuplation to reformat arrays for Highcharts
    for (let i = 0; i < PLCSeries.length; i++) {
      for (let j = 0; j < PLCSeries[i].data.length; j++) {
        if (i === 0) {
          // For now, padding the start to 5 days in length just for chart display purposes
          const paddedDate1 = moment(PLCSeries[i].data[j].plcDate).add(7, 'days').format('MM/DD/YYYY');
          PLCSeries[i].data[j].low = moment.utc(PLCSeries[i].data[j].plcDate).valueOf();
          PLCSeries[i].data[j].high = moment.utc(paddedDate1).valueOf();
          PLCSeries[i].data[j].dateFrom = moment(PLCSeries[i].data[j].plcDate).format('MM/DD/YYYY');
          PLCSeries[i].data[j].dateTo = moment(paddedDate1).format('MM/DD/YYYY');
        } else {
          for (let k = i - 1; k >= 0; k--) {
            if (PLCSeries[k].data.some(p => p.projectName === PLCSeries[i].data[j].projectName)) {
              const prevPLC = PLCSeries[k].data.find(p => p.projectName === PLCSeries[i].data[j].projectName);
              // if the current PLC date is equal to the previous PLC date, add some padding for visual purposes
              if (PLCSeries[i].data[j].plcDate === prevPLC.plcDate) {
                const paddedDate2 = moment(prevPLC.high).add(7, 'days').format('MM/DD/YYYY');
                PLCSeries[i].data[j].low = moment.utc(prevPLC.high).valueOf();
                PLCSeries[i].data[j].high = moment.utc(paddedDate2).valueOf();
                PLCSeries[i].data[j].dateFrom = moment(prevPLC.high).format('MM/DD/YYYY');
                PLCSeries[i].data[j].dateTo = moment(paddedDate2).format('MM/DD/YYYY');
              } else {
                PLCSeries[i].data[j].low = moment.utc(prevPLC.high).valueOf();
                PLCSeries[i].data[j].high = moment.utc(PLCSeries[i].data[j].plcDate).valueOf();
                PLCSeries[i].data[j].dateFrom = moment(prevPLC.high).format('MM/DD/YYYY');
                PLCSeries[i].data[j].dateTo = moment(PLCSeries[i].data[j].plcDate).format('MM/DD/YYYY');
              }
              break;
            }
          }
        }
        PLCSeries[i].data[j].x = projectList.indexOf(PLCSeries[i].data[j].projectName);
      }
    }

    // Sort by SHP dates and redistribute arrays for highchart formats
    // projectScheduleData.sort(function(a, b) {return a[2] > b[2] ? 1 : -1; });

    let minPLC = 10000000000000;
    let maxPLC = 0;
    for (let i = 0; i < PLCSeries[0].data.length; i++) {
      // get min and max CON and SHP values
      if (PLCSeries[0].data[i].low < minPLC) {
        minPLC = PLCSeries[0].data[i].low;
      }
    }

    for (let i = 0; i < PLCSeries[PLCSeries.length - 1].data.length; i++) {
      // get min and max CON and SHP values
      if (PLCSeries[PLCSeries.length - 1].data[i].high > maxPLC) {
        maxPLC = PLCSeries[PLCSeries.length - 1].data[i].high;
      }
    }

    // dynamically adjust the height of the chart by scaling with the number of projects returned
    if (projectList.length >= 8) {
      this.schedulesChartHeight = projectList.length / 8;
    } else {
      this.schedulesChartHeight = 1;
    }

    this.schedulesEarliestCONDate = moment.utc(minPLC).toISOString();
    this.schedulesLatestSHPDate = moment.utc(maxPLC).toISOString();
    this.schedulesProjectsList = projectList;
    this.schedulesList = PLCSeries;
    // console.log('minPLC', minPLC)
    // console.log('maxPLC', maxPLC)
    // console.log('this.schedulesProjectsList', this.schedulesProjectsList)
    // console.log('this.schedulesList', this.schedulesList)

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

    // console.log('this.ssTotalFTEAfterSHP', this.ssTotalFTEAfterSHP)
    // console.log('this.ssTotalFTENoPLC', this.ssTotalFTENoPLC)

  }

  getTopFTEProjects() {
    const topFTEProjectsArray = _.sortBy(this.advancedFilteredResults, function(project) { return project['TotalProjectFTE']; });
    this.topFTEProjects = topFTEProjectsArray.reverse().slice(0, 5);
    console.log('this.topFTEProjects', this.topFTEProjects)
  }

}
