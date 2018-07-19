import { Component, OnInit } from '@angular/core';
import { ApiDataSchedulesService } from '../../_shared/services/api-data/_index';

@Component({
  selector: 'app-projects',
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.css', '../../_shared/styles/common.css']
})
export class ProjectsSetupsComponent implements OnInit {

  projectSchedulesList: any;
  searchProjects: string; // fuzzy-search string
  project: any;

  // all the flags
  init: boolean;
  showProjectCard;

  constructor(
    private apiDataSchedulesService: ApiDataSchedulesService,
  ) { }

  ngOnInit() {
    this.init = false;
    this.showProjectCard = false;
    this.getSchedules();
  }

  getSchedules() {
    this.apiDataSchedulesService.getSchedules()
    .subscribe(
      res => {
        this.projectSchedulesList = res;
        console.log('schedulesList:', this.projectSchedulesList);
      },
      err => {
        console.log(err);
      }
    );
  }

  onProjectClick(project: any) {
    this.project = project;
    this.showProjectCard = true;
    console.log(project);
  }

}
