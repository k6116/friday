import { Component, OnInit } from '@angular/core';
import { ApiDataSchedulesService, ApiDataPartService, ApiDataProjectService,
  ApiDataEmployeeService } from '../../_shared/services/api-data/_index';
import * as moment from 'moment';

@Component({
  selector: 'app-parts',
  templateUrl: './parts.component.html',
  styleUrls: ['./parts.component.css']
})


export class PartSetupComponent implements OnInit {

  searchParts: string;
  partList: any;
  part: any;
  schedule: any;
  showPartCard: boolean;
  partTypeChoices: any;
  designerChoices: any;
  plannerChoices: any;
  buildStatusChoices: any;

  constructor(
    private apiDataSchedulesService: ApiDataSchedulesService,
    private apiDataPartService: ApiDataPartService,
    private apiDataProjectService: ApiDataProjectService,
    private apiDataEmployeeService: ApiDataEmployeeService
  ) { }

  ngOnInit() {

    this.showPartCard = false;
    this.getParts();
    this.getSelectionChoices();
  }

  getParts() {
    this.apiDataPartService.getParts()
    .subscribe(
      res => {
        console.log('Parts List:', this.partList);
        this.partList = res;
      },
      err => {
        console.log(err);
      }
    );
  }

  getSelectionChoices() {

    this.apiDataPartService.getPartTypes()
    .subscribe(
      res => {
        console.log('Part Types:', res);
        this.partTypeChoices = res;
      },
      err => {
        console.log(err);
      }
    );

    this.apiDataEmployeeService.getDesigners()
    .subscribe(
      res => {
        console.log('Designers:', res);
        this.designerChoices = res;
      },
      err => {
        console.log(err);
      }
    );

    this.apiDataEmployeeService.getPlanners()
    .subscribe(
      res => {
        console.log('Planners:', res);
        this.plannerChoices = res;
      },
      err => {
        console.log(err);
      }
    );

    this.apiDataProjectService.getBuildStatus().subscribe(
      res => {
        console.log('Build Status:', res);
        this.buildStatusChoices = res;
      },
      err => {
        console.log(err);
      });
  }

  getSchedule() {
    this.apiDataSchedulesService.getPartSchedule(this.part.PartID)
    .subscribe(
      res => {
        this.schedule = res;
        console.log('Part Schedule:', this.schedule);
      },
      err => {
        console.log(err);
      }
    );
  }

  onPartClick(part: any) {
    this.part = part;
    this.showPartCard = true;
    console.log(part);

    this.getSchedule();
  }

  onSearchInputChange(event: any) {
    if (this.searchParts.length === 0) {
      this.showPartCard = false;
    }
  }
}
