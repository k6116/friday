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
  createdProject: any;
  projectNameRegex: any;
  managerEmailAddress: string;

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
     this.managerEmailAddress = this.authService.loggedInUser.managerEmailAddress;

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
        // console.log(err);
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

    project.projectOrgManager = this.managerEmailAddress;

    this.apiDataProjectService.createProject(project, this.userID)
    .subscribe(
      res => {
        // console.log(res);
        project.projectID = res.newProjectID;
        this.createSuccess.emit(project);
        this.websocketService.sendNewProject(res);
      },
      err => {
        // console.log(err);
      }
    );

  }

}
