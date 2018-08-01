import { Component, OnInit } from '@angular/core';
import { ApiDataAnalyticsService } from '../../_shared/services/api-data/_index';
import { AuthService } from '../../_shared/services/auth.service';
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
export class SupplyDemandComponent implements OnInit {

  displaySupplyDemandList: boolean;  // display boolean for top FTE table
  projectParentChildList: any;
  supplyDemandProjectList: any; // for top FTE projects table
  supplyDemandDatesList: any;
  supplyDemandList: any;
  supplyDemandPartList: any;
  supplyLotList: any;
  supplyLotExclusionList: any;
  selectedProjectChildList: any;
  strPartList: string;
  isProjectSelected: any; // for toggling projects when clicking the top FTE table

  projectEmployeeData: any; // for rendering project roster (TO BE OBSOLETED)
  projectEmployeeSubscription: Subscription;
  selectedProject: any; // old method for displaying project roster onClick in chart (TO BE OBSOLETED)
  selectedFiscalDate: string; // old method for displaying project roster onClick in chart (TO BE OBSOLETED)
  displaySupplyDemandDetails: boolean;  // display boolean for project roster (TO BE OBSOLETED)

  // chart-related variables
  chartIsLoading = true;
  lineChart: any;
  lineChartOptions: any;  // for setting chart options
  supplyData:  any; // for populating historic FTE data to plot in chart
  demandData: any;


  constructor(
    private apiDataAnalyticsService: ApiDataAnalyticsService,
    private authService: AuthService,
  ) { }

  ngOnInit() {
    // Set display flags to false
    this.displaySupplyDemandList = true;
    this.displaySupplyDemandDetails = false;

    // Retrieve Supply Demand List
    this.apiDataAnalyticsService.getNCIProjectsParentChildList()
    .subscribe(
      res => {
        console.log('Project Parent Child List Data: ', res);
        this.projectParentChildList = res;
      },
      err => {
        console.log(err);
      }
    );

    this.apiDataAnalyticsService.getNCISupplyDemandDatesList()
    .subscribe(
      res => {
        console.log('Date List Data: ', res);
        this.supplyDemandDatesList = res;
      },
      err => {
        console.log(err);
      }
    );

    this.apiDataAnalyticsService.getNCISupplyDemandProjectList()
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

  onProjectClick(project: any) {
    this.selectedProject = project;
    this.supplyData = undefined;
    this.demandData = undefined;
    this.supplyLotList = undefined;
    this.supplyLotExclusionList = undefined;
    this.selectedProjectChildList = undefined;

    // Retrieve Supply Demand List
    this.apiDataAnalyticsService.getNCISupplyDemand(project.NCIProjectName)
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

    // Get the child parts for the NCI Project
    this.apiDataAnalyticsService.getNCISupplyDemandPartList(project.NCIProjectName)
    .subscribe(
      res1 => {
        console.log('Part List', res1);
        this.supplyDemandPartList = res1;

        if (this.supplyDemandPartList.length) {
          // Generate the string for the controller function sql where clause
          this.strPartList = '';
          for (let i = 0; i < this.supplyDemandPartList.length; i++) {
            this.strPartList = this.strPartList + '\',\'' + this.supplyDemandPartList[i].NCIPartName;
          }
          this.strPartList = this.strPartList.substring(2);
          this.strPartList = this.strPartList + '\'';

          // Get the supply lots list for the child part
          this.apiDataAnalyticsService.getNCISupplyLotList(this.strPartList)
          .subscribe(
            res2 => {
              console.log('Lot List', res2);
              this.supplyLotList = res2;
            },
            err => {
              console.log(err);
            }
          );

          // Need the full list of children for an NCI Project to search if they exist in the exlusion list
          this.selectedProjectChildList = '';
          for (let i = 0; i < this.projectParentChildList.length; i++) {
            if (this.projectParentChildList[i].ProjectName === project.NCIProjectName) {
              if (this.projectParentChildList[i].Childs.length) {
                for (let j = 0; j < this.projectParentChildList[i].Childs.length; j++) {
                  this.selectedProjectChildList = this.selectedProjectChildList + '\',\''
                    + this.projectParentChildList[i].Childs[j].ChildPartName;
                }
              }
            }
          }
          this.selectedProjectChildList = this.selectedProjectChildList.substring(2);
          this.selectedProjectChildList = this.selectedProjectChildList + '\'';

          // Get the lot exclusion list
          this.apiDataAnalyticsService.getNCISupplyLotExclusionList(this.selectedProjectChildList)
          .subscribe(
            res3 => {
              console.log('Lot Exclusion List', res3);
              this.supplyLotExclusionList = res3;
            },
            err => {
              console.log(err);
            }
          );
        }
      },
      err => {
        console.log(err);
      }
    );

  }

  // function for getting the project roster onClick in the plot.  (TO BE OBSOLETED)
  getSupplyDemandDetailsList(supplyDemandDate: string) {
    this.displaySupplyDemandDetails = true;
    // find specific data for indicated supply demand date
    for (let i = 0; i < this.supplyDemandList.length; i++) {
      // console.log(this.supplyDemandList[i].SupplyDemandDate);
      if (this.supplyDemandList[i].SupplyDemandDate === supplyDemandDate) {
        if (this.supplyDemandList[i].SupplyOrDemand === 'Supply') {
          console.log('Supply: ' + this.supplyDemandList[i].SupplyQty);
          console.log('Fab: ' + this.supplyDemandList[i].LotListFab);
          console.log('ICTest: ' + this.supplyDemandList[i].LotListICTest);
          console.log('DieFab: ' + this.supplyDemandList[i].LotListDieFab);
          console.log('Storage: ' + this.supplyDemandList[i].LotListStorage);
        } else {
          console.log('Demand ' + this.supplyDemandList[i].DemandQty);
        }
      }
    }

  }

  onLotIncludedClick(partData: any) {
    // On click, add lot to exclusion list
    this.apiDataAnalyticsService.insertLotExclusion(partData, this.authService.loggedInUser.id)
    .subscribe(
      res => {
        console.log('Added to Lot Excluded List');
        this.onProjectClick(this.selectedProject);
      },
      err => {
        console.log(err);
      }
    );
  }

  onLotExcludedClick(partData: any) {
    // On click, remove lot to exclusion list
    this.apiDataAnalyticsService.deleteLotExclusion(partData, this.authService.loggedInUser.id)
    .subscribe(
      res => {
        console.log('Removed from Lot Excluded List');
        this.onProjectClick(this.selectedProject);
      },
      err => {
        console.log(err);
      }
    );
  }

  onExecClick() {
    // On click, execute stored procedure to update supply demand tables
    this.apiDataAnalyticsService.execUpdateSupplyDemand()
    .subscribe(
      res => {
        console.log('Updated Suply Demand Tables');
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
                let supplyDemandDate = moment(p.x).toISOString();
                supplyDemandDate = moment(supplyDemandDate).format('YYYY-MM-DD');
                this.getSupplyDemandDetailsList(supplyDemandDate);
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

