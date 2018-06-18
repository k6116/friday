import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css', '../_shared/styles/common.css']
})
export class AdminComponent implements OnInit {

  jobTitlesFlag: boolean;
  projectAttributesFlag: boolean;
  adminToggle: any;
  entries: any;
  selectedEntry;
  jobTitleName: string;

  userName: string;
  gender: string;

  constructor() {}

  ngOnInit() {
    // this.jobTitlesFlag = true;
    // this.projectAttributesFlag = false;
    // this.gender = form.controls['gender'].value;
  }

  getProjectAttributes() {
    // this.jobTitlesFlag = false;
    // this.projectAttributesFlag = true;
  }

  getJobTitles(gender: string) {
    console.log('GENDER IS:', gender);
    // this.jobTitlesFlag = true;
    // this.projectAttributesFlag = false;
  }

  onSelectionChange(entry) {
    // this.selectedEntry = entry;
  }

}
