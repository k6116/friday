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
  jobSubTitleList: any;
  jobSubTitleListMap: any;
  numJobTitlesToDisplay: number;
  numJobSubTitlesToDisplay: number;
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
    this.getJobSubTitleList();
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

  getJobSubTitleList() {
    this.apiDataJobTitleService.getJobSubTitleList()
    .subscribe(
      res => {
        console.log('getJobSubTitleList:', res);
        this.jobSubTitleList = res;
        this.numJobTitlesToDisplay = this.jobTitleList.length;
      },
      err => {
        console.log(err);
      }
    );
  }

  getJobSubTitleListMap(id: number, list: any) {
    console.log('List: ', list);
    this.jobTitleID = id;
    this.jobSubTitleListMap = [
      {id: this.jobSubTitleList.id},
      {jobSubTitleName: this.jobSubTitleList.jobSubTitleName},
      {description: this.jobSubTitleList.description},
      {checked: false}];
    for (let i = 0; i < this.jobTitleList.length; i++) {
      if (this.jobTitleList[i].id === id) {
        this.jobSubTitleListMap[i].checked = true;
        // this.jobSubTitleListMap = this.jobTitleList[i].jobTitleMap.jobSubTitles;
        this.numJobSubTitlesToDisplay = this.jobSubTitleListMap.length;
     }
    }
    console.log('jobSubTitleListMap:', this.jobSubTitleListMap);
  }

}
