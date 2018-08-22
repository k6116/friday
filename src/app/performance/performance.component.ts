import { Component, OnInit } from '@angular/core';
import { ApiDataProjectService } from '../_shared/services/api-data/_index';
import * as moment from 'moment';
import { BaseChartDirective } from 'ng2-charts';

@Component({
  selector: 'app-performance',
  templateUrl: './performance.component.html',
  styleUrls: ['./performance.component.css']
})
export class PerformanceComponent implements OnInit {

  cycles: number;
  threads: number;

  public singleCycleData: Array<any> = [{data: [], label: 'Individual Hits'}];
  public singleCycleLabels: Array<any> = new Array<any>();
  public completedCycles: number;
  public cycleChartData: Array<any> = [{data: [], label: 'Cycle Completions'}];
  public cycleChartLabels: Array<any> = new Array<any>();
  public startEnabled: boolean;


  public chartColors: Array<any> = [
    { // grey
      backgroundColor: 'rgba(163, 197, 255, .2)',
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

    public chartOptions: any = {
      responsive: true,
      pan: {
        enabled: true,
        mode: 'x'
    },
    zoom: {
        enabled: true,
        responsive: true,
        mode: 'x',
        sensitivity: 10,
    }

    };


  public chartLegend: true;
  public chartType = 'line';

  constructor ( private apiDataProjectService: ApiDataProjectService) {

  }

    ngOnInit() {
          this.cycles = 20;
          this.threads = 1;
          this.startEnabled = true;
    }

    getLatestCycleCompletion(): number {

      return  this.singleCycleData[0].data.reduce(this.getSum) / this.singleCycleData[0].data.length;
    }

    getSum(total, num) {
      return total + num;
    }

    spawnWorkerClick() {
      // const myWorker = new Worker('./worker.js');
      // myWorker.postMessage(2);
      // myWorker.onmessage = function(e) {

      //   // console.log('Message received from worker: ' + e.data);
      // };
    }

    startTest() {

      this.singleCycleLabels.length = 0; // one cycle set at a time for display
      this.singleCycleData[0].data.length = 0;


      for (let i = 1; i <= this.cycles; i++) {
        this.performTest(i);

      }
    }


   performTest(iteration: number) {

      const t0 = performance.now();

      this.apiDataProjectService.getProjects()
      .subscribe(
        res => {
          const t1 = performance.now();
          const tDiff = moment.utc(t1 - t0);

          // console.log(`retrieve projects took ${tDiff} milliseconds`);

          if (iteration % (this.cycles / 10) === 0) {
          this.singleCycleLabels.push('C' + iteration.toString());
          this.singleCycleData[0].data.push(tDiff);
          }

          if (iteration === this.cycles) {
            // console.log('length before reduction');
            // console.log(this.singleCycleData[0].data.length);
            const sum = this.singleCycleData[0].data.reduce(this.getSum) / this.singleCycleData[0].data.length;
            const sumAvg = Math.floor(sum);  // convert to integer
            // console.log(`full cycle took ${sumAvg} milliseconds`);

            this.cycleChartLabels.push('T' + (this.cycleChartLabels.length + 1).toString() + '(' + this.cycles.toString() + ')');
            this.cycleChartData[0].data.push(sumAvg);
            this.completedCycles = sumAvg;
            this.startEnabled = true;

          } else {
            this.startEnabled = false;
          }

       },
        err => {
          // console.log('get project data error:');
          // console.log(err);

        }
      );
    }

    resetTest() {

      this.singleCycleData[0].data.length = 0;
      this.singleCycleLabels.length = 0;

      this.cycleChartData[0].data.length = 0;
      this.cycleChartLabels.length = 0;

    }

    public chartClicked(e: any): void {
      // console.log(e);
    }


  }
