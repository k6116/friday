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
require('highcharts/modules/drilldown.js')(Highcharts);
require('highcharts/modules/no-data-to-display.js')(Highcharts);
require('highcharts/highcharts-more.js')(Highcharts);
require('highcharts/modules/solid-gauge.js')(Highcharts);
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
  chartRoles: any;
  advancedFilteredResults: any;
  prioritiesCount: any;

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
      PLCStatusIDs: '',
      PLCDateRanges: '',
      ProjectName: '',
      ProjectTypeIDs: '',
      ProjectStatusIDs: '',
      ProjectPriorityIDs: '',
      ProjectOwnerEmails: '',
      FTEMin: 'NULL',
      FTEMax: 'NULL',
      FTEDateFrom: 'NULL',
      FTEDateTo: 'NULL'
    };

    await this.advancedFilter(filterOptions);
    this.renderRolesChart();
  }

  renderRolesChart() {
    const chartOptions = this.buildChartOptions();
    this.chartRoles = Highcharts.chart('rolesChart', chartOptions);
    setTimeout(() => {
      this.chartRoles.reflow();
    }, 0);
  }

  // take in the fte data and return the chart options for the stacked column chart
  // for the team ftes
  buildChartOptions() {

    // set the chart options
    const chartOptions = {
      chart: {
        type: 'column'
      },
      title: {
        text: 'Priorities'
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
          'name': 'Priorites',
          'colorByPoint': true,
          'data': this.prioritiesCount
        }
      ]
    };

    // return the chart options object
    return chartOptions;
  }

  async advancedFilter(filterOptions: any) {
    this.advancedFilteredResults = await this.apiDataAdvancedFilterService.getAdvancedFilteredResults(filterOptions).toPromise();
    // this.advancedFilteredResults = this.advancedFilteredResults.nested;
    console.log('this.advancedFilteredResults', this.advancedFilteredResults);
    this.getPriorities();
  }

  getPriorities() {
    const dataSeries = [];
    const prioritiesCountArray = _.countBy(this.advancedFilteredResults.nested, function(project) { return project.PriorityName; });
    Object.keys(prioritiesCountArray).forEach(function(key) {
      console.log(key, prioritiesCountArray[key]);
      dataSeries.push({
        name: key,
        y: prioritiesCountArray[key],
        drilldown: key
      });
    });
    this.prioritiesCount = dataSeries;
    console.log('this.prioritiesCount: ', this.prioritiesCount);

  }

}
