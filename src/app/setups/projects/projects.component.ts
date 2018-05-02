import { Component, OnInit } from '@angular/core';
import { FormGroup, FormArray, FormControl, Validators, FormBuilder } from '@angular/forms';
import { ApiDataService } from '../../_shared/services/api-data.service';
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
  projectData: any;
  loggedInUser: User;

  constructor(
    private formBuilder: FormBuilder,
    private apiDataService: ApiDataService,
    private authService: AuthService,
  ) {
    // initialize the formgroup
    this.form = this.formBuilder.group({
      projectName: [null],
      projectType: [null],
      projectDescription: [null],
    });

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

  createProject() {

    // set the form data that will be sent in the body of the request
    const project = this.form.getRawValue();
    console.log(project);
    this.apiDataService.createProject(project)
    .subscribe(
      res => {
        console.log(res);

      },
      err => {
        console.log(err);
      }
    );

  }

  getUserProjectList() {

    this.apiDataService.getUserProjectList(this.loggedInUser.id)
      .subscribe(
        res => {
          console.log(`project list for user  id ${this.loggedInUser.id}`);
          console.log(res);
          this.projectData = res;

        },
        err => {
          console.log(err);
        }
      );
  }

  selectProject(project: any) {
    console.log(project);
  }

}
