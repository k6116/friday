import { Component, OnInit, ViewChild, ElementRef} from '@angular/core';
import { ApiDataJobTitleService } from '../../_shared/services/api-data/_index';
import { TitleCasePipe } from '@angular/common';
import { FormControl, FormGroup, Validators, FormBuilder, AbstractControl } from '@angular/forms';
// import { JobTitleInterface } from './job-title-interface';

@Component({
  selector: 'app-job-titles',
  templateUrl: './job-titles.component.html',
  styleUrls: ['./job-titles.component.css', '../../_shared/styles/common.css']
})

export class JobTitlesComponent implements OnInit {
  jobTitleList: any;
  jobTitleSubList: any;
  jobTitleSubListJunction: any;
  numJobTitlesToDisplay: number;
  numJobTitleSubsToDisplay: number;
  jobTitleID: number;
  name: string;
  modalTitle: string;
  filteredTitle: string;
  jobTtitleExists: boolean;
  description: any;
  tagMap: any;

  constructor(
    private apiDataJobTitleService: ApiDataJobTitleService,
    private titlecasePipe: TitleCasePipe,
    private formBuilder: FormBuilder,
  ) {}

  ngOnInit() {
    this.getJobTitleList();
    this.getJobTitleSubList();
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

  getJobTitleSubList() {
    this.apiDataJobTitleService.getJobTitleSubList()
    .subscribe(
      res => {
        console.log('getJobTitleSubList:', res);
        this.jobTitleSubList = res;
        this.numJobTitlesToDisplay = this.jobTitleList.length;
      },
      err => {
        console.log(err);
      }
    );
  }

  getJobTitleSubListJunction(id: number, list: any) {
    console.log(list);
    this.jobTitleID = id;
    for (let i = 0; i < this.jobTitleList.length; i++) {
      if (this.jobTitleList[i].id === id) {
        this.jobTitleSubListJunction = this.jobTitleList[i].jobTitleJunction.jobTitleSubs;
        this.numJobTitleSubsToDisplay = this.jobTitleSubListJunction.length;
     }
    }
    console.log('JobTitleSubList:', this.jobTitleSubListJunction);
  }

}
