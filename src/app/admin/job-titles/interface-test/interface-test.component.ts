import { Component, OnInit, ViewChild, ElementRef} from '@angular/core';
import { ApiDataJobTitleService } from '../../../_shared/services/api-data/_index';
import { TitleCasePipe } from '@angular/common';
import { FormControl, FormGroup, Validators, FormBuilder, AbstractControl } from '@angular/forms';
// import { JobTitleInterface } from './job-title-interface';


export interface Titles {
  name: string;
  description: string;
}

@Component({
  selector: 'app-job-titles',
  templateUrl: './job-titles.component.html',
  styleUrls: ['./job-titles.component.css', '../../_shared/styles/common.css']
})

export class JobTitlesComponent implements OnInit {
  jobTitleList: any;
  jobTitleSubList: any;
  numJobTitlesToDisplay: number;
  numJobTitleSubsToDisplay: number;
  jobTitleID: number;
  name: string;
  modalTitle: string;
  filteredTitle: string;
  jobTtitleExists: boolean;
  description: any;
  tagMap: any;
  // FormBuilder
  titles: FormGroup;

  constructor(
    private apiDataJobTitleService: ApiDataJobTitleService,
    private titlecasePipe: TitleCasePipe,
    private formBuilder: FormBuilder,
  ) {}

  ngOnInit() {
    // Initialize FormBuilder
    this.titles = this.formBuilder.group({
      name: ['', [Validators.required]],
      description: ['']
    });

    this.getJobTitleList();

  }

  getJobTitleList() {
    this.apiDataJobTitleService.getJobTitleList()
      .subscribe(
        res => {
          console.log('JobTitleList:', res);
          this.jobTitleList = res;
          this.numJobTitlesToDisplay = this.jobTitleList.length;
        },
        err => {
          console.log(err);
        }
      );
  }

  getJobTitleSubList(id: number, list: any) {
    console.log(list);
    this.jobTitleID = id;
    for (let i = 0; i < this.jobTitleList.length; i++) {
      if (this.jobTitleList[i].id === id) {
        this.jobTitleSubList = this.jobTitleList[i].jobTitleJunction.jobTitleSubs;
        this.numJobTitleSubsToDisplay = this.jobTitleSubList.length;
     }
    }

    console.log('JobTitleSubList:', this.jobTitleSubList);
  }

  // Create Button on the main site
  onCreateButtonClick(buttonName: string, filterString: string) {
    // In order to re-use the same modal for JobTitle and JobSubtitle
    this.modalTitle = buttonName;

    // populate filterString to CreateJobTitle Modal
    this.titles.controls['name'].patchValue(filterString);

    console.log(this.modalTitle);
    console.log(this.titles);
  }

  onDeleteJobTitleClick() {
    const jobTitleData = [{jobTitleID: this.jobTitleID}];

    this.apiDataJobTitleService.deleteJobTitle(jobTitleData[0])
    .subscribe(
      res => {
        console.log('Job title has been deleted');
        this.getJobTitleList();
        // this.deleteSuccess.emit(true);
        // this.onDeleteSuccess();
      },
      err => {
        console.log(err);
      }
    );
  }

  onSubmit({ value, valid }: { value: Titles, valid: boolean }) {
    console.log(value, valid);
  }

  onModalOKClick() {
    this.name = this.titlecasePipe.transform(this.titles.controls['name'].value);
    this.description = this.titles.controls['description'].value;

    // Check for duplicates
    // JobTitle
    switch (this.modalTitle) {
      case 'Job Title':
        for (let i = 0; i < this.jobTitleList.length; i++) {
          const jobTitle = this.jobTitleList[i];

          if (jobTitle.jobTitleName === this.name) {
            console.log('There is a match.');
            this.jobTtitleExists = true;
            break;
          } else {
            this.jobTtitleExists = false;
            console.log('There is no match.');
            this.insertJobTitle();
          }
        }
        break;
      // Job Subtitle
      case 'Job Subtitle':
      console.log('CASE Job Subtitle', this.jobTitleSubList);
        for (let i = 0; i <= this.jobTitleSubList.length; i++) {
          const jobTitle = this.jobTitleSubList[i];

          if (jobTitle.jobSubTitleName === this.name) {
            console.log('There is a match.');
            this.jobTtitleExists = true;
            return { jobTtitleExists: true };
            // break;

          } else {
            this.jobTtitleExists = false;
            console.log('There is no match for: ', this.name);
            this.insertJobTitleSub();
            // return null;
          }
        }
        break;
    }
  }

  insertJobTitle() {
    // set the form data that will be sent in the body of the request
    // const newJobTitle = this.titles.getRawValue();
    const newJobTitle = ({jobTitleName: this.name, description: this.description});
    console.log(newJobTitle);
    this.apiDataJobTitleService.insertJobTitle(newJobTitle)
    .subscribe(
      res => {
        console.log(res);
        // this.createSuccess.emit(true);
      },
      err => {
        console.log(err);
      }
    );
  }

  insertJobTitleSub() {
    // set the form data that will be sent in the body of the request
    // const newJobTitle = this.titles.getRawValue();
    const newJobTitle = ({jobSubTitleName: this.name, description: this.description});
    console.log('newJobTitle: ', newJobTitle);
    // this.apiDataService.insertJobTitleSub(newJobTitle)
    // .subscribe(
    //   res => {
    //     console.log(res);
    //     // this.createSuccess.emit(true);
    //   },
    //   err => {
    //     console.log(err);
    //   }
    // );
  }

  // Creating a Map of Keys DOESN'T WORK
  // keyMap() {
  // let i = null;
  // for (i = 0; this.jobTitleList.length > i; i++) {
  //   this.tagMap[this.jobTitleList[i].jobTitleName] = this.jobTitleList[i];
  // }
  // }

  // hasName() {
  //   return this.tagMap[this.titles.controls['name'].value];
  // }

}
