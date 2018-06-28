import { Component, OnInit, OnDestroy, HostBinding, Output, EventEmitter } from '@angular/core';
import { ApiDataJobTitleService } from '../../_shared/services/api-data/_index';
import { AuthService } from '../../_shared/services/auth.service';

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
    jobSubTitleList: any;
    jobSubTitleID: any;
    jobSubTitleName: any;
    editToggle: boolean;
    newJobTitleData: any;
    newJobTitleID: number;
    subTitleEmpty: boolean;

    constructor(
        private apiDataJobTitleService: ApiDataJobTitleService,
        private authService: AuthService,
    ) {}

    ngOnInit() {
      this.editToggle = false;
      this.getUserProfile();
    }

    getUserProfile() {

      this.loggedInUser = this.authService.loggedInUser;
      this.userName = this.loggedInUser.fullName;

      // Must be assigned here so on profile modal popup the most recent values show up in the comboboxes
      this.jobTitleID = this.loggedInUser.jobTitleID;
      this.jobSubTitleID = this.loggedInUser.jobSubTitleID;
    }

    // called on profile button click on top-nav
    getJobTitleList() {
      this.editToggle = false;
      this.apiDataJobTitleService.getJobTitleList()
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
            this.getJobSubTitleList();

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
      this.getJobSubTitleList();
    }

    getJobSubTitleList() {
      this.jobSubTitleList = this.jobTitles[this.jobTitleIndex].jobTitleMap.jobSubTitles;
      console.log('JobSubTitleList:', this.jobSubTitleList);

      // loop through sublist to get matching name to ID
      for (let i = 0; i < this.jobSubTitleList.length; i++) {
        if (this.jobSubTitleList[i].id === this.jobSubTitleID) {
           this.jobSubTitleName = this.jobSubTitleList[i].jobSubTitleName;
        }
      }
      console.log('My Job Subtitle: ' + this.jobSubTitleName);

      // Disable the subtitle option if there's no subtitles
      if (this.jobSubTitleList.length === 0) {
        this.subTitleEmpty = true;
      } else {
        this.subTitleEmpty = false;
      }
    }

    selectJobSubTitleChangeHandler (event: any) {
      // get current subtitle whenever combobox value changes
      this.jobSubTitleName = event.target.value;

      // find subtitle ID to subtitle name. It will be used when saving values to the database
      for (let i = 0; i < this.jobSubTitleList.length; i++) {
        if (this.jobSubTitleList[i].jobSubTitleName === this.jobSubTitleName) {
           this.jobSubTitleID = this.jobSubTitleList[i].id;
        }
      }
      console.log('My New Job Sutitle: ' + this.jobSubTitleName + ', ' + this.jobSubTitleID);
    }

    onUpdateButtonClick() {
      // create json with new job titles to send to server
      this.newJobTitleData = {'newJobTitleID': this.jobTitleID, 'newJobSubTitleID': this.jobSubTitleID};
      this.editToggle = !this.editToggle;

      // write new values to database
      this.apiDataJobTitleService.updateJobTitle(this.loggedInUser.id, this.newJobTitleData)
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
