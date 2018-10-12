import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ApiDataProjectService, ApiDataPermissionService, ApiDataMetaDataService, ApiDataEmailService } from '../../_shared/services/api-data/_index';
import { CacheService } from '../../_shared/services/cache.service';
import { AuthService } from '../../_shared/services/auth.service';
import { ProjectsEditModalComponent } from '../../modals/projects-edit-modal/projects-edit-modal.component';
import { ProjectsCreateModalComponent } from '../../modals/projects-create-modal/projects-create-modal.component';
import { User } from '../../_shared/models/user.model';
import { ToolsService } from '../../_shared/services/tools.service';

declare var $: any;

@Component({
  selector: 'app-projects-setups',
  templateUrl: './my-projects.component.html',
  styleUrls: ['./my-projects.component.css', '../../_shared/styles/common.css']
})
export class MyProjectsComponent implements OnInit {

  // Main
  loggedInUser: User;
  projectList: any;
  projectData: any;
  projectID: number;
  showSpinner: boolean;
  filterString: string;

  // Project Request
  projectPermissionRequestsList: any;
  submittedRequests: any;
  requestResponseFlag: boolean;
  request: any;
  replyComment: string;

  // Modals
  selectdProject: any;
  showProjectsEditModal: boolean;
  showProjectsCreateModal: boolean;
  deleteModalMessage: string;
  deleteModalButtons: any;
  pKeyRefList: any;


  @ViewChild(ProjectsCreateModalComponent) projectsCreateModalComponent; // to reset form on projects-create 
  @ViewChild(ProjectsEditModalComponent) projectsEditModalComponent; // to populate form in projects-edit-modal

  constructor(
    private router: Router,
    private apiDataProjectService: ApiDataProjectService,
    private apiDataPermissionService: ApiDataPermissionService,
    private apiDataMetaDataService: ApiDataMetaDataService,
    private apiDataEmailService: ApiDataEmailService,
    private cacheService: CacheService,
    private authService: AuthService,
    private toolsService: ToolsService, // needed in html for project type style
  ) {
    this.loggedInUser = this.authService.loggedInUser;
  }

  ngOnInit() {
    // show the spinner
    this.showSpinner = true;

    //  get all projects the user created
    this.getUserProjectList();

    // get the list of requests that are waiting for the users permission
    this.getProjectPermissionRequestsList();

  }

  // Get project list
  getUserProjectList() {
    this.apiDataProjectService.getUserProjectList(this.authService.loggedInUser.id)
    .subscribe(
      res => {

        this.projectList = res;

        // hide the spinner
        this.showSpinner = false;

      },
      err => {
        // console.log(err);
      }
    );
  }

  // List of all requests that have been made to join a project.
  getProjectPermissionRequestsList() {
    this.apiDataPermissionService.getProjectPermissionRequestsList(this.authService.loggedInUser.id)
    .subscribe(
      res => {
        this.projectPermissionRequestsList = res;

        // Filter for 'submitted' requests
        this.submittedRequests = [];
        let j = 0;
        for (let i = 0; i < this.projectPermissionRequestsList.length; i++) {
          if ( this.projectPermissionRequestsList[i].requestStatus === 'Submitted') {

            // store in seperate array
            this.submittedRequests[j] = this.projectPermissionRequestsList[i];
            j++

            // set flag so that request box shows up
            this.requestResponseFlag = true;
          }
        }

        // hide the spinner
        this.showSpinner = false;
      },
      err => {
        // console.log(err);
      }
    );
  }

  // Open modal to create new project
  createProject() {
    this.showProjectsCreateModal = true;
    setTimeout(() => {
      this.projectsCreateModalComponent.resetForm();
    }, 0);
  }

  // Refresh projectList after delete, update and create succecss
  projectListRefresh() {

    this.getUserProjectList();
  
  }

  // on clicking the 'x' icon at the right of the search/filter input
  onClearSearchClick() {

    // clear the filter string
    this.filterString = undefined;

  }

  editProject(project: any) {

    // open modal to update existing project
    this.showProjectsEditModal = true;

    this.projectData = project;

    // Call function in projects-edit-modal
    setTimeout(() => {
      this.projectsEditModalComponent.populateForm();
    }, 0);
  }

  onProjectClick(project) {

    // set flag true to navigate back to myProjects
    this.cacheService.fromMyProjectsFlag = true;
    
    // navigate to the display-project page
    this.router.navigate([`/main/projects/display/${project.id}`]);
    
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
            this.cacheService.raiseToast('success',
            `Email on Approval Decision delivered to ${request['user.fullName']}.`);
            this.getProjectPermissionRequestsList();
          },
          err => {
            // console.log(err);
          }
        );

      },
      err => {
        // console.log(err);
      }
    );

    this.getProjectPermissionRequestsList();
  }

  onDenyClick(request: any) {
    // So that request can be used in request-denied modal
    this.request = request;
  }

  // On Delete: Get the primary key references for "ProjectID". This searches all Jarvis tables
  getPrimaryKeyRefs(projectID: number) {
    const pKeyName = 'ProjectID';
    this.projectID = projectID;
    this.apiDataMetaDataService.getPrimaryKeyRefs(pKeyName, this.projectID, this.authService.loggedInUser.id)
      .subscribe(
        res => {

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
          this.deleteModal();
        },
        err => {
          // console.log(err);
        }
      );
  }

  onEditButtonMouseEnter(id, createdByID) {

    // Only show tooltip if not your project
    if (this.loggedInUser.id !== createdByID) {

      // set the jquery element
      const $el = $(`div.project-attributes-table[data-id="${id}"]`);

      // tooltip options
      const options = {
        title: 'Edit and Delete only allowed for projects you have created',
        placement: 'bottom'
      };

      $el.tooltip(options);
      $el.tooltip('show');
    }

  }

  onEditButtonMouseLeave(id) {
    
    // set the jquery element
    const $el = $(`div.project-attributes-table[data-id="${id}"]`);

    $el.tooltip('dispose');
  }

  onDeleteProjectClick(project: any) {

    this.selectdProject = project;

    // First check if the project has referential integrity to other tables in the database
    this.getPrimaryKeyRefs(this.selectdProject.id);

  }

  deleteModal() {
    const projectData = {projectID: this.selectdProject.id};

    // emit confirmation modal after they click request button
    this.cacheService.confirmModalData.emit(
      {
        title: `Confirm Project Delete`,
        message: this.deleteModalMessage,
        iconClass: 'fa-exclamation-triangle',
        iconColor: 'rgb(193, 193, 27)',
        closeButton: true,
        allowOutsideClickDismiss: true,
        allowEscKeyDismiss: true,
        buttons: this.deleteModalButtons
      }
    );

    const deleteModalSubscription = this.cacheService.confirmModalResponse.subscribe( res => {
      if (res) {
        // if they click ok, grab the deleted project info and exec db call to delete
        this.apiDataProjectService.deleteProject(projectData, this.authService.loggedInUser.id)
        .subscribe(
          del => {
            // this.deleteSuccess.emit(true);
            this.projectListRefresh();
          },
          err => {
            // console.log(err);
          }
        );
      } else {
        // console.log('delete confirm aborted');
      }
      deleteModalSubscription.unsubscribe();
    });
  }

}
