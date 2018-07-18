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
  jobTitleName: string;
  jobSubTitleName: string;
  jobTitleID: number;
  jobSubTitleID: number;
  subTitlesInit: boolean;
  formTitles: FormGroup;
  selection: any;

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
    // this.getJobTitleList();
    // this.getJobSubTitleList();

    // reset Formgroup for jobTitle and jobSubTitle
    // TO-DO: Doesn't reset on button click
    this.formTitles = this.formBuilder.group({
      id: [''],
      name: [''],
      description: ['']
    });

    this.subTitlesInit = true;
    // force modal to close with @ViewChild('closeBtn')
    this.closeBtn.nativeElement.click();
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
    // If jobTitle has no jobSubTitles jobTitleList[index].jobSubTitles will be undefined
    if (this.jobTitleList[index].jobSubTitles !== undefined) {
      // loop through jobSubTitleList and match up with the subtitles in the map by adding check: true or false
      const jobSubTitleMapLength = this.jobTitleList[index].jobSubTitles.length;
      if (jobSubTitleMapLength !== undefined) {
        for (let k = 0; k < this.jobSubTitleList.length; k++) {
          for (let j = 0; j < jobSubTitleMapLength; j++) {
            if (this.jobSubTitleList[k].id === this.jobTitleList[index].jobSubTitles[j].id) {
              this.jobSubTitleList[k].checked = true;
              break;
            } else {
              this.jobSubTitleList[k].checked = false;
            }
          }
        }
      }
    } else {
      // If jobTitle has no subTitles, turn all checkboxes false to overwrite previous list
      for (let k = 0; k < this.jobSubTitleList.length; k++) {
        this.jobSubTitleList[k].checked = false;
      }
    }
    // refresh jobTitleList
    this.getJobTitleList();
    this.refresh();
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
    this.getJobTitleList();
    this.refresh();
  }

  onSubTitleTrashClick(id: number) {
    // get the ID for onDeleteJobSubTitleClick()
    this.jobSubTitleID = id;
  }

  onDeleteJobSubTitleClick() {
    const jobSubTitleData = {jobSubTitleID: this.jobSubTitleID};
    this.apiDataJobTitleService.deleteJobSubTitle(jobSubTitleData)
    .subscribe(
      res => {
        console.log(res);
      },
      err => {
        console.log(err);
      }
    );
    this.getJobSubTitleList();
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
    this.getJobTitleList();
    this.refresh();
  }

  onCreateJobSubTitleClick(jobSubTitleName: string, description: string) {
    const jobSubTitleData = {jobSubTitleName: jobSubTitleName, description: description};
    console.log('jobSubTitle DATA:', jobSubTitleData);
    this.apiDataJobTitleService.insertJobSubTitle(jobSubTitleData)
    .subscribe(
      res => {
        console.log(res);
      },
      err => {
        console.log(err);
      }
    );
    this.getJobSubTitleList();
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
    this.getJobTitleList();
  }

  // Shows the mapped data in the consol
  onSubTitleButtonClick(jobSubTitleID: number) {
    let k = 0;
    const mappedTo = [];
    // loop through every jobTitle
    for (let i = 0; i < this.jobTitleList.length; i++) {
      // jobTitles without subTitles will say undefined
      if (this.jobTitleList[i].jobSubTitles !== undefined) {
        const len = this.jobTitleList[i].jobSubTitles.length;
        // loop through jobSubtitles
        for (let j = 0; j < len; j++) {
          if (this.jobTitleList[i].jobSubTitles[j].id === jobSubTitleID) {
            mappedTo[k] = [{id: this.jobTitleList[i].id, jobTitleName: this.jobTitleList[i].jobTitleName}];
            k = k + 1;
          }
        }
      }
    }
    console.log('This jobSubTitle is mapped to:', mappedTo);
  }

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
    console.log('jobSubTitle DATA:', jobSubTitleData);

    this.apiDataJobTitleService.updateJobSubTitle(jobSubTitleData)
    .subscribe(
      res => {
        console.log(res);
      },
      err => {
        console.log(err);
      }
    );
    this.getJobSubTitleList();
    this.refresh();
    // force modal to close with @ViewChild('closeBtn')
    this.closeBtn.nativeElement.click();
  }

}
