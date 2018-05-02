import { Component, OnInit, OnDestroy } from '@angular/core';
import { ApiDataService } from '../../_shared/services/api-data.service';

declare var $: any;

@Component({
    selector: 'app-profile-modal',
    templateUrl: './profile-modal.component.html',
    styleUrls: ['./profile-modal.component.css']
  })

  export class ProfileModalComponent implements OnInit {

    constructor(
        private apiDataService: ApiDataService
    ) { }

    ngOnInit() {
        console.log('PROFILE WORKS');
        this.getJobTitle();
    }

    getJobTitle() {

        this.apiDataService.getJobTitle()
          .subscribe(
            res => {
              console.log(res);
              console.log('PROFILE WORKS');
            },
            err => {
              console.log(err);
            }
          );
      }

  }
