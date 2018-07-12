import { Component, OnInit, AfterViewInit, Input, Output, EventEmitter, HostListener} from '@angular/core';
import { FormGroup, FormArray, FormControl, Validators, FormBuilder } from '@angular/forms';
import { ApiDataEmployeeService, ApiDataProjectService } from '../../_shared/services/api-data/_index';
import { CacheService } from '../../_shared/services/cache.service';
import { AuthService } from '../../_shared/services/auth.service';

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
    private apiDataProjectService: ApiDataProjectService,
    private apiDataEmployeeService: ApiDataEmployeeService,
    private cacheService: CacheService,
    private authService: AuthService,
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
    // initialize the formgroup
    this.form = this.formBuilder.group({
      projectName: [null, [Validators.required]],
      projectTypeID: [null, [Validators.required]],
      projectDescription: [null],
      projectNotes: [null],
    });
  }

  getProjectTypesList() {
    this.apiDataProjectService.getProjectTypesList()
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
    project.projectOrgManager = this.cacheService.userPLMData[0].SUPERVISOR_EMAIL_ADDRESS;

    this.apiDataProjectService.createProject(project, this.userID)
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
