import { Component, OnInit, Output, ViewChild, ElementRef, EventEmitter } from '@angular/core';
import { ApiDataEmployeeService, ApiDataProjectService, ApiDataPermissionService,
  ApiDataMetaDataService, ApiDataEmailService } from '../../_shared/services/api-data/_index';
import { AppDataService } from '../../_shared/services/app-data.service';
import { AuthService } from '../../_shared/services/auth.service';
import { ProjectsEditModalComponent } from '../../modals/projects-edit-modal/projects-edit-modal.component';
import { ProjectsCreateModalComponent } from '../../modals/projects-create-modal/projects-create-modal.component';
import { User } from '../../_shared/models/user.model';

@Component({
  selector: 'app-projects-setups',
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.css', '../../_shared/styles/common.css'],
})
export class ProjectsSetupsComponent implements OnInit {

  loggedInUser: User;
  projectList: any;
  projectData: any;
  projectPermissionRequestsList: any;
  showProjectsEditModal: boolean;
  showProjectsCreateModal: boolean;
  cardNPI: any;
  selectedRow: any;
  projectRoster: any;
  disableDelete: boolean;
  pKeyRefList: any;
  showDetails: boolean;
  projectID: number;
  requestResponseFlag: boolean;
  request: any;
  projectSchedule: any;
  toggleEditProjectRole: boolean;
  projectRolesList: any;
  projectRole: any;
  replyComment: string;

  @ViewChild(ProjectsCreateModalComponent) projectsCreateModalComponent;
  @ViewChild(ProjectsEditModalComponent) projectsEditModalComponent;
  // @Output() deleteSuccess = new EventEmitter<boolean>();

  constructor(
    private apiDataEmployeeService: ApiDataEmployeeService,
    private apiDataProjectService: ApiDataProjectService,
    private apiDataPermissionService: ApiDataPermissionService,
    private apiDataMetaDataService: ApiDataMetaDataService,
    private apiDataEmailService: ApiDataEmailService,
    private appDataService: AppDataService,
    private authService: AuthService,
  ) {
    this.loggedInUser = this.authService.loggedInUser;
    this.cardNPI = [
      {
        title: 'Project Status',
        alias: 'projectStatus',
        value: ''
      },
      {
        title: 'Oracle Item Number',
        alias: 'oracleItemNumber',
        value: ''
      },
      {
        title: 'Project Number',
        alias: 'projectNumber',
        value: ''
      },
      {
        title: 'Priority',
        alias: 'priority',
        value: ''
      },
      {
        title: 'IBO',
        alias: 'IBO',
        value: ''
      },
      {
        title: 'MU',
        alias: 'MU',
        value: ''
      },
      {
        title: 'Organization',
        alias: 'departmentID',
        value: ''
        },
        {
          title: 'Notes',
          alias: 'notes',
          value: ''
        },
        {
          title: 'Description',
          alias: 'description',
          value: ''
        },

    ];
  }

  ngOnInit() {
    this.getUserProjectList();
    this.getProjectPermissionRequestsList();
    this.getProjectRoles();
  }

  editProject(project: any) {
    this.showProjectsEditModal = true;
    this.projectData = project;
    setTimeout(() => {
      this.projectsEditModalComponent.populateForm();
    }, 0);
  }

  getUserProjectList() {
    this.apiDataProjectService.getUserProjectList(this.authService.loggedInUser.id)
    .subscribe(
      res => {
        console.log('Project List: ', res);
        this.projectList = res;
      },
      err => {
        console.log(err);
      }
    );
  }

  // List of all requests that have been made to join a project.
  //  Gets called onInit and requestResponse()
  getProjectPermissionRequestsList() {
    this.apiDataPermissionService.getProjectPermissionRequestsList(this.authService.loggedInUser.id)
    .subscribe(
      res => {
        // console.log(res);
        this.projectPermissionRequestsList = res;
        console.log('projectPermissionRequest: ', this.projectPermissionRequestsList);
        for (let i = 0; i < this.projectPermissionRequestsList.length; i++) {
          if ( this.projectPermissionRequestsList[i].requestStatus === 'Submitted') {
            this.requestResponseFlag = true;
          }
        }
      },
      err => {
        console.log(err);
      }
    );
  }

  createProject() {
    this.showProjectsCreateModal = true;
    setTimeout(() => {
      this.projectsCreateModalComponent.resetForm();
    }, 0);
  }

  onCreateSuccess() {
    console.log('Create project success. My Project List Refreshed');
    this.getUserProjectList();
  }

  onUpdateSuccess() {
    console.log('Update project success. My Project List Refreshed');
    this.getUserProjectList();
  }

  onDeleteSuccess() {
    console.log('Delete project success. My Project List Refreshed');
    this.getUserProjectList();
  }

  onCollapseClick(project: any, k) {
    // k is index of projectList; selected row gets highlighted
    if ( this.selectedRow === k) {
      this.selectedRow = null;
    } else {
        this.selectedRow = k;
        // Assign projectList values to cardNPI values
        for (let i = 0; i < this.cardNPI.length; i++) {
          for (let j = 0; j < Object.keys(project).length; j++) {
            if (this.cardNPI[i].alias === Object.keys(project)[j]) {
              this.cardNPI[i].value = Object.values(project)[j];
            }
          }
        }
      this.getProjectRoster(project.id);
      this.getProjectSchedule(project.projectName);
    }

  }

  // Accept or deny a request
  requestResponse(request: any, reply: string, replyComment: string) {
    this.requestResponseFlag = false;

    this.apiDataPermissionService.updateProjectPermissionResponse(request, reply, replyComment, this.authService.loggedInUser.id)
    .subscribe(
      res => {

        // send email
        this.apiDataEmailService.sendProjectApprovalEmail(request['user.id'], this.authService.loggedInUser.id,
        request['project.projectName'], reply === 'Approved' ? true : false, replyComment).subscribe(
          eSnd => {
            this.appDataService.raiseToast('success',
            `Email on Approval Decision delivered to ${request['user.fullName']}.`);
            this.getProjectPermissionRequestsList();
          },
          err => {
            console.log(err);
          }
        );
        console.log(res);

      },
      err => {
        console.log(err);
      }
    );

    this.getProjectPermissionRequestsList();
  }

  onDenyClick(request: any) {
    // So that request can be used in request-denied modal
    this.request = request;
  }

  getProjectRoster(projectID: number) {
    this.apiDataProjectService.getProjectRoster(projectID)
    .subscribe(
      res => {
        console.log('project roster:');
        console.log(res);
        if (res.length) {
          this.projectRoster = res[0];
        }
      },
      err => {
        console.log(err);
      }
    );
  }

  // onDeleteButtonClick: check if project can be deleted.
  // Project can only be delted if user is the creator AND if they are not used in other tables
  getPrimaryKeyRefs(projectID: number) {
    const pKeyName = 'ProjectID';
    this.projectID = projectID;
    this.apiDataMetaDataService.getPrimaryKeyRefs(pKeyName, this.projectID, this.authService.loggedInUser.id)
      .subscribe(
        res => {
          // console.log(res);
          this.pKeyRefList = res;
          if (this.pKeyRefList.length === 0) {
            this.disableDelete = false;
          } else {
            this.disableDelete = true;
            this.showDetails = false;
          }
        },
        err => {
          console.log(err);
        }
      );
  }

  onDetailsClick() {
    this.showDetails = !this.showDetails;
  }

  onDeleteProjectClick() {
    const project = [{projectID: this.projectID}];

    this.apiDataProjectService.deleteProject(project[0], this.authService.loggedInUser.id)
    .subscribe(
      res => {
        // this.deleteSuccess.emit(true);
        this.onDeleteSuccess();
      },
      err => {
        console.log(err);
      }
    );
  }

  getProjectSchedule(projectName: string) {

    this.apiDataProjectService.getProjectSchedule(projectName)
    .subscribe(
      res => {
        console.log('project schedule:');
        console.log(res);
        this.projectSchedule = res[0];
      },
      err => {
        console.log(err);
      }
    );
  }

  getProjectRoles() {
    this.apiDataProjectService.getProjectRoles()
    .subscribe(
      res => {
        console.log('Project Roles Retrieved');
        this.projectRolesList = res;
      },
      err => {
        console.log(err);
      }
    );
  }

  onProjectRoleEditClick() {
    this.toggleEditProjectRole = !this.toggleEditProjectRole;
  }

  selectProjectRoleChangeHandler(event: any, project: any) {

    // create object for api post
    const projectEmployeeRoleData = {
      projectRoleID: null,
      projectRole: null,
      projectID: null
    };
    projectEmployeeRoleData.projectRole = event.target.value;
    for (let i = 0; i < this.projectRolesList.length; i++) {
      if (this.projectRolesList[i].projectRole === event.target.value) {
        projectEmployeeRoleData.projectRoleID = this.projectRolesList[i].id;
      }
    }
    projectEmployeeRoleData.projectID = project.id;

    this.apiDataProjectService.updateProjectEmployeeRole(projectEmployeeRoleData, this.authService.loggedInUser.id)
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
