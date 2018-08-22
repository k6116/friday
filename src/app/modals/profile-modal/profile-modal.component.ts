import { Component, OnInit, OnDestroy, HostBinding, Output, EventEmitter } from '@angular/core';
import { ApiDataJobTitleService } from '../../_shared/services/api-data/_index';
import { AuthService } from '../../_shared/services/auth.service';
import { CacheService } from '../../_shared/services/cache.service';

@Component({
  selector: 'app-profile-modal',
  templateUrl: './profile-modal.component.html',
  styleUrls: ['./profile-modal.component.css', '../../_shared/styles/common.css']
})

export class ProfileModalComponent implements OnInit {

  modal: any;
  userName: any;
  loggedInUser: any;
  jobTitles: any;
  jobTitleIndex: any;
  jobTitleID: any;
  jobTitleName: any;
  jobSubTitleList: any;
  jobSubTitleID: any;
  jobSubTitleName: any;
  newJobTitleData: any;
  newJobTitleID: number;
  subTitleEmpty: boolean;

  constructor(
    private apiDataJobTitleService: ApiDataJobTitleService,
    private authService: AuthService,
  ) {}

  ngOnInit() {
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
    this.apiDataJobTitleService.getJobTitleList()
      .subscribe(
        // pulls JobTitleID, JobTitleName and  all subtitles from Jarvis Employees table
        res => {
          // console.log('JobTitleList:', res);
          this.jobTitles = res;
          // Loop through res and find matching name to jobTitleID
          for (let i = 0; i < this.jobTitles.length; i++) {
            if (this.jobTitles[i].id === this.jobTitleID) {
              this.jobTitleName = this.jobTitles[i].jobTitleName;
              this.jobTitleIndex = i;
              // console.log('My Job Title: ' + this.jobTitleName);
            }
          }
          // Load the appropriate list of subtitles
          this.getJobSubTitleList();
        },
        err => {
          // console.log(err);
        }
      );
  }

  getJobSubTitleList() {

    if (this.jobTitleIndex) {
      this.jobSubTitleList = this.jobTitles[this.jobTitleIndex].jobSubTitles;
      // console.log('JobSubTitleList:', this.jobSubTitleList);
    }

    // loop through jobSubTitlelist to get jobSubTitleName
    if (this.jobSubTitleID !== null && this.jobSubTitleList) {
      for (let i = 0; i < this.jobSubTitleList.length; i++) {
        if (this.jobSubTitleList[i].id === this.jobSubTitleID) {
            this.jobSubTitleName = this.jobSubTitleList[i].jobSubTitleName;
        }
      }
    }

    // Disable the subtitle option if there's no subtitles
    if (this.jobSubTitleList === undefined) {
      this.subTitleEmpty = true;
    } else {
      this.subTitleEmpty = false;
    }
  }

  selectJobTitleChangeHandler (event: any) {
    // get updated jobtitle from combobox with event.target.value
    this.jobTitleName = event.target.value;
    // console.log('Job Title Changed to:', this.jobTitleName);
    // find id to jobTitleName => REPLACED WITH FIND
    for (let i = 0; i < this.jobTitles.length; i++) {
      if (this.jobTitles[i].jobTitleName === this.jobTitleName) {
        this.jobTitleID = this.jobTitles[i].id;
        //  save index for getJobSubTitleList
        this.jobTitleIndex = i;
      }
    }
    // reset this.jobSubTitleID
    this.jobSubTitleID = null;
    // Load the appropriate list of subtitles
    this.getJobSubTitleList();
  }

  selectJobSubTitleChangeHandler (event: any) {
    // get current subtitle name whenever combobox value changes
    this.jobSubTitleName = event.target.value;

    // find subtitleID to subtitleName.
    for (let i = 0; i < this.jobSubTitleList.length; i++) {
      if (this.jobSubTitleList[i].jobSubTitleName === this.jobSubTitleName) {
          this.jobSubTitleID = this.jobSubTitleList[i].id;
      }
    }
    // console.log('My New Job Sutitle: ' + this.jobSubTitleName + ', ' + this.jobSubTitleID);
  }

  onUpdateButtonClick() {
    // create json with new job titles to send to server
    this.newJobTitleData = {'newJobTitleID': this.jobTitleID, 'newJobSubTitleID': this.jobSubTitleID};

    // write new values to database
    this.apiDataJobTitleService.updateEmployeeJobTitle(this.newJobTitleData)
      .subscribe(
        res => {
          // console.log(res);
          this.newJobTitleID = this.jobTitleID;
          // TEMP CODE: update the loggedInUser object with the saved jobTitleID and jobSubTitleID
          // this should be refactored to get a new token first, and also get the job title and subtitle names in the token payload so
          // don't have to retrive job title data and 'map'
          this.authService.loggedInUser.jobTitleID = this.jobTitleID;
          this.authService.loggedInUser.jobSubTitleID = this.jobSubTitleID;
        },
        err => {
          // console.log(err);
        }
      );
  }

}
