import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CacheService } from '../../_shared/services/cache.service';
import { ApiDataProjectService } from '../../_shared/services/api-data/_index';

@Component({
  selector: 'app-display-project',
  templateUrl: './display-project.component.html',
  styleUrls: ['./display-project.component.css', '../../_shared/styles/common.css']
})
export class DisplayProjectComponent implements OnInit {

  project: any;
  projectID: number;
  showSpinner: boolean;
  showPage: boolean;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private cacheService: CacheService,
    private apiDataProjectService: ApiDataProjectService
  ) {

    // get the project id from the route params
    this.projectID = activatedRoute.snapshot.params['id'];

  }

  ngOnInit() {

    console.log('project id from the router (url');
    console.log(`project id: ${this.projectID}`);

    console.log('all projects from the cache service');
    console.log(this.cacheService.projects);


    if (this.cacheService.project) {

      this.project = this.cacheService.project;
      this.showPage = true;
      console.log('clicked project from the cache service');
      console.log(this.project);

    } else {

      this.apiDataProjectService.getProject(this.projectID)
      .subscribe(
        res => {
          this.project = res[0];
          this.showPage = true;
          console.log('retrieved project from the api');
          console.log(this.project);
        },
        err => {
          // hide the spinner
          this.showSpinner = false;
        }
      );

    }

  }

}
