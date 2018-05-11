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

  constructor(
    private formBuilder: FormBuilder,
    private apiDataService: ApiDataService,
    private appDataService: AppDataService,
    private authService: AuthService,
  ) {
    // initialize the formgroup
    this.form = this.formBuilder.group({
      projectID: [null],
      projectName: [null],
      // projectType: [null],
      projectDescription: [null],
      projectNotes: [null],
    });
   }

  ngOnInit() {
    // get the user id
    this.userID = this.authService.loggedInUser ? this.authService.loggedInUser.id : null;
  }

  getProjectData() {
    console.log(this.projectData);
    console.log('JobTitleID: ' + this.userJobTitleID);
    const project = this.form.getRawValue();
    console.log(project);
  }

  updateProject() {

    // set the form data that will be sent in the body of the request
    const project = this.form.getRawValue();
    console.log(project);
    console.log('UserID: ' + this.userID);
    this.apiDataService.updateProject(project, this.userID)
    .subscribe(
      res => {
        console.log(res);
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
    console.log(project);
    console.log('UserID: ' + this.userID);
    this.apiDataService.deleteProject(project, this.userID)
    .subscribe(
      res => {
        console.log(res);
        this.deleteSuccess.emit(true);
      },
      err => {
        console.log(err);
      }
    );

  }

  populateForm() {
    // populate the formgroup
    this.form = this.formBuilder.group({
      projectID: this.projectData.id,
      projectName: this.projectData.projectName,
      // projectType: [null],
      projectDescription: this.projectData.description,
      projectNotes: this.projectData.notes,
    });
  }

  onCancelClicked() {
    console.log('cancel button clicked');
  }

}

