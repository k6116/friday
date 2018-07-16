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
  projectTypeID: number;

  // temporary:
  showTable: boolean;
  filterItems: any;

  constructor(
    private apiDataProjectService: ApiDataProjectService,
  ) { }

  ngOnInit() {
    this.getProjects();
    this.getProjectTypesList();
    this.projectTypeID = 1;
    // this.filterItems = [
    //   {
    //     value: 'val1',
    //     checked: false
    //   },
    //   {
    //     value: 'val2',
    //     checked: false
    //   },
    //   {
    //     value: 'val3',
    //     checked: false
    //   },
    // ];
  }

  getProjects() {
    this.apiDataProjectService.getProjects()
    .subscribe(
      res => {
        this.projectList = res;
        console.log('ProjectList:', this.projectList);
        this.showTable = true;
      },
      err => {
        console.log('get project data error:', err);
      }
    );
  }

  getProjectTypesList() {
    this.apiDataProjectService.getProjectTypesList()
    .subscribe(
      res => {
        this.projectTypesList = res;
        for (let i = 0; i < this.projectTypesList.length; i++) {
          // this.projectTypesList[i].checked = false;
        }

        console.log('Project Types:', this.projectTypesList);
      },
      err => {
        console.log(err);
      }
    );
  }

  onCheckboxChange(id: number) {
    this.projectTypeID = id;
    console.log(this.projectTypeID);
  }

  // checked() {
  //   return this.filterItems.filter(item => item.checked);
  // }

}
