import { Component, OnInit, ViewChildren, Input, EventEmitter, Output} from '@angular/core';
import { ApiDataService } from '../../_shared/services/api-data.service';
import { FormGroup, FormArray, FormControl, Validators, FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-job-titles',
  templateUrl: './job-titles.component.html',
  styleUrls: ['./job-titles.component.css', '../../_shared/styles/common.css']
})
export class JobTitlesComponent implements OnInit {
  jobTitleList: any;
  jobTitleSubList: any;
  numProjectsToDisplay: number;

  @Output() createSuccess = new EventEmitter<boolean>();

  constructor(
    private formBuilder: FormBuilder,
    private apiDataService: ApiDataService,
  ) {}

  ngOnInit() {
    console.log('Admin Job-Titles worked on INIT!');
    this.numProjectsToDisplay = 100;
    this.getJobTitleList();
              // Load the appropriate list of subtitles
          // setTimeout(() => {
          //   this.getJobTitleSubList(id);
          // }, 0);
  }

  getJobTitleList() {
    this.apiDataService.getJobTitleList()
      .subscribe(
        res => {
          console.log('JobTitleList:', res);
          this.jobTitleList = res;
        },
        err => {
          console.log(err);
        }
      );
  }

  getJobTitleSubList(id: number, list: any) {
    console.log(list);
    for (let i = 0; i < this.jobTitleList.length; i++) {
      if (this.jobTitleList[i].id === id) {
        this.jobTitleSubList = this.jobTitleList[i].jobTitleJunction.jobTitleSubs;
     }
    }

    console.log('JobTitleSubList:', this.jobTitleSubList);
  }

  onCreateJobTitleClick(jobTitleName: string, description: any) {
    const newJobTitle = [
      {jobTitleName: jobTitleName,
       description: description}
      ];
    console.log('New Job Title: ', newJobTitle);

    this.apiDataService.insertJobTitle(newJobTitle[0])
    .subscribe(
      res => {
        // this.deleteSuccess.emit(true);
        // this.createSuccess.emit(true);
        console.log('Job Title Added!');
      },
      err => {
        console.log(err);
      }
    );
  }

}
