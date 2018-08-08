import { Component, OnInit } from '@angular/core';
import { ApiDataProjectService } from '../../_shared/services/api-data/_index';

@Component({
  selector: 'app-browse-projects',
  templateUrl: './browse-projects.component.html',
  styleUrls: ['./browse-projects.component.css', '../../_shared/styles/common.css']
})
export class BrowseProjectsComponent implements OnInit {

  projects: any;
  showPage: boolean;

  constructor(
    private apiDataProjectService: ApiDataProjectService
  ) { }

  ngOnInit() {

    // get all the projects
    this.apiDataProjectService.getProjects()
      .subscribe(
        res => {
          console.log('get projects successfull:');
          console.log(res);
          this.projects = res;
          // TEMP CODE: trim down the list of projects to a smaller number, for testing css
          this.trimProjects(10);
          // display the page
          this.showPage = true;
        },
        err => {
          console.log('get project data error:');
          console.log(err);
        }
    );

  }



  trimProjects(numProjects: number) {
    this.projects = this.projects.slice(0, numProjects);
  }

}
