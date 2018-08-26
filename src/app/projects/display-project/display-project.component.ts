import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

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
    private activatedRoute: ActivatedRoute
  ) {

    // get the project id from the route params
    this.projectID = activatedRoute.snapshot.params['id'];

  }

  ngOnInit() {

    this.showPage = true;
    console.log(`project id: ${this.projectID}`);


  }

}
