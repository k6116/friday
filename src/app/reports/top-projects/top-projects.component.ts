import { Component, OnInit } from '@angular/core';
import { ApiDataService } from '../../_shared/services/api-data.service';

import * as Highcharts from 'highcharts';

declare var require: any;
const moment = require('moment');
require('highcharts/modules/annotations')(Highcharts);

@Component({
  selector: 'app-reports-topprojects',
  templateUrl: './top-projects.component.html',
  styleUrls: ['./top-projects.component.css', '../../_shared/styles/common.css']
})
export class TopProjectsReportsComponent implements OnInit {

  topFTEProjectList: any;
  projectEmployeeData: any;
  totalMonthlyFTE: any;
  fiscalDate: any;
  selectedProject: any;
  selectedFiscalDate: string;
  // selectedFiscalMonth: any;
  // selectedFiscalYear: any;
  displayTopFTEProjectList: boolean;
  displayProjectEmployeeList: boolean;
  options: any;

  // chart infrastructure vars
  chartIsLoading = false;
  timePeriods = [
    {period: 'current-quarter', text: 'Current Quarter'},
    {period: 'current-fy', text: 'Current Fiscal Year'},
    {period: 'all-time', text: 'All Time'}
  ];

  constructor(
    private apiDataService: ApiDataService
  ) { }

  ngOnInit() {
    // Set display flags to false
    this.displayTopFTEProjectList = false;
    this.displayProjectEmployeeList = false;

    // Retrieve Top FTE Project List
    this.apiDataService.getTopFTEProjectList()
    .subscribe(
      res => {
        console.log('Top FTE Project List Data: ', res);
        this.topFTEProjectList = res;
        this.displayTopFTEProjectList = true;
      },
      err => {
        console.log(err);
      }
    );
  }

  onProjectClick(project: any) {
    this.selectedProject = project;
    // Retrieve historical FTE data for a given project
    this.apiDataService.getProjectFTEHistory(this.selectedProject.projectID)
    .subscribe(
      res => {
        console.log('Project FTE History Data: ', res);
        // Convert table to array for HighChart data series format
        // also, convert fiscal date from js datetime to unix (ms) timestamp for proper plotting in highcharts
        this.fiscalDate = Object.keys(res)
        .map(i => new Array(moment(res[i].fiscalDate).valueOf(), res[i].totalMonthlyFTE));

        console.log('fiscalDate', this.fiscalDate);
        this.projectFTEHistoryChart();
      },
      err => {
        console.log(err);
      }
    );
  }

  getProjectEmployeeFTEList(projectID: number, fiscalDate: string) {
    this.displayProjectEmployeeList = true;
    // Retrieve all employee FTE logs for a given project
    this.apiDataService.getProjectEmployeeFTEList(projectID, fiscalDate)
    .subscribe(
      res => {
        // console.log('Project FTE Employee Data: ', res);
        this.projectEmployeeData = res;
      },
      err => {
        console.log(err);
      }
    );
  }

  projectFTEHistoryChart() {
    this.options = {
      title: {text: `${this.selectedProject.projectName} FTE History`},
      subtitle: { text: 'Time Period: All historic data'},
      xAxis: {
        type: 'datetime'
      },
      yAxis:  {
        title: {text: 'FTEs Allocated'}
      },
      // legend: {
      //   layout: 'vertical',
      //   align: 'right',
      //   verticalAlign: 'middle'
      // },
      plotOptions: {
        series: {
          turboThreshold: 3000,
          cursor: 'pointer',
          point: {
            events: {
              click: function(e) {
                const p = e.point;
                this.selectedFiscalDate = moment(p.x).toISOString();
                this.getProjectEmployeeFTEList(this.selectedProject.projectID, this.selectedFiscalDate);
              }.bind(this)
            }
          }
        }
      },
      series: [{
        name: this.selectedProject.projectName,
        data: this.fiscalDate,
      }],
      // annotations: [{
      //   labels: [{
      //     point: {
      //       xAxis: 0,
      //       yAxis: 0,
      //       x: 1,
      //       y: 1
      //     },
      //     text: 'Arbois'
      //   }]
      // }]
    };
    Highcharts.chart('FTEHistory', this.options);
  }

}
