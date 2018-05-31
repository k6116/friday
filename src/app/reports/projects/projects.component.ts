import { Component, OnInit } from '@angular/core';
import { ApiDataService } from '../../_shared/services/api-data.service';

import * as Highcharts from 'highcharts';

declare var require: any;
require('highcharts/modules/annotations')(Highcharts);

@Component({
  selector: 'app-projects-reports',
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.css', '../../_shared/styles/common.css']
})
export class ProjectsReportsComponent implements OnInit {

    topFTEProjectList: any;
    projectEmployeeData: any;
    totalMonthlyFTE: any;
    fiscalDate: any;
    selectedProject: any;
    selectedFiscalDate: any;
    selectedFiscalMonth: any;
    selectedFiscalYear: any;
    displayTopFTEProjectList: boolean;
    displayProjectEmployeeList: boolean;
    options: any;


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
                    // console.log('Top FTE Project List Data: ', res);
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

                    // Convert into an array of x,y coords for chart
                    // res = Object.keys(res)
                    // .filter(i => res[i].FiscalYear === 2016)
                    // .reduce((obj, i) => {
                    //     obj[i] = res[i]; return obj;
                    // }, {});

                    // Convert table to array for HighChart data series format
                    this.fiscalDate = Object.keys(res)
                    .map(i => new Array(res[i].fiscalDate, res[i].totalMonthlyFTE));

                    // console.log('fiscalDate', this.fiscalDate);
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

                title: {
                text: this.selectedProject.projectName
                },

                subtitle: {
                    text: 'FTE History'
                },

                xAxis: {
                    title: {
                        text: 'Month'
                    }
                },

                yAxis:  {
                    title: {
                        text: 'FTE'
                    }
                },

                legend: {
                    layout: 'vertical',
                    align: 'right',
                    verticalAlign: 'middle'
                },

                plotOptions: {
                    series: {
                        turboThreshold: 3000,
                        cursor: 'pointer',
                        point: {
                            events: {
                                click: function(e) {

                                    const p = e.point;
                                    // console.log('x: ' + p.name + ', y: ' + p.y);

                                    // convert chart date to separate month and year values
                                    this.selectedFiscalDate = p.name;
                                    const date = new Date(this.selectedFiscalDate);
                                    const locale = 'en-us';
                                    this.selectedFiscalMonth = date.toLocaleString(locale, {month: 'long'});
                                    this.selectedFiscalYear = date.getFullYear();

                                    this.getProjectEmployeeFTEList(this.selectedProject.projectID, p.name);

                                }.bind(this)
                            }
                        }
                    }
                },

                series: [{
                name: this.selectedProject.projectName,
                data: this.fiscalDate,
                }],

                annotations: [{
                    labels: [{
                        point: {
                            xAxis: 0,
                            yAxis: 0,
                            x: 1,
                            y: 1
                        },
                        text: 'Arbois'
                    }]
                }]

            };

        Highcharts.chart('FTEHistory', this.options);

    }

}
