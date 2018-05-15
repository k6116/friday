import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { trigger, state, style, transition, animate, keyframes, group } from '@angular/animations';
import { ToolsService } from '../../_shared/services/tools.service';
import { FormGroup, FormArray, FormControl, Validators, FormBuilder } from '@angular/forms';
import { ApiDataService } from '../../_shared/services/api-data.service';
import { AppDataService } from '../../_shared/services/app-data.service';
import { AuthService } from '../../auth/auth.service';

declare var $: any;

@Component({
  selector: 'app-projects-edit-modal',
  templateUrl: './projects-edit-modal.component.html',
  styleUrls: ['./projects-edit-modal.component.css'],
})
export class ProjectsEditModalComponent implements OnInit {

  @Input() projectData: any;
  @Output() updateSuccess = new EventEmitter<boolean>();
  @Output() deleteSuccess = new EventEmitter<boolean>();

  form: FormGroup;
  userID: any;
  userJobTitleID: any;
  pKeyName: string;
  pKeyValue: number;
  pKeyRefList: any;
  disableDelete: boolean;
  projectTypesList: any;

  constructor(
    private formBuilder: FormBuilder,
    private apiDataService: ApiDataService,
    private appDataService: AppDataService,
    private authService: AuthService,
  ) {

    this.pKeyName = 'ProjectID';
    this.disableDelete = true;

    this.resetForm();
    this.getProjectTypesList();
   }

  ngOnInit() {
    // get the user id
    this.userID = this.authService.loggedInUser ? this.authService.loggedInUser.id : null;
  }

  // getProjectData() {
  //   console.log(this.projectData);
  //   const project = this.form.getRawValue();
  //   console.log(project);
  // }

  getProjectTypesList() {
    this.apiDataService.getProjectTypesList()
    .subscribe(
      res => {
        // console.log(res);
        this.projectTypesList = res;
      },
      err => {
        console.log(err);
      }
    );
  }

  updateProject() {
    // set the form data that will be sent in the body of the request
    const project = this.form.getRawValue();

    this.apiDataService.updateProject(project, this.userID)
    .subscribe(
      res => {
        // console.log(res);
        this.updateSuccess.emit(true);
      },
      err => {
        console.log(err);
      }
    );
  }

  deleteProject() {
    // set the form data that will be sent in the body of the request
    const project = this.form.getRawValue();

    this.apiDataService.deleteProject(project, this.userID)
    .subscribe(
      res => {
        // console.log(res);
        this.deleteSuccess.emit(true);
      },
      err => {
        console.log(err);
      }
    );
  }

  resetForm() {
    // initialize the formgroup
    this.form = this.formBuilder.group({
      projectID: [null],
      projectName: [null],
      projectTypeID: [null],
      projectDescription: [null],
      projectNotes: [null],
    });
  }

  populateForm() {
    // populate the formgroup
    this.form = this.formBuilder.group({
      projectID: this.projectData.id,
      projectName: this.projectData.projectName,
      projectTypeID: this.projectData['projectTypes.id'],
      projectDescription: this.projectData.description,
      projectNotes: this.projectData.notes,
    });

    this.getPrimaryKeyRefs();

  }

  getPrimaryKeyRefs() {
    this.pKeyValue = this.projectData.id;

    this.apiDataService.getPrimaryKeyRefs(this.pKeyName, this.pKeyValue, this.userID)
      .subscribe(
        res => {
          // console.log(res);
          this.pKeyRefList = res;
          if (this.pKeyRefList.length === 0) {
            this.disableDelete = false;
          } else {
            this.disableDelete = true;
          }
        },
        err => {
          console.log(err);
        }
      );
  }

  // onCancelClicked() {
  //   console.log('cancel button clicked');
  // }

}

