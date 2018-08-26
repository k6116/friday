import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CacheService } from '../../_shared/services/cache.service';

@Component({
  selector: 'app-display-project',
  templateUrl: './display-project.component.html',
  styleUrls: ['./display-project.component.css', '../../_shared/styles/common.css']
})
export class DisplayProjectComponent implements OnInit {

  projectID: number;
  showSpinner: boolean;
  showPage: boolean;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private cacheService: CacheService
  ) {

    // get the project id from the route params
    this.projectID = activatedRoute.snapshot.params['id'];

  }

  ngOnInit() {

    this.showPage = true;
    console.log(`project id: ${this.projectID}`);

    console.log('all projects from the cache service');
    console.log(this.cacheService.projects);

    console.log('clicked project from the cache service');
    console.log(this.cacheService.project);


  }

}
