import { Component, OnInit, OnDestroy } from '@angular/core';
import { ApiDataReportService, ApiDataProjectService } from '../../_shared/services/api-data/_index';
import { AuthService } from '../../_shared/services/auth.service';
import { Subscription } from 'rxjs/Subscription';
import * as Highcharts from 'highcharts';

declare var require: any;
declare const $: any;
const moment = require('moment');
require('highcharts/highcharts-more.js')(Highcharts); // requiring highcharts-more for bubble chart

@Component({
  selector: 'app-top-projects-bubble',
  templateUrl: './top-projects-bubble.component.html',
  styleUrls: ['./top-projects-bubble.component.css', '../../_shared/styles/common.css']
})
export class TopProjectsBubbleComponent implements OnInit, OnDestroy {

  fteDataSubscription: Subscription;  // for fetching summarized FTE data from db for bubble chart
  rosterDataSubscription: Subscription; // for fetching individual project team rosters from db

  chartIsLoading = true;
  bubbleChart: any;
  bubbleChartOptions: any;
  rawBubbleData: any;
  anchorBubbleData = [];
  flexBubbleData = [];
  otherBubbleData = [];

  projectRoster: any;
  displayRosterTable = false; // display boolean for displaying roster table

  constructor(
    private apiDataReportService: ApiDataReportService,
    private apiDataProjectService: ApiDataProjectService,
    private authService: AuthService
  ) { }

  ngOnInit() {
    this.getBubbleFteData();
  }

  ngOnDestroy() {
    if (this.fteDataSubscription) {
      this.fteDataSubscription.unsubscribe();
    }
    if (this.rosterDataSubscription) {
      this.rosterDataSubscription.unsubscribe();
    }
    if (this.bubbleChart) {
      this.bubbleChart.destroy();
    }
  }

  getBubbleFteData() {
    this.fteDataSubscription = this.apiDataReportService.getAggregatedFteData().subscribe( res => {
      this.rawBubbleData = res;

      this.rawBubbleData.forEach( project => {
        // compute project complexity score (mock right now)
        let score = 1;
        if (project.fiveYearRev) {
          score += Math.round(Math.log10(project.fiveYearRev));
        }
        if (project.PriorityName === 'Anchor') {
          score += 3;
        } else if (project.PriorityName === 'Flex') {
          score += 1;
        }
        const tempProj = {
          x: score,
          y: project.employeeCount,
          z: project.fteTotals,
          projectID: project.projectID,
          projectName: project.projectName
        };

        // push anchor and flex project priorities into separate data series
        if (project.PriorityName === 'Anchor') {
          this.anchorBubbleData.push(tempProj);
        } else if (project.PriorityName === 'Flex') {
          this.flexBubbleData.push(tempProj);
        } else {
          this.otherBubbleData.push(tempProj);
        }

      });

      this.plotBubbleFteData();
    });
  }

  plotBubbleFteData() {
    // slice off the 'View data table' and 'Open in Highcharts Cloud' menu options
    const highchartsButtons = Highcharts.getOptions().exporting.buttons.contextButton.menuItems.slice(0, 9);
    this.bubbleChartOptions = {
      credits: {
        text: 'jarvis.is.keysight.com',
        href: 'https://jarvis.is.keysight.com'
      },
      exporting: {
        buttons: {
          contextButton: {
            menuItems: highchartsButtons
          }
        }
      },
      chart: {
        type: 'bubble',
        plotBorderWidth: 1,
        zoomType: 'xy'
      },
      legend: {
        enabled: true
      },
      title: {
        text: 'Top Keysight projects by FTE, vs Employee Count and Complexity'
      },
      subtitle: {
        text: 'Time Period: All historic data'
      },
      xAxis: {
        gridLineWidth: 1,
        title: {text: 'Complexity Score (mock)'},
        labels: {format: '{value}'},
      },
      yAxis: {
        startOnTick: false,
        endOnTick: false,
        title: {text: 'Number of Employees'},
        labels: {format: '{value}'},
        maxPadding: 0.2,
      },
      tooltip: {
        useHTML: true,
        headerFormat: '<table>',
        pointFormat: '<tr><th colspan="2"><h3>{point.projectName}</h3></th></tr>' +
          '<tr><th>Complexity:</th><td>{point.x}</td></tr>' +
          '<tr><th># of Employees:</th><td>{point.y}</td></tr>' +
          '<tr><th># FTEs Allocated:</th><td>{point.z}</td></tr>',
        footerFormat: '</table>',
        followPointer: true
      },
      plotOptions: {
        series: {
          cursor: 'pointer',
          dataLabels: {
            enabled: true,
            format: '{point.projectName}'
          },
          point: {
            events: {
              click: function(e) {
                const p = e.point;
                this.displayRosterTable = false;
                this.showProjectRoster(p.projectID);
              }.bind(this)
            }
          }
        }
      },
      series: [{
        name: 'Anchor',
        data: this.anchorBubbleData,
        color: '#cc1111'
      }, {
        name: 'Flex',
        data: this.flexBubbleData,
        color: '#2222bb'
      }, {
        name: 'Other',
        data: this.otherBubbleData,
        color: '#8a8a8a'
      }]
    };
    this.bubbleChart = Highcharts.chart('bubble', this.bubbleChartOptions);
    this.chartIsLoading = false;
  }

  showProjectRoster(projectID: number) {
    this.rosterDataSubscription = this.apiDataProjectService.getProjectRoster(projectID).subscribe( res => {
      this.projectRoster = res[0].teamMembers;
      // console.log(this.projectRoster);
      this.displayRosterTable = true;
    });
  }
}
