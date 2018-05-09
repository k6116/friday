import { Component, OnInit, OnDestroy, HostBinding, Output, EventEmitter } from '@angular/core';
import { ApiDataService } from '../../_shared/services/api-data.service';
import { TopNavComponent } from '../../navs/top-nav/top-nav.component';
import { User } from '../../_shared/models/user.model';
import { AuthService } from '../../auth/auth.service';

declare var $: any;

@Component({
    selector: 'app-profile-modal',
    templateUrl: './profile-modal.component.html',
    styleUrls: ['./profile-modal.component.css']
  })

  export class ProfileModalComponent implements OnInit {

    userName: any;
    jobTitleName: string;
    jobTitles: any;
    jobTitleSubs: any;
    jobTitleID: any;
    loggedInUser: any;

    @Output() parent = new EventEmitter<boolean>();

    constructor(
        private apiDataService: ApiDataService,
        private authService: AuthService,
    ) {}

    ngOnInit() {
      this.authService.getLoggedInUser((user, err) => {
        if (err) {
          return;
        }
        this.loggedInUser = user;
        this.jobTitleID = this.loggedInUser.jobTitleID;
        this.getJobTitleList();
        this.getJobTitleSubList();
      });

    }

    abc() {
      console.log('listened');
      this.parent.emit(true);
    }

    getJobTitleList() {
      // this.userName = this.authService.loggedInUser ? this.authService.loggedInUser.fullName : null;
      this.userName = this.loggedInUser.fullName;
      this.apiDataService.getJobTitleList()
        .subscribe(
          res => {
            console.log('JobTitleList:');
            console.log(res);
            this.jobTitles = res;
            for (let i = 0; i < this.jobTitles.length; i++) {
              if (this.jobTitles[i].id === this.jobTitleID) {
                 this.jobTitleName = this.jobTitles[i].jobTitleName;
              }
            }
            console.log('My Job Title: ' + this.jobTitleName);
          },
          err => {
            console.log(err);
          }
        );
    }

    selectChangeHandler (event: any) {
      this.jobTitleName = event.target.value;
      for (let i = 0; i < this.jobTitles.length; i++) {
        if (this.jobTitles[i].jobTitleName === this.jobTitleName) {
           this.jobTitleID = this.jobTitles[i].id;
        }
      }
      console.log('My New Job Title: ' + this.jobTitleName + ', ' + this.jobTitleID);

      this.getJobTitleSubList();
    }

    getJobTitleSubList() {
      this.apiDataService.getJobTitleSubList(this.jobTitleID)
        .subscribe(
          res => {
            console.log('JobTitleSubList:');
            this.jobTitleSubs = res;
            // this.jobTitleSub = this.jobTitles[i].jobTitleName;
            console.log(res);
          },
          err => {
            console.log(err);
          }
        );
    }

  }
