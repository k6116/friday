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

    // TO-DO: Why doesn't setTimeout work for asynchronys issue on init?
    // setTimeout(() => {
      // this.resetProjectTypeList();
    // }, 0);

    // this.projectTypeID = 1;
  }

  resetProjectTypeList() {
    for (let i = 0; i < this.projectTypesList.length; i++) {
      this.projectTypesList[i].checkboxState = true;
    }
    console.log('Updated projectTypesList:', this.projectTypesList);
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
        console.log('projectTypesList:', this.projectTypesList);
        // TO-DO: This should only be on init
        this.resetProjectTypeList();
      },
      err => {
        console.log(err);
      }
    );
  }

  onCheckboxChange(index: number) {
    // update checkbox state in projectTypesList
    const checked = this.projectTypesList[index].checkboxState;
    this.projectTypesList[index].checkboxState = !checked;
  }

}
