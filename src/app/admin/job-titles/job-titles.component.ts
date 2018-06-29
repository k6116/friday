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

  getJobSubTitleListMap(id: number) {
    this.jobTitleID = id;
    let index: number;
    // Find index of jobtitle to use in subtitles loop
    // TO-DO CHAI: Can I get this from the the html?
    for (let i = 0; i < this.jobTitleList.length; i++) {
      if (this.jobTitleList[i].id === id) {
        index = i;
        break;
      }
    }
    // loop through jobSubTitleList and match up with the subtitles in the map by adding check: true or false
    const jobSubTitleMapLength = this.jobTitleList[index].jobTitleMap.jobSubTitles.length;
    if (jobSubTitleMapLength !== 0) {
      for (let k = 0; k < this.jobSubTitleList.length; k++) {
        for (let j = 0; j < jobSubTitleMapLength; j++) {
          if (this.jobSubTitleList[k].id === this.jobTitleList[index].jobTitleMap.jobSubTitles[j].id) {
            this.jobSubTitleList[k].checked = true;
            break;
            // console.log('YES' + k, this.jobSubTitleList[k].jobSubTitleName);
          } else {
            this.jobSubTitleList[k].checked = false;
            // console.log('NO', this.jobSubTitleList[k].jobSubTitleName);
          }
        }
      }
    } else {
      // check everything to zero to overwrite previous list
      for (let k = 0; k < this.jobSubTitleList.length; k++) {
        this.jobSubTitleList[k].checked = false;
      }
    }
    console.log('INDEX: ', index);
    console.log('jobTitleList:', this.jobTitleList);
    console.log('jobSubTitleList', this.jobSubTitleList);
  }
}
