import { Component, OnInit, ViewChild, ElementRef} from '@angular/core';
import { ApiDataService } from '../../_shared/services/api-data.service';
import { TitleCasePipe } from '@angular/common';
import { FormControl, FormGroup, Validators, FormBuilder } from '@angular/forms';
import { JobTitleInterface } from './job-title-interface';

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
  modalTitle: string;
  filteredTitle: string;
  // filterString: string;
  // filterStringSub: string;
  jobTtitleExists: boolean;
  // showCreateJobTitleModal: boolean;

  // Try Formbuilder
  titles: FormGroup;

  constructor(
    // private formBuilder: FormBuilder,
    private apiDataService: ApiDataService,
    private titlecasePipe: TitleCasePipe,
    private formBuilder: FormBuilder,
  ) {}

  ngOnInit() {
    // this.showCreateJobTitleModal = false;
    this.titles = this.formBuilder.group({
      name: [null],
      description: ['']
    });

    this.getJobTitleList();
  }

  getJobTitleList() {
    this.apiDataService.getJobTitleList()
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

  onCreateButtonClick(buttonName: string, filterString: string) {
    // In order to re-use the same modal for JobTitle and JobSubtitle
    this.modalTitle = buttonName;

    // populate filterString to CreateJobTitle Modal
    this.titles.controls['name'].patchValue(filterString);

    // Don't remember what this is...
    // this.filteredTitle = filterString;

    console.log(this.modalTitle);
    console.log(this.titles);
  }

  onCreateJobTitleClick(jobTitleName: string, description: any) {
    jobTitleName = this.titlecasePipe.transform(jobTitleName);

    let hasMatch = false;
    for (let i = 0; i < this.jobTitleList.length; i++) {
      const jobTitle = this.jobTitleList[i];

      if (jobTitle.jobTitleName === jobTitleName) {
        hasMatch = true;
        console.log('There is a match');
        event.preventDefault();
        this.jobTtitleExists = true;
        break;

      } else {
        console.log('There is no match');
        this.jobTtitleExists = false;
      }
    }
  }

  onDeleteJobTitleClick() {
    const jobTitleData = [{jobTitleID: this.jobTitleID}];

    this.apiDataService.deletejobTitle(jobTitleData[0])
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

  onSubmit({ value, valid }: { value: JobTitleInterface, valid: boolean }) {
    console.log(value, valid);
  }

}
