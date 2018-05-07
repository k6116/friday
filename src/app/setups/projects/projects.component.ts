import { Component, OnInit } from '@angular/core';
import { FormGroup, FormArray, FormControl, Validators, FormBuilder } from '@angular/forms';
import { ApiDataService } from '../../_shared/services/api-data.service';
import { AppDataService } from '../../_shared/services/app-data.service';
import { AuthService } from '../../auth/auth.service';
import { User } from '../../_shared/models/user.model';

@Component({
  selector: 'app-projects-setups',
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.css', '../../_shared/styles/common.css']
})
export class ProjectsSetupsComponent implements OnInit {

  form: FormGroup;
  projectName: string;
  projectType: number;
  projectDescription: string;
  projectList: any;
  projectData: any;
  loggedInUser: User;
  showProjectsEditModal: boolean;
  showProjectsCreateModal: boolean;
  display: boolean;

  constructor(
    private formBuilder: FormBuilder,
    private apiDataService: ApiDataService,
    private appDataService: AppDataService,
    private authService: AuthService,
  ) {
    // initialize the formgroup
    this.form = this.formBuilder.group({
      projectName: [null],
      projectType: [null],
      projectDescription: [null],
    });

    this.display = true;

  }

  ngOnInit() {
    // get logged in user's info
    this.authService.getLoggedInUser((user, err) => {
      if (err) {
        console.log(`error getting logged in user: ${err}`);
        return;
      }
      console.log('logged in user data received in main component:');
      console.log(user);
      this.loggedInUser = user;
      this.getUserProjectList();
    });

  }

  getUserProjectList() {

    this.apiDataService.getUserProjectList(this.loggedInUser.id)
      .subscribe(
        res => {
          console.log(`project list for user  id ${this.loggedInUser.id}`);
          console.log(res);
          this.projectList = res;

        },
        err => {
          console.log(err);
        }
      );
  }

  createProject() {
    this.showProjectsCreateModal = true;
  }

  selectProject(project: any) {
    this.showProjectsEditModal = true;
    this.projectData = project;
  }

  onCreateSuccess() {
    console.log('My Project List Refreshed');
    this.getUserProjectList();
  }

  onUpdateSuccess() {
    this.getUserProjectList();
  }

}
