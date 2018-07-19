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

  constructor(
    private apiDataSchedulesService: ApiDataSchedulesService,
  ) { }

  ngOnInit() {
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

}
