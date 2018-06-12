import { Component, OnInit, OnDestroy, HostBinding, Output, EventEmitter } from '@angular/core';
import { ApiDataService } from '../../_shared/services/api-data.service';
import { TopNavComponent } from '../../navs/top-nav/top-nav.component';
import { User } from '../../_shared/models/user.model';
import { AuthService } from '../../auth/auth.service';

@Component({
    selector: 'app-profile-modal',
    templateUrl: './profile-modal.component.html',
    styleUrls: ['./profile-modal.component.css']
})

  export class ProfileModalComponent implements OnInit {

    userName: any;
    loggedInUser: any;
    jobTitles: any;
    jobTitleIndex: any;
    jobTitleID: any;
    jobTitleName: any;
    jobTitleSubList: any;
    jobTitleSubID: any;
    jobTitleSubName: any;
    editToggle: boolean;
    newJobTitleData: any;
    newJobTitleID: number;

    constructor(
        private apiDataService: ApiDataService,
        private authService: AuthService,
    ) {}

    ngOnInit() {

      console.log('profile modal has been initialized');

      this.editToggle = false;
      this.getUserProfile();
    }

    getUserProfile() {
      // this.authService.getLoggedInUser((user, err) => {
      //   if (err) {
      //     return;
      //   }
      //   this.loggedInUser = user;
      //   this.userName = this.loggedInUser.fullName;

      //   // Must be assigned here so on profile modal popup the most recent values show up in the comboboxes
      //   this.jobTitleID = this.loggedInUser.jobTitleID;
      //   this.jobTitleSubID = this.loggedInUser.jobTitleSubID;
      // });

      this.loggedInUser = this.authService.loggedInUser;
      this.userName = this.loggedInUser.fullName;

      // Must be assigned here so on profile modal popup the most recent values show up in the comboboxes
      this.jobTitleID = this.loggedInUser.jobTitleID;
      this.jobTitleSubID = this.loggedInUser.jobTitleSubID;

    }

    // will be called on profile button click in top-nav
    getJobTitleList() {
      this.apiDataService.getJobTitleList()
        .subscribe(
          // pulls JobTitleID, JobTitleName and  all subtitles from Jarvis Employees table
          res => {
            console.log('JobTitleList:', res);
            this.jobTitles = res;
            // Loop through res and find matching name to jobTitleID
            for (let i = 0; i < this.jobTitles.length; i++) {
              if (this.jobTitles[i].id === this.jobTitleID) {
                 this.jobTitleName = this.jobTitles[i].jobTitleName;
                 this.jobTitleIndex = i;
                 console.log('My Job Title: ' + this.jobTitleName);
              }
            }
            // Load the appropriate list of subtitles
            this.getJobTitleSubList();

          },
          err => {
            console.log(err);
          }
        );
    }

    selectJobTitleChangeHandler (event: any) {
      // get current jobtitle combobox value
      this.jobTitleName = event.target.value;

      // find id to jobTitleName
      for (let i = 0; i < this.jobTitles.length; i++) {
        if (this.jobTitles[i].jobTitleName === this.jobTitleName) {
          this.jobTitleID = this.jobTitles[i].id;

          //  save index so that subtitle combobox shows the appropriate subtitle list
          this.jobTitleIndex = i;
        }
      }
      // Load the appropriate list of subtitles
      this.getJobTitleSubList();
    }

    getJobTitleSubList() {
      this.jobTitleSubList = this.jobTitles[this.jobTitleIndex].jobTitleJunction.jobTitleSubs;
      console.log('JobTitleSubList:', this.jobTitleSubList);

      // loop through sublist to get matching name to ID
      for (let i = 0; i < this.jobTitleSubList.length; i++) {
        if (this.jobTitleSubList[i].id === this.jobTitleSubID) {
           this.jobTitleSubName = this.jobTitleSubList[i].jobTitleSubName;
        }
      }
      console.log('My Job Subtitle: ' + this.jobTitleSubName);
    }

    selectJobTitleSubChangeHandler (event: any) {
      // get current subtitle whenever combobox value changes
      this.jobTitleSubName = event.target.value;

      // find subtitle ID to subtitle name. It will be used when saving values to the database
      for (let i = 0; i < this.jobTitleSubList.length; i++) {
        if (this.jobTitleSubList[i].jobTitleSubName === this.jobTitleSubName) {
           this.jobTitleSubID = this.jobTitleSubList[i].id;
        }
      }
      console.log('My New Job Sutitle: ' + this.jobTitleSubName + ', ' + this.jobTitleSubID);
    }

    onUpdateButtonClick() {
      // create json with new job titles to send to server
      this.newJobTitleData = {'newJobTitleID': this.jobTitleID, 'newJobTitleSubID': this.jobTitleSubID};
      this.editToggle = !this.editToggle;

      // write new values to database
      this.apiDataService.updateProfile(this.loggedInUser.id, this.newJobTitleData)
        .subscribe(
          res => {
            console.log(res);
            this.newJobTitleID = this.jobTitleID;
          },
          err => {
            console.log(err);
          }
        );
    }

    onEditButtonClick() {
      this.editToggle = !this.editToggle;
    }

  }
