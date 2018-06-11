import { Component, OnInit, OnDestroy } from '@angular/core';
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
export class TopProjectsReportsComponent implements OnInit, OnDestroy {

  topFTEProjectList: any;
  projectEmployeeData: any;
  historicFteData = [];
  selectedProject: any;
  selectedFiscalDate: string;
  // selectedFiscalMonth: any;
  // selectedFiscalYear: any;
  displayTopFTEProjectList: boolean;
  displayProjectEmployeeList: boolean;
  options: any;

  isProjectSelected: any;
  // chart infrastructure vars
  chartIsLoading = true;
  lineChart: any;

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
        this.chartIsLoading = false;
        // initialize an array row state, whether the project is displayed in the chart or not
        this.isProjectSelected = new Array(this.topFTEProjectList.length).fill(false);
      },
      err => {
        console.log(err);
      }
    );
  }

  ngOnDestroy() {
    if (this.lineChart) {
      this.lineChart.destroy();
    }
  }

  onProjectClick(project: any, index: number) {
    this.selectedProject = project;

    // if project is being deselected, deselect the row, remove the project data, and re-render the chart
    if (this.isProjectSelected[index]) {
      this.isProjectSelected[index] = false;
      // remove the project data
      this.historicFteData.forEach( proj => {
        if (proj.projectIndex === index) {
          this.historicFteData.splice(this.historicFteData.indexOf(proj), 1);
        }
      });
      this.plotFteHistoryChart();
    } else {
      // Retrieve historical FTE data for a given project
      this.apiDataService.getProjectFTEHistory(this.selectedProject.projectID)
      .subscribe(
        res => {
          // highlight selected row
          this.isProjectSelected[index] = true;
          // Convert table to array for HighChart data series format
          // also, convert fiscal date from js datetime to unix (ms) timestamp for proper plotting in highcharts
          const fiscalDate = Object.keys(res)
          .map(i => new Array(moment(res[i].fiscalDate).valueOf(), res[i].totalMonthlyFTE));

          this.historicFteData.push({
            projectIndex: index,
            projectName: project.projectName,
            data: fiscalDate
          });
          console.log('fiscalDate', fiscalDate);
          console.log(this.historicFteData);
          this.plotFteHistoryChart();
        },
        err => {
          console.log(err);
        }
      );
    }
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

  plotFteHistoryChart() {
    if (this.lineChart) {
      this.lineChart.destroy();
    }
    this.options = {
      title: {text: `Top Projects FTE History`},
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
      tooltip: {
        crosshairs: true,
        shared: true
      },
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
      }
    };
    this.lineChart = Highcharts.chart('FTEHistory', this.options);
    this.historicFteData.forEach( project => {
      this.lineChart.addSeries({
        name: project.projectName,
        data: project.data
      });
    });
  }

}
