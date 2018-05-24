import { Component, OnInit, AfterViewInit, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { trigger, state, style, transition, animate, keyframes, group } from '@angular/animations';
import { ToolsService } from '../../_shared/services/tools.service';
import { FormGroup, FormArray, FormControl, Validators, FormBuilder } from '@angular/forms';
import { ApiDataService } from '../../_shared/services/api-data.service';
import { AppDataService } from '../../_shared/services/app-data.service';
import { AuthService } from '../../auth/auth.service';

declare var $: any;

@Component({
  selector: 'app-projects-create-modal',
  templateUrl: './projects-create-modal.component.html',
  styleUrls: ['./projects-create-modal.component.css'],
})
export class ProjectsCreateModalComponent implements OnInit {

  @Output() createSuccess = new EventEmitter<boolean>();

  form: FormGroup;
  userID: any;
  userEmail: string;
  projectTypesList: any;
  userPLMData: any;

  constructor(
    private formBuilder: FormBuilder,
    private apiDataService: ApiDataService,
    private appDataService: AppDataService,
    private authService: AuthService,
  ) {
    this.resetForm();
    this.getProjectTypesList();
   }

  ngOnInit() {
     // get the user id
     this.userID = this.authService.loggedInUser ? this.authService.loggedInUser.id : null;
     this.userEmail = this.authService.loggedInUser ? this.authService.loggedInUser.email : null;

     if (!this.appDataService.userPLMData) {
      this.getUserPLMData(this.userEmail);
     }
  }

  resetForm() {
    // initialize the formgroup
    this.form = this.formBuilder.group({
      projectName: [null, [Validators.required]],
      projectTypeID: [null, [Validators.required]],
      projectDescription: [null],
      projectNotes: [null],
    });
  }

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

  // This change event is not needed right now, keeping as reference
  selectedProjectType(projectTypeID) {
    // console.log(projectTypeID.value);
  }

  createProject() {

    // set the form data that will be sent in the body of the request
    const project = this.form.getRawValue();
    project.projectOrgManager = this.appDataService.userPLMData[0].SUPERVISOR_EMAIL_ADDRESS;

    this.apiDataService.createProject(project, this.userID)
    .subscribe(
      res => {
        console.log(res);
        this.createSuccess.emit(true);
      },
      err => {
        console.log(err);
      }
    );

  }

  getUserPLMData(userEmailAddress: string) {
    this.apiDataService.getUserPLMData(userEmailAddress)
    .subscribe(
      res => {
        console.log('User PLM Data Retrieved');
        this.appDataService.userPLMData = res;
      },
      err => {
        console.log(err);
      }
    );
  }

}

