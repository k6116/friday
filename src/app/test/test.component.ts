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

completedCycles: number;

public lineChartData: Array<any> = [{data: [0], label: 'Worker A'}];
public lineChartLabels: Array<any> = [1];

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

  public lineChartOptions: any = {
    responsive: true,
    pan: {
      enabled: true,
      mode: 'x'
  },
  zoom: {
      enabled: true,
      mode: 'x',
      limits: {
          max: 100,
          min: 10
      }
  }

  };


public lineChartLegend: true;
public lineChartType: string = 'line';


showData(): void {
// i = rows of data
// j = individual data elements

  const _lineChartData: Array<any> = new Array(1);

   _lineChartData[0] = {data: new Array(this.cycles), label: this.lineChartData[0].label};

    for (let j = 0; j < _lineChartData[0].data.length; j++) {
       this.lineChartLabels[j] = 'C' + j.toString();
      _lineChartData[0].data[j] = this.threadACycle[j];

    }

  this.lineChartData = _lineChartData;

  }

 public chartClicked(e: any): void {
    console.log(e);
  }

public chartHovered(e: any): void {
  console.log(e);
}

constructor ( private apiDataService: ApiDataService) {

}

  ngOnInit() {
        this.cycles = 100;
        this.threads = 1;
  }

  startTest() {

    this.threadACycle = new Array<any>();
    const timeBeforeLoop = performance.now();

    let i: number;
    for (i = 1; i <= this.cycles; i++) {
        this.performTest();
    }
    const timeAfterLoop = performance.now();
    const f = moment.utc(timeAfterLoop - timeBeforeLoop).format('SSSS');
    const v = +f; // convert to integer
    console.log(`Completed Cycles in ${v} milliseconds`);
    this.completedCycles = v;

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
  }

  stopTest() {
    this.threadACycle = new Array<any>();
    this.threadBCycle = new Array<any>();

    this.lineChartData = [{data: [0], label: 'Worker A'}];
    let label = new Array<any>();
    label = [1];

    const labelsLength = this.lineChartLabels.length;
    for (let p = 0; p < labelsLength; p++) {
      this.lineChartLabels.pop();
    }

   // this.lineChartLabels =  label;
  }

}
