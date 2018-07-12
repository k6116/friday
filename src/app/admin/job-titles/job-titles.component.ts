import { Component, OnInit, ViewChild, ElementRef} from '@angular/core';
import { ApiDataJobTitleService } from '../../_shared/services/api-data/_index';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';

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
  jobSubTitleID: number;
  subTitlesInit: boolean;
  formTitles: FormGroup;

  // Forces Edit Modals to close after successfull update
  @ViewChild('closeBtn') closeBtn: ElementRef;

  constructor(
    private apiDataJobTitleService: ApiDataJobTitleService,
    private formBuilder: FormBuilder,
  ) {}

  ngOnInit() {
    this.subTitlesInit = true;
    this.getJobTitleList();
    this.getJobSubTitleList();

    // initiate Formgroup for jobTitle and jobSubTitle
    this.formTitles = this.formBuilder.group({
      id: [''],
      name: [''],
      description: ['']
    });
  }

  refresh() {
    this.subTitlesInit = true;
    this.getJobTitleList();
    this.getJobSubTitleList();

    // reset Formgroup for jobTitle and jobSubTitle
    this.formTitles = this.formBuilder.group({
      id: [''],
      name: [''],
      description: ['']
    });
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
        this.numJobSubTitlesToDisplay = this.jobSubTitleList.length;
      },
      err => {
        console.log(err);
      }
    );
  }

  getJobSubTitleListMap(id: number) {
    this.subTitlesInit = false;
    this.jobTitleID = id;
    let index: number;
    // Find index of jobtitle to use in subtitles loop
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
    // refresh jobTitleList:
    this.getJobTitleList();
  }

  onCheckboxChange(id: number) {
    console.log('Changed ID: ', id);
    for (let k = 0; k < this.jobSubTitleList.length; k++) {
      if (this.jobSubTitleList[k].id === id) {
        this.jobSubTitleList[k].checked = !this.jobSubTitleList[k].checked;
        console.log('Changed Checkbox Status:', this.jobSubTitleList[k].checked);
        this.updateJobTitleList(this.jobSubTitleList[k].checked, id);
        return;
      }
    }
  }

  updateJobTitleList(updateTo: boolean, idToUpdate: number) {
    const mapData = [{jobTitleID: this.jobTitleID, jobSubTitleID: idToUpdate}];
    console.log('MAPDATA:', mapData);
    if (updateTo === true) {
      // Add new mapping
      this.apiDataJobTitleService.insertJobTitleMap(mapData)
      .subscribe(
        res => {
          console.log(res);
        },
        err => {
          console.log(err);
        }
      );
    } else if (updateTo === false) {
      // Remove line in map
      this.apiDataJobTitleService.deletejobTitleMap(mapData)
      .subscribe(
        res => {
          console.log(res);
        },
        err => {
          console.log(err);
        }
      );
    }
  }

  onDeleteJobTitleClick() {
    const jobTitleData = {jobTitleID: this.jobTitleID};
    this.apiDataJobTitleService.deleteJobTitle(jobTitleData)
    .subscribe(
      res => {
        console.log(res);
      },
      err => {
        console.log(err);
      }
    );
    this.refresh();
  }

  onSubTitleTrashClick(id: number) {
    // get the ID for onDeleteJobSubTitleClick()
    this.jobSubTitleID = id;
  }

  onDeleteJobSubTitleClick() {
    const jobSubTitleData = {jobSubTitleID: this.jobSubTitleID};
    console.log('ID:', jobSubTitleData);
    this.apiDataJobTitleService.deleteJobSubTitle(jobSubTitleData)
    .subscribe(
      res => {
        console.log(res);
      },
      err => {
        console.log(err);
      }
    );
    this.refresh();
  }

  onCreateJobTitleClick(jobTitleName: string, description: string) {
    const jobTitleData = {jobTitleName: jobTitleName, description: description};
    this.apiDataJobTitleService.insertJobTitle(jobTitleData)
    .subscribe(
      res => {
        console.log(res);
      },
      err => {
        console.log(err);
      }
    );
    this.refresh();
  }

  onCreateJobSubTitleClick(jobSubTitleName: string, description: string) {
    const jobSubTitleData = {jobSubTitleName: jobSubTitleName, description: description};
    console.log('DATA:', jobSubTitleData);
    this.apiDataJobTitleService.insertJobSubTitle(jobSubTitleData)
    .subscribe(
      res => {
        console.log(res);
      },
      err => {
        console.log(err);
      }
    );
    this.refresh();
  }

  // EDIT JobTitle
  onJobTitlePencilClick(id: number, jobTitleName: string, description: string) {
    // Update formgroup with current values
    this.formTitles = this.formBuilder.group({
      id: [id],
      name: [jobTitleName, [Validators.required]],
      description: [description]
    });
  }
  onEditJobTitleClick() {
    const id = this.formTitles.controls.id.value;
    const jobTitleName = this.formTitles.controls.name.value;
    const description = this.formTitles.controls.description.value;
    const jobTitleData = {id: id, jobTitleName: jobTitleName, description: description};
    console.log('Form DATA:', jobTitleData);

    this.apiDataJobTitleService.updateJobTitle(jobTitleData)
    .subscribe(
      res => {
        console.log(res);
      },
      err => {
        console.log(err);
      }
    );
    this.refresh();
    // force modal to close with @ViewChild('closeBtn')
    this.closeBtn.nativeElement.click();
  }
  //

  // EDIT JobSubTitle
  onJobSubTitlePencilClick(id: number, jobSubTitleName: string, description: string) {
    // Update formgroup with current values
    this.formTitles = this.formBuilder.group({
      id: [id],
      name: [jobSubTitleName, [Validators.required]],
      description: [description]
    });
  }

  onEditJobSubTitleClick() {
    const id = this.formTitles.controls.id.value;
    const jobSubTitleName = this.formTitles.controls.name.value;
    const description = this.formTitles.controls.description.value;
    const jobSubTitleData = {id: id, jobSubTitleName: jobSubTitleName, description: description};
    console.log('DATA:', jobSubTitleData);

    this.apiDataJobTitleService.updateJobSubTitle(jobSubTitleData)
    .subscribe(
      res => {
        console.log(res);
      },
      err => {
        console.log(err);
      }
    );
    this.refresh();
    // force modal to close with @ViewChild('closeBtn')
    this.closeBtn.nativeElement.click();
  }
  //
}
