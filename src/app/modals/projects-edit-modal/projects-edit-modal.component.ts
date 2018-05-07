import { Component, OnInit, AfterViewInit, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { trigger, state, style, transition, animate, keyframes, group } from '@angular/animations';
import { ToolsService } from '../../_shared/services/tools.service';
import { FormGroup, FormArray, FormControl, Validators, FormBuilder } from '@angular/forms';
import { ApiDataService } from '../../_shared/services/api-data.service';
import { AppDataService } from '../../_shared/services/app-data.service';
import { AuthService } from '../../auth/auth.service';

declare var $: any;
declare var jQuery: any;

@Component({
  selector: 'app-projects-edit-modal',
  templateUrl: './projects-edit-modal.component.html',
  styleUrls: ['./projects-edit-modal.component.css'],
})
export class ProjectsEditModalComponent implements OnInit {

  @Input() projectData: any;
  @Output() updateSuccess = new EventEmitter<boolean>();

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
      projectName: [null],
      // projectType: [null],
      projectDescription: [null],
      projectNotes: [null],
    });
   }

  ngOnInit() {
    // get the user id
    this.userID = this.authService.loggedInUser ? this.authService.loggedInUser.id : null;
    console.log('INIT');
  }

  getProjectData() {
    jQuery('#projectsEditModal').modal('dispose');
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

  onCancelClicked() {
    console.log('cancel button clicked');
    // initialize the formgroup
    this.form = this.formBuilder.group({
      projectName: [null],
      // projectType: [null],
      projectDescription: [null],
      projectNotes: [null],
    });
  }


}

