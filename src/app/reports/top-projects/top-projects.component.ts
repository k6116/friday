import { Component, OnInit, OnDestroy } from '@angular/core';
import { ApiDataReportService } from '../../_shared/services/api-data/_index';
import { Subscription } from 'rxjs/Subscription';

import * as Highcharts from 'highcharts';

declare var require: any;
const moment = require('moment');

// require('highcharts/modules/annotations')(Highcharts);

@Component({
  selector: 'app-reports-topprojects',
  templateUrl: './top-projects.component.html',
  styleUrls: ['./top-projects.component.css', '../../_shared/styles/common.css']
})
export class TopProjectsReportsComponent implements OnInit, OnDestroy {

  displayTopFTEProjectList: boolean;  // display boolean for top FTE table
  topFTEProjectList: any; // for top FTE projects table
  topFteProjectSubscription: Subscription;
  isProjectSelected: any; // for toggling projects when clicking the top FTE table

  projectEmployeeData: any; // for rendering project roster (TO BE OBSOLETED)
  projectEmployeeSubscription: Subscription;
  selectedProject: any; // old method for displaying project roster onClick in chart (TO BE OBSOLETED)
  selectedFiscalDate: string; // old method for displaying project roster onClick in chart (TO BE OBSOLETED)
  displayProjectEmployeeList: boolean;  // display boolean for project roster (TO BE OBSOLETED)

  // chart-related variables
  chartIsLoading = true;
  lineChart: any;
  lineChartOptions: any;  // for setting chart options
  historicFteData = []; // for populating historic FTE data to plot in chart
  historicFteSubscription: Subscription;


  constructor(
    private apiDataReportService: ApiDataReportService
  ) { }

  ngOnInit() {
    // Set display flags to false
    this.displayTopFTEProjectList = false;
    this.displayProjectEmployeeList = false;

    // Retrieve Top FTE Project List
    this.topFteProjectSubscription = this.apiDataReportService.getTopFTEProjectList()
    .subscribe(
      res => {
        // console.log('Top FTE Project List Data: ', res);
        this.topFTEProjectList = res;
        this.displayTopFTEProjectList = true;
        this.chartIsLoading = false;
        // initialize an array row state, whether the project is displayed in the chart or not
        this.isProjectSelected = new Array(this.topFTEProjectList.length).fill(false);
      },
      err => {
        // console.log(err);
      }
    );
  }

  ngOnDestroy() {
    if (this.lineChart) {
      this.lineChart.destroy();
    }
    if (this.topFteProjectSubscription) {
      this.topFteProjectSubscription.unsubscribe();
    }
    if (this.projectEmployeeSubscription) {
      this.projectEmployeeSubscription.unsubscribe();
    }
    if (this.historicFteSubscription) {
      this.historicFteSubscription.unsubscribe();
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
      this.historicFteSubscription = this.apiDataReportService.getProjectFTEHistory(this.selectedProject.projectID)
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
          // console.log('fiscalDate', fiscalDate);
          // console.log(this.historicFteData);
          this.plotFteHistoryChart();
        },
        err => {
          // console.log(err);
        }
      );
    }
  }

  // function for getting the project roster onClick in the plot.  (TO BE OBSOLETED)
  getProjectEmployeeFTEList(projectID: number, fiscalDate: string) {
    this.displayProjectEmployeeList = true;
    // Retrieve all employee FTE logs for a given project
    this.projectEmployeeSubscription = this.apiDataReportService.getProjectEmployeeFTEList(projectID, fiscalDate)
    .subscribe(
      res => {
        // console.log('Project FTE Employee Data: ', res);
        this.projectEmployeeData = res;
      },
      err => {
        // console.log(err);
      }
    );
  }

  plotFteHistoryChart() {
    // if chart already exists, destroy it before re-drawing
    if (this.lineChart) {
      this.lineChart.destroy();
    }
    this.lineChartOptions = {
      credits: {
        text: 'jarvis.is.keysight.com',
        href: 'https://jarvis.is.keysight.com'
      },
      title: {text: `Top Projects FTE History`},
      subtitle: { text: 'Time Period: All historic data'},
      xAxis: {
        type: 'datetime'
      },
      yAxis:  {
        title: {text: 'FTEs Allocated'}
      },
      tooltip: {
        crosshairs: true,
        shared: true
      },
      plotOptions: {
        series: {
          turboThreshold: 3000,
          cursor: 'pointer',
          point: {
            events: { // TODO: change click event to show project-time event statistics instead of roster
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
    this.lineChart = Highcharts.chart('FTEHistory', this.lineChartOptions);
    // loop through the historic FTE data object and plot each object as an independent series
    this.historicFteData.forEach( project => {
      this.lineChart.addSeries({
        name: project.projectName,
        data: project.data
      });
    });
  }

}
