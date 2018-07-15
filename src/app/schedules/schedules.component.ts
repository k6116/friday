import { Component, OnInit } from '@angular/core';
import { ApiDataProjectService } from '../_shared/services/api-data/_index';

@Component({
  selector: 'app-schedules',
  templateUrl: './schedules.component.html',
  styleUrls: ['./schedules.component.css', '../_shared/styles/common.css']
})
export class SchedulesComponent implements OnInit {

  projectList: any;
  projectTypesList: any;

  constructor(
    private apiDataProjectService: ApiDataProjectService,
  ) { }

  ngOnInit() {
    this.getProjects();
    this.getProjectTypesList();
  }

  getProjects() {
    this.apiDataProjectService.getProjects()
    .subscribe(
      res => {
        console.log('get project data successfull:');
        console.log(res);
        this.projectList = res;
        // this.trimProjects(500);
      },
      err => {
        console.log('get project data error:');
        console.log(err);
      }
    );
  }

  getProjectTypesList() {
    this.apiDataProjectService.getProjectTypesList()
    .subscribe(
      res => {
        // console.log(res);
        this.projectTypesList = res;
        console.log('Project Types:', this.projectTypesList);
      },
      err => {
        console.log(err);
      }
    );
  }

}
