import { Component, OnInit } from '@angular/core';
import { ApiDataService } from '../_shared/services/api-data.service';
import * as moment from 'moment';

@Component({
  selector: 'app-test',
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.css']
})
export class TestComponent implements OnInit {

cycles: number;
threads: number;

threadACycle: Array<any>;
threadBCycle: Array<any>;

public lineChartData: Array<any> = [
  {data: [10, 20, 10, 30, 10, 20, 190, 10, 20, 190], label: `Avg Spread`}
 // {data: [30, 10, 20, 30, 10, 30, 90, 10, 20, 190], label: 'Avg Spread B'}
];

public lineChartLabels: Array<any> = ['C1', 'C2', 'C3', 'C4', 'C5',
'C6', 'C7', 'C8', 'C9', 'C10'];

public lineChartOptions: any = {
  responsive: true
};
public lineChartColors: Array<any> = [
  { // grey
    backgroundColor: 'rgba(148,159,177,0.2)',
    borderColor: 'rgba(148,159,177,1)',
    pointBackgroundColor: 'rgba(148,159,177,1)',
    pointBorderColor: '#fff',
    pointHoverBackgroundColor: '#fff',
    pointHoverBorderColor: 'rgba(148,159,177,0.8)'
  },
  { // dark grey
    backgroundColor: 'rgba(77,83,96,0.2)',
    borderColor: 'rgba(77,83,96,1)',
    pointBackgroundColor: 'rgba(77,83,96,1)',
    pointBorderColor: '#fff',
    pointHoverBackgroundColor: '#fff',
    pointHoverBorderColor: 'rgba(77,83,96,1)'
  }
];
public lineChartLegend: boolean = true;
public lineChartType: string = 'line';

public randomize(): void {
  let _lineChartData: Array<any> = new Array(this.lineChartData.length);
  for (let i = 0; i < this.lineChartData.length; i++) {
    _lineChartData[i] = {data: new Array(this.lineChartData[i].data.length), label: this.lineChartData[i].label};
    for (let j = 0; j < this.lineChartData[i].data.length; j++) {
      _lineChartData[i].data[j] = Math.floor((Math.random() * 100) + 1);
    }
  }
  this.lineChartData = _lineChartData;
}

showData(): void {

  let _lineChartData: Array<any> = new Array(this.cycles);
  for (let i = 0; i < this.cycles; i++) {
    _lineChartData[i] = {data: new Array(0), label: 'data'};

    for (let j = 0; j < this.lineChartData[i].data.length; j++) {
     if (i === 0) { _lineChartData[i].data[j] = this.threadACycle[j]; } // first thread
    // if (i === 1) { _lineChartData[i].data[j] = this.threadBCycle[j]; } // second thread
    }
  }
  this.lineChartData = _lineChartData;

}

// events
public chartClicked(e: any): void {
  console.log(e);
}

public chartHovered(e: any): void {
  console.log(e);
}

constructor ( private apiDataService: ApiDataService) {

}

  ngOnInit() {
this.cycles = 10;
this.threads = 4;
  }

  startTest() {
    this.threadACycle = new Array<any>();
    this.threadBCycle = new Array<any>();

    let i: number;
    for (i = 1; i <= this.cycles; i++) {
        this.performTest();
    }

    this.showData();
  }


  performTest() {

    const t0 = performance.now();

    this.apiDataService.getProjects()
    .subscribe(
      res => {

      },
      err => {
        console.log('get project data error:');
        console.log(err);
      }
    );

    const t1 = performance.now();
    const f = moment.utc(t1 - t0).format('SSSS');
    const v = +f; // convert to integer
    console.log(`retrieve projects took ${v} milliseconds`);
    this.threadACycle.push(v);
    this.threadBCycle.push(Math.floor((Math.random() * 100) + 1));

  }

  stopTest() {

  }


}
