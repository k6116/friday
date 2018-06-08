import { Component, OnInit, Output, ViewChild, ElementRef, EventEmitter } from '@angular/core';
import { ApiDataService } from '../../_shared/services/api-data.service';
import { AppDataService } from '../../_shared/services/app-data.service';
import { AuthService } from '../../auth/auth.service';
import { ProjectsEditModalComponent } from '../../modals/projects-edit-modal/projects-edit-modal.component';
import { ProjectsCreateModalComponent } from '../../modals/projects-create-modal/projects-create-modal.component';
import { User } from '../../_shared/models/user.model';

@Component({
  selector: 'app-projects-setups',
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.css', '../../_shared/styles/common.css'],
})
export class ProjectsSetupsComponent implements OnInit {

  projectName: string;
  projectType: number;
  projectDescription: string;
  projectList: any;
  projectData: any;
  projectAccessRequestsList: any;
  loggedInUser: User;
  showProjectsEditModal: boolean;
  showProjectsCreateModal: boolean;
  display: boolean;
  cardNPI: any;
  selectedRow: any;
  projectRoster: any;
  disableDelete: boolean;
  pKeyName: string;
  pKeyValue: number;
  pKeyRefList: any;
  showDetails: boolean;
  projectID: number;
  requestResponseFlag: boolean;

  @ViewChild(ProjectsCreateModalComponent) projectsCreateModalComponent;
  @ViewChild(ProjectsEditModalComponent) projectsEditModalComponent;
  @Output() deleteSuccess = new EventEmitter<boolean>();

  constructor(
    private apiDataService: ApiDataService,
    private appDataService: AppDataService,
    private authService: AuthService,
  ) {
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
    // get logged in user's info
    this.authService.getLoggedInUser((user, err) => {
      if (err) {
        console.log(`error getting logged in user: ${err}`);
        return;
      }
      this.loggedInUser = user;
      this.getUserProjectList();
      this.getProjectAccessRequestsList();
    });
  }

  selectProject(project: any) {
    this.showProjectsEditModal = true;
    this.projectData = project;
    setTimeout(() => {
      this.projectsEditModalComponent.populateForm();
    }, 0);
  }

  getUserProjectList() {
    this.apiDataService.getUserProjectList(this.loggedInUser.id)
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
  getProjectAccessRequestsList() {
    this.apiDataService.getProjectAccessRequestsList(this.loggedInUser.id)
      .subscribe(
        res => {
          // console.log(res);
          this.projectAccessRequestsList = res;
          console.log('ProjectAccessRequest: ', this.projectAccessRequestsList);
          for (let i = 0; i < this.projectAccessRequestsList.length; i++) {
            console.log('You are in for');
            if ( this.projectAccessRequestsList[i].requestStatus === 'Submitted') {
              this.requestResponseFlag = true;
              console.log('You are in if');
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
  }

  // Accept or deny a request
  requestResponse(request: any, reply: string) {
    this.requestResponseFlag = false;
    this.apiDataService.responseProjectAccessRequest(request, reply, this.loggedInUser.id)
      .subscribe(
        res => {
          console.log(res);
        },
        err => {
          console.log(err);
        }
      );
    this.getProjectAccessRequestsList();
  }

  getProjectRoster(projectID: number) {
    console.log('getting project roster');
    console.log('ProjectID is: ', projectID);
    this.apiDataService.getProjectRoster(projectID)
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
    this.pKeyName = 'ProjectID';
    this.projectID = projectID;
    this.apiDataService.getPrimaryKeyRefs(this.pKeyName, this.projectID, this.loggedInUser.id)
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

    this.apiDataService.deleteProject(project[0], this.loggedInUser.id)
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

}
