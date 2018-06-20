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
  selectdProject: any;
  projectRoster: any;
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
  deleteModalMessage: string;
  deleteModalButtons: any;

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
    }
    this.getProjectRoster(project.id);
    this.getProjectSchedule(project.projectName);

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
          console.log('PrimaryKeyRefs', res);
          this.pKeyRefList = res;
          if (this.pKeyRefList.length === 0) {
            this.deleteModalMessage = `Are you sure you want to delete "${this.selectdProject.projectName}"?`;
            this.deleteModalButtons = [
              {
                text: 'Delete',
                bsClass: 'btn-success',
                emit: true
              },
              {
                text: 'Cancel',
                bsClass: 'btn-secondary',
                emit: false
              }
            ];
          } else {
            // If the project is a foreign key to other tables, display the list
            this.deleteModalMessage = `
              <div>
              <div class="row" style="padding-bottom: 15px"><div class="col">
              "${this.selectdProject.projectName}" cannot be deleted because of referential integrity:
              </div></div>
              <div class="row"><div class="col">
                  <table class="table table-bordered table-sm">
                    <thead>
                      <tr>
                        <th>Jarvis Tables (where used)</th>
                        <th>Instances</th>
                      </tr>
                    </thead>
                    </tbody>
            `;
            for (let i = 0; i < this.pKeyRefList.length; i++) {
              // this.deleteModalMessage = this.deleteModalMessage + `
              //   <div class="row">
              //     <div class="col">TableName:</div>
              //     <div class="col">${this.pKeyRefList[i].TableName}</div>
              //     <div class="col">RowCount:</div>
              //     <div class="col">${this.pKeyRefList[i].NumOfRows}</div>
              // `;
              this.deleteModalMessage = this.deleteModalMessage + `
                  <tr>
                    <td>${this.pKeyRefList[i].TableName}</td>
                    <td>${this.pKeyRefList[i].NumOfRows}</td>
                  </tr>
              `;
            }
            this.deleteModalMessage = this.deleteModalMessage + `</tbody></table></div></div></div>`;
            this.deleteModalButtons = [
              {
                text: 'Cancel',
                bsClass: 'btn-secondary',
                emit: false
              }
            ];
          }
          console.log('Modal Message: ' + this.deleteModalMessage);
          this.deleteModal();
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

  onDeleteProjectClick(project: any) {

    this.selectdProject = project;

    // First check if the project has referential integrity to other tables in the database
    this.getPrimaryKeyRefs(this.selectdProject.id);

  }

  deleteModal() {
    const projectData = {projectID: this.selectdProject.id};

    // emit confirmation modal after they click request button
    this.appDataService.confirmModalData.emit(
      {
        title: `Confirm Project Delete`,
        message: this.deleteModalMessage,
        iconClass: 'fa-exclamation-triangle',
        iconColor: 'rgb(193, 193, 27)',
        allowOutsideClickDismiss: true,
        allowEscKeyDismiss: true,
        buttons: this.deleteModalButtons
      }
    );

    const deleteModalSubscription = this.appDataService.confirmModalResponse.subscribe( res => {
      if (res) {
        // if they click ok, grab the deleted project info and exec db call to delete
        const deleteActionSubscription =
        this.apiDataProjectService.deleteProject(projectData, this.authService.loggedInUser.id)
        .subscribe(
          del => {
            // this.deleteSuccess.emit(true);
            this.onDeleteSuccess();
          },
          err => {
            console.log(err);
          }
        );
      } else {
        console.log('delete confirm aborted');
      }
      deleteModalSubscription.unsubscribe();
    });
  }


}
