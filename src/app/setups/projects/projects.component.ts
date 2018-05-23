import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
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
  alertToggle: boolean;
  cardNPI: any;
  collapseOpen: boolean;

  @ViewChild(ProjectsCreateModalComponent) projectsCreateModalComponent;
  @ViewChild(ProjectsEditModalComponent) projectsEditModalComponent;

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

    this.alertToggle = false;
    this.collapseOpen = false;
  }

  selectProject(project: any) {
    this.showProjectsEditModal = true;
    this.projectData = project;
    setTimeout(() => {
      this.projectsEditModalComponent.populateForm();
    }, 0);
    console.log('edit button clicked');
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

  getProjectAccessRequestsList() {
    this.apiDataService.getProjectAccessRequestsList(this.loggedInUser.id)
      .subscribe(
        res => {
          // console.log(res);
          this.projectAccessRequestsList = res;
          console.log('ProjectAccessRequest: ', this.projectAccessRequestsList);
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

  onCollapseClick(project: any) {
    this.collapseOpen = !this.collapseOpen;
    console.log('Collapse clicked, collapseOpen', this.collapseOpen);

    for (let i = 0; i < this.cardNPI.length; i++) {
      for (let j = 0; j < Object.keys(project).length; j++) {
        if (this.cardNPI[i].alias === Object.keys(project)[j]) {
          this.cardNPI[i].value = Object.values(project)[j];
        }
      }
    }
  }

  requestResponse(request: any, reply: string) {
    this.apiDataService.responseProjectAccessRequest(request, reply, this.loggedInUser.id)
      .subscribe(
        res => {
          console.log(res);
        },
        err => {
          console.log(err);
        }
      );
    this.alertToggle = !this.alertToggle;
  }

  collapseToggle() {
    this.collapseOpen = !this.collapseOpen;
  }

}
