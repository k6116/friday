import { Component, OnInit } from '@angular/core';
import { ApiDataService } from '../../_shared/services/api-data.service';

import * as Highcharts from 'highcharts';

@Component({
  selector: 'app-projects-reports',
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.css', '../../_shared/styles/common.css']
})
export class ProjectsReportsComponent implements OnInit {

    topFTEProjectList: any;
    totalMonthlyFTE: any;
    fiscalDate: any;
    selectedProject: any;
    displayTopFTEProjectList: boolean;

    constructor(
        private apiDataService: ApiDataService
    ) { }

    ngOnInit() {
        this.displayTopFTEProjectList = false;

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
                    this.fiscalDate = Object.keys(res)
                    .map(i => new Array(res[i].fiscalMonth + ' - ' + res[i].fiscalYear, res[i].totalMonthlyFTE));

                    console.log('fiscalDate', this.fiscalDate);
                    this.projectFTEHistoryChart();
                },
                err => {
                    console.log(err);
                }
        );
    }

    projectFTEHistoryChart() {

        Highcharts.chart('FTEHistory', {

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
                               console.log('x: ' + p.name + ', y: ' + p.y);
                            //    this.myComponentMethod(p.category,p.series.name);
                            }.bind(this)
                        }
                    }
                }
            },

            series: [{
            name: this.selectedProject.projectName,
            data: this.fiscalDate,
            }],

        });


    }

}
