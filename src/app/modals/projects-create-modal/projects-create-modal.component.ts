import { Component, OnInit, AfterViewInit, Input, Output, EventEmitter, HostListener} from '@angular/core';
import { FormGroup, FormArray, FormControl, Validators, FormBuilder } from '@angular/forms';
import { ApiDataEmployeeService, ApiDataProjectService, ApiDataSchedulesService } from '../../_shared/services/api-data/_index';
import { CacheService } from '../../_shared/services/cache.service';
import { AuthService } from '../../_shared/services/auth.service';
import { WebsocketService } from '../../_shared/services/websocket.service';

declare var $: any;

@Component({
  selector: 'app-projects-create-modal',
  templateUrl: './projects-create-modal.component.html',
  styleUrls: ['./projects-create-modal.component.css'],
})
export class ProjectsCreateModalComponent implements OnInit {

  @Output() createSuccess = new EventEmitter<any>();

  form: FormGroup;
  userID: any;
  userEmail: string;
  projectTypesList: any;
  userPLMData: any;
  createdProject: any;
  projectNameRegex: any;

  constructor(
    private formBuilder: FormBuilder,
    private apiDataProjectService: ApiDataProjectService,
    private apiDataEmployeeService: ApiDataEmployeeService,
    private apiDataSchedulesService: ApiDataSchedulesService,
    private cacheService: CacheService,
    private authService: AuthService,
    private websocketService: WebsocketService
  ) {
    this.resetForm();
    this.getProjectTypesList();
   }

  ngOnInit() {
     // get the user id
     this.userID = this.authService.loggedInUser.id;
     this.userEmail = this.authService.loggedInUser.email;

     if (!this.cacheService.userPLMData) {
      this.getUserPLMData(this.userEmail);
     }
  }

  resetForm() {
    this.projectNameRegex = /^[a-zA-Z0-9][^-\s][\w\s-]+$/;
    // initialize the formgroup
    this.form = this.formBuilder.group({
      projectName: [null, [Validators.required, Validators.minLength(2), Validators.pattern(this.projectNameRegex)]],
      // projectTypeID: [null, [Validators.required]],
      projectDescription: [null],
      projectNotes: [null],
    });
  }

  getProjectTypesList() {
    this.apiDataProjectService.getProjectTypesList()
    .subscribe(
      res => {
        // console.log('ProjectTypesList', res);
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
    // for project that are not org level and created by Individual Cont/Managers, projectType will always be "General"
    project.projectTypeName = 'General';

    // Find the project type ID
    for (let i = 0; i < this.projectTypesList.length; i++ ) {
      if (this.projectTypesList[i].projectTypeName === project.projectTypeName) {
        project.projectTypeID = this.projectTypesList[i].id;
        break;
      }
    }

    project.projectOrgManager = this.cacheService.userPLMData[0].SUPERVISOR_EMAIL_ADDRESS;

    this.apiDataProjectService.createProject(project, this.userID)
    .subscribe(
      res => {
        console.log(res);
        project.projectID = res.newProjectID;
        this.createSuccess.emit(project);
        this.websocketService.sendNewProject(res);
      },
      err => {
        console.log(err);
      }
    );

  }

  getUserPLMData(userEmailAddress: string) {
    this.apiDataEmployeeService.getUserPLMData(userEmailAddress)
    .subscribe(
      res => {
        console.log('User PLM Data Retrieved');
        this.cacheService.userPLMData = res;
      },
      err => {
        console.log(err);
      }
    );
  }

  testButton() {
    console.log('Form', this.form);
    const today = new Date();
    const scheduleData = {scheduleID: 320, projectID: 1112, notes: 'aweiufhalwieuhf'};
        // [{
    //   id: null,
    //   currentRevision: null,
    //   needByDate: null,
    //   neededQuantity: null,
    //   buildStatusID: null,
    //   plcDateEstimate: null,
    //   plcDateCommit: null,
    //   plcDate: null,
    //   plcStatusID: null,
    //   notes: null,
    // },
    const scheduleDataBulk = [{
      scheduleID: 320,
      currentRevision: 1,
      plcDate: '2019-11-17',
      plcStatusID: 4,
      notes: 'aweiufhalwieuhf'
    },
    {
      scheduleID: 320,
      currentRevision: 1,
      plcDate: '2019-11-17',
      plcStatusID: 5,
      notes: 'aweiufhalwieuhf'
    },
    {
      scheduleID: 320,
      currentRevision: 1,
      plcDate: '2019-11-17',
      plcStatusID: 6,
      notes: 'aweiufhalwieuhf'
    }];
    this.apiDataSchedulesService.destroySchedule(scheduleData, 1)
    .subscribe(
      res => {
        console.log('Schedule inserted');
      },
      err => {
        console.log(err);
      }
    );
  }
  // formValidation() {
  //   'use strict';
  //   window.addEventListener('load', function() {
  //     // Fetch all the forms we want to apply custom Bootstrap validation styles to
  //     const forms = document.getElementsByClassName('needs-validation');

  //     // Loop over them and prevent submission
  //     const validation = Array.prototype.filter.call(forms, function(form) {
  //       form.addEventListener('submit', function(event) {
  //         if (form.checkValidity() === false) {
  //           event.preventDefault();
  //           event.stopPropagation();
  //         }
  //         form.classList.add('was-validated');
  //       }, false);
  //     });
  //   }, false);
  // }

}
