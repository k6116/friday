import { Component, OnInit } from '@angular/core';
import { ApiDataService } from '../../_shared/services/api-data.service';

import * as Highcharts from 'highcharts';

declare var require: any;
require('highcharts/modules/annotations')(Highcharts);

@Component({
  selector: 'app-my-fte-summary',
  templateUrl: './my-fte-summary.component.html',
  styleUrls: ['./my-fte-summary.component.css', '../../_shared/styles/common.css']
})
export class MyFteSummaryComponent implements OnInit {

  constructor(private apiDataService: ApiDataService) { }

  ngOnInit() {
  }

}
