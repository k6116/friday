import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { trigger, state, style, transition, animate, keyframes, group } from '@angular/animations';
import { ToolsService } from '../../_shared/services/tools.service';
import { FormGroup, FormArray, FormControl, Validators, FormBuilder } from '@angular/forms';
import { ApiDataEmployeeService, ApiDataProjectService, ApiDataPermissionService,
  ApiDataMetaDataService, ApiDataEmailService } from '../../_shared/services/api-data/_index';
import { CacheService } from '../../_shared/services/cache.service';
import { AuthService } from '../../_shared/services/auth.service';

declare var $: any;

@Component({
  selector: 'app-projects-edit-modal',
  templateUrl: './projects-edit-modal.component.html',
  styleUrls: ['./projects-edit-modal.component.css'],
})
export class ProjectsEditModalComponent implements OnInit {

  @Input() projectData: any;
  @Input() projectPermissionRequestsList: any;
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
  showPendingRequests: boolean;

  constructor(
    private formBuilder: FormBuilder,
    private apiDataEmployeeService: ApiDataEmployeeService,
    private apiDataProjectService: ApiDataProjectService,
    private apiDataPermissionService: ApiDataPermissionService,
    private apiDataMetaDataService: ApiDataMetaDataService,
    private apiDataEmailService: ApiDataEmailService,
    private cacheService: CacheService,
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

  getProjectData() {
    // console.log(this.projectPermissionRequestsList);
  }

  getProjectTypesList() {
    this.apiDataProjectService.getProjectTypesList()
    .subscribe(
      res => {
        // console.log(res);
        this.projectTypesList = res;
      },
      err => {
        // console.log(err);
      }
    );
  }

  updateProject() {
    // set the form data that will be sent in the body of the request
    const project = this.form.getRawValue();

    this.apiDataProjectService.updateProject(project, this.userID)
    .subscribe(
      res => {
        // console.log(res);
        this.updateSuccess.emit(true);
      },
      err => {
        // console.log(err);
      }
    );
  }

  deleteProject() {
    // set the form data that will be sent in the body of the request
    const project = this.form.getRawValue();

    this.apiDataProjectService.deleteProject(project, this.userID)
    .subscribe(
      res => {
        // console.log(res);
        this.deleteSuccess.emit(true);
      },
      err => {
        // console.log(err);
      }
    );
  }

  resetForm() {
    // initialize the formgroup
    this.form = this.formBuilder.group({
      projectID: [null],
      projectName: [null],
      // projectTypeID: [null],
      projectDescription: [null],
      projectNotes: [null],
    });
  }

  populateForm() {
    // populate the formgroup
    this.form = this.formBuilder.group({
      projectID: this.projectData.id,
      projectName: this.projectData.projectName,
      // projectTypeID: this.projectData['projectType.id'],
      projectDescription: this.projectData.description,
      projectNotes: this.projectData.notes,
    });
    this.getPrimaryKeyRefs();
    this.handlePendingRequests();
  }

  getPrimaryKeyRefs() {
    this.pKeyValue = this.projectData.id;

    this.apiDataMetaDataService.getPrimaryKeyRefs(this.pKeyName, this.pKeyValue, this.userID)
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
          // console.log(err);
        }
      );
  }

  handlePendingRequests() {
    const projectID = this.projectData.id;
    const found = this.projectPermissionRequestsList.some(function (el) {
      return el.projectID === projectID;
    });
    if (found) {
      this.showPendingRequests = true;
    } else {
      this.showPendingRequests = false;
    }
  }

}

