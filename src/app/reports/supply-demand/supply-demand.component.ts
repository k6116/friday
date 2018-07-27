import { Component, OnInit, OnDestroy } from '@angular/core';
import { ApiDataAnalyticsService } from '../../_shared/services/api-data/_index';
import { Subscription } from 'rxjs/Subscription';

import * as Highcharts from 'highcharts';

declare var require: any;
const moment = require('moment');
// require('highcharts/modules/annotations')(Highcharts);

@Component({
  selector: 'app-supply-demand',
  templateUrl: './supply-demand.component.html',
  styleUrls: ['./supply-demand.component.css', '../../_shared/styles/common.css']
})
export class SupplyDemandComponent implements OnInit, OnDestroy {

  displaySupplyDemandList: boolean;  // display boolean for top FTE table
  projectParentChildList: any;
  supplyDemandProjectList: any; // for top FTE projects table
  supplyDemandDatesList: any;
  supplyDemandList: any;
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
  supplyData:  any; // for populating historic FTE data to plot in chart
  demandData: any;

  // subscriptions for api calls
  subscription1: Subscription;
  subscription2: Subscription;
  subscription3: Subscription;
  subscription4: Subscription;


  constructor(
    private apiDataAnalyticsService: ApiDataAnalyticsService
  ) { }

  ngOnInit() {
    // Set display flags to false
    this.displaySupplyDemandList = true;
    this.displayProjectEmployeeList = false;

    // Retrieve Supply Demand List
    this.subscription1 = this.apiDataAnalyticsService.getNCIProjectsParentChildList()
    .subscribe(
      res => {
        console.log('Project Parent Child List Data: ', res);
        this.projectParentChildList = res;
      },
      err => {
        console.log(err);
      }
    );

    this.subscription2 = this.apiDataAnalyticsService.getNCISupplyDemandDatesList()
    .subscribe(
      res => {
        console.log('Date List Data: ', res);
        this.supplyDemandDatesList = res;
      },
      err => {
        console.log(err);
      }
    );

    this.subscription3 = this.apiDataAnalyticsService.getNCISupplyDemandProjectList()
    .subscribe(
      res => {
        console.log('Project List Data: ', res);
        this.supplyDemandProjectList = res;
      },
      err => {
        console.log(err);
      }
    );

  }

  ngOnDestroy() {
    if (this.subscription1) {
      this.subscription1.unsubscribe();
    }
    if (this.subscription2) {
      this.subscription2.unsubscribe();
    }
    if (this.subscription3) {
      this.subscription3.unsubscribe();
    }
    if (this.subscription4) {
      this.subscription4.unsubscribe();
    }
  }

  onProjectClick(project: any) {
    this.selectedProject = project;
    this.supplyData = undefined;
    this.demandData = undefined;

    // Retrieve Supply Demand List
    this.subscription4 = this.apiDataAnalyticsService.getNCISupplyDemand(project.NCIProjectName)
    .subscribe(
      res => {
        this.supplyDemandList = res[0].Details;
        // initialize an array row state, whether the project is displayed in the chart or not
        // this.isProjectSelected = new Array(this.supplyDemandList.length).fill(false);
        console.log('Supply Demand List Data: ', this.supplyDemandList);

        // Convert table to array for HighChart data series format
        // also, convert fiscal date from js datetime to unix (ms) timestamp for proper plotting in highcharts
        const supplyQty = Object.keys(this.supplyDemandList)
        .map(i => new Array(moment(this.supplyDemandList[i].SupplyDemandDate).valueOf(), this.supplyDemandList[i].SupplyQty));

        const demandQty = Object.keys(this.supplyDemandList)
        .map(i => new Array(moment(this.supplyDemandList[i].SupplyDemandDate).valueOf(), this.supplyDemandList[i].DemandQty));

        this.supplyData = ({
          name: 'Supply',
          data: supplyQty
        });
        this.demandData = ({
          name: 'Demand',
          data: demandQty
        });
        console.log('supply qty', supplyQty);

        this.plotFteHistoryChart();
      },
      err => {
        console.log(err);
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
      title: {text: `Supply Demand ${this.selectedProject.NCIProjectName}`},
      subtitle: { text: 'Time Period: All historic data'},
      xAxis: {
        type: 'datetime'
      },
      yAxis:  {
        title: {text: 'Supply'}
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
      },

      series: [{name: this.supplyData.name,
        data: this.supplyData.data}]
    };
    this.lineChart = Highcharts.chart('SupplyDemand', this.lineChartOptions);
    // loop through the historic FTE data object and plot each object as an independent series
    this.lineChart.addSeries({
      name: this.demandData.name,
      data: this.demandData.data
    });
  }
}

