import { Component, OnInit } from '@angular/core';
import { ApiDataSchedulesService } from '../../_shared/services/api-data/_index';
import * as moment from 'moment';

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
        for (let i = 0; i < this.projectSchedulesList.length; i++) {
          for (let j = 0; j < this.projectSchedulesList[i].length; j++) {
            this.projectSchedulesList[i].schedules[j].plcDate = moment().format('YYYY-MM-DD');
          }
        }
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

  onSearchInputChange(event: any) {
    if (this.searchProjects.length === 0) {
      this.showProjectCard = false;
    }
  }

}
