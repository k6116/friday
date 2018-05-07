import { Component, OnInit, AfterViewInit, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { trigger, state, style, transition, animate, keyframes, group } from '@angular/animations';
import { ToolsService } from '../../_shared/services/tools.service';
import { FormGroup, FormArray, FormControl, Validators, FormBuilder } from '@angular/forms';
import { ApiDataService } from '../../_shared/services/api-data.service';
import { AppDataService } from '../../_shared/services/app-data.service';
import { AuthService } from '../../auth/auth.service';

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

  constructor(
    private formBuilder: FormBuilder,
    private apiDataService: ApiDataService,
    private appDataService: AppDataService,
    private authService: AuthService,
  ) {
     // initialize the formgroup
     this.form = this.formBuilder.group({
      projectName: [null],
      // projectType: [null],
      projectDescription: [null],
      projectNotes: [null],
    });
   }

  ngOnInit() {
     // get the user id
     this.userID = this.authService.loggedInUser ? this.authService.loggedInUser.id : null;
  }

  createProject() {

    // set the form data that will be sent in the body of the request
    const project = this.form.getRawValue();
    console.log(project);
    console.log('UserID: ' + this.userID);
    this.apiDataService.createProject(project, this.userID)
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

}

