import { Component, OnInit } from '@angular/core';
import { ApiDataSchedulesService, ApiDataProjectService,
  ApiDataEmployeeService } from '../../_shared/services/api-data/_index';
import { CacheService } from '../../_shared/services/cache.service';
import { AuthService } from '../../_shared/services/auth.service';
import * as moment from 'moment';
import { FormBuilder, FormGroup, Validators  } from '@angular/forms';

@Component({
  selector: 'app-projects',
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.css', '../../_shared/styles/common.css']
})
export class ProjectsSetupsComponent implements OnInit {

  form: FormGroup;
  searchProjects: string;
  projectList: any;
  project: any;
  schedule: any;
  showProjectCard: boolean;
  showScheduleCard: boolean;

  projectTypeChoices: any;
  departmentChoices: any;
  groupChoices: any;
  priorityChoices: any;
  plcStatusChoices: any;

  revisionNotes: string;
  scheduleId: number;

  constructor(
    private formBuilder: FormBuilder,
    private apiDataSchedulesService: ApiDataSchedulesService,
    private apiDataProjectService: ApiDataProjectService,
    private apiDataEmployeeService: ApiDataEmployeeService,
    private authService: AuthService,
    private cacheService: CacheService
  ) { }

  ngOnInit() {

    this.initFormValues();
    this.getProjects();
    this.getSelectionChoices();
  }

  initFormValues() {
    this.form = this.formBuilder.group({
    projectID: [null, [Validators.required]],
    projectName: [null, [Validators.required]],
    projectTypeID: [null, [Validators.required]],
    active: [null, [Validators.required]],
    planOfRecord: [null, [Validators.required]],
    description: [null, [Validators.required]],
    notes: [null, [Validators.required]],
    departmentID: [null, [Validators.required]],
    groupID: [null, [Validators.required]],
    priorityID: [null, [Validators.required]],
    projectNumber: [null, [Validators.required]],
    ibo: [null, [Validators.required]],
    mu: [null, [Validators.required]],
    createdBy: [null, [Validators.required]],
    createdAt: [null, [Validators.required]],
    updatedBy: [null, [Validators.required]],
    updatedAt: [null, [Validators.required]]
  });
}
  onCreateProjectClick() {

    this.showProjectCard = true;
    this.showScheduleCard = false;

    this.schedule = null;
    this.scheduleId = 0;
    this.revisionNotes = '';
    this.project = null;

    this.form.reset();
    this.form.patchValue(
      {
        projectName: this.searchProjects
      });

  }

  onSaveProjectClick() {

    if (this.form.value.projectID > 0) { // EXISTING PROJECT
    this.apiDataProjectService.updateProjectSetup(this.form.value, this.authService.loggedInUser.id)
      .subscribe(
        res => {
        },
        err => {
          console.log(err);
        }
      );
    } else { // NEW PROJECT

      this.apiDataProjectService.createProjectSetup(this.form.value, this.authService.loggedInUser.id)
      .subscribe(
        res => {
          this.form.patchValue(
            {
              projectID: res.newProjectID
            });
        },
        err => {
          console.log(err);
        }
      );
    }
    this.getProjects();
  }

  onDeleteProjectClick() {

      // emit confirmation modal after they click request button
      this.cacheService.confirmModalData.emit(
        {
          title: 'Delete Project Confirmation',
          message: `Are you sure you want to delete ${this.project.ProjectName} ?`,
          iconClass: 'fa-exclamation-triangle',
          iconColor: 'rgb(193, 193, 27)',
          closeButton: true,
          allowOutsideClickDismiss: true,
          allowEscKeyDismiss: true,
          buttons: [
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
          ]
        }
      );
      const deleteModalSubscription = this.cacheService.confirmModalResponse.subscribe( res => {
        if (res) {
          this.apiDataProjectService.deleteProjectSetup(this.project.ProjectID, this.scheduleId, this.authService.loggedInUser.id)
          .subscribe(
            del => {
              console.log('project deleted');
              this.project = null;
              this.schedule = null;
              this.showProjectCard = false;
              this.showScheduleCard = false;
              this.getProjects();
              deleteModalSubscription.unsubscribe();
            },
            err => {
              console.log(err);
            }
          );
        }
      });
  }

  createDefaultScheduleRow() {
    this.schedule.push({
      ScheduleID: this.scheduleId,
      ProjectID: this.project.ProjectID,
      CurrentRevision: 0,
      RevisionNotes: '',
      NeedByDate: new Date(),
      NeededQuantity: 0,
      BuildStatusID: 0,
      Notes: '',
      DeleteRow: 0
    });
  }

  onAddScheduleRow() {
    if (this.schedule === null) {
        this.schedule = [];
    }
    this.createDefaultScheduleRow();
  }

  onSaveSchedule() {

    if (this.schedule.filter(function(x) { return x.DeleteRow === false || x.DeleteRow === 0; }).length > 0) {
    this.apiDataSchedulesService.updateProjectSchedule(this.schedule, this.revisionNotes, this.authService.loggedInUser.id)
      .subscribe(
        res => {
          console.log('Saved Project Schedule');
        },
        err => {
          console.log(err);
        }
      );
    } else {
      this.apiDataSchedulesService.destroySchedule(this.scheduleId, this.authService.loggedInUser.id)
      .subscribe(
        res => {
          console.log('Deleted Schedule');
        },
        err => {
          console.log(err);
        }
      );
    }
    this.getSchedule();
  }

  getProjects() {
    this.apiDataProjectService.getProjects()
    .subscribe(
      res => {
        console.log('Projects List:', this.projectList);
        this.projectList = res;
      },
      err => {
        console.log(err);
      }
    );
  }

  getSelectionChoices() {

    this.apiDataProjectService.getProjectTypesList()
    .subscribe(
      res => {
        console.log('Project Types:', res);
        this.projectTypeChoices = res;
      },
      err => {
        console.log(err);
      }
    );

    this.apiDataProjectService.getProjectDepartments()
    .subscribe(
      res => {
        console.log('Project Departments:', res);
        this.departmentChoices = res;
      },
      err => {
        console.log(err);
      }
    );

    this.apiDataProjectService.getProjectGroups()
    .subscribe(
      res => {
        console.log('Project Groups:', res);
        this.groupChoices = res;
      },
      err => {
        console.log(err);
      }
    );

    this.apiDataProjectService.getProjectPriorities()
    .subscribe(
      res => {
        console.log('Project Priorities:', res);
        this.priorityChoices = res;
      },
      err => {
        console.log(err);
      }
    );

    this.apiDataProjectService.getProjectPLCStatus()
    .subscribe(
      res => {
        console.log('Project PLC Status:', res);
        this.plcStatusChoices = res;
      },
      err => {
        console.log(err);
      }
    );
  }

  getSchedule() {
    this.apiDataSchedulesService.getProjectSchedule(this.project.ProjectID)
    .subscribe(
      res => {
        if (res.length > 0) {
        this.schedule = res;
        this.revisionNotes = res[0].RevisionNotes;
        this.scheduleId = res[0].ScheduleID;
        console.log('Project Schedule:', this.schedule);
      } else {
        this.schedule = [];
        this.scheduleId = 0;
        this.createDefaultScheduleRow();
      }
      },
      err => {
        console.log(err);
      }
    );
  }

  onProjectClick(project: any) {

    this.project = project;
    this.showProjectCard = true;
    this.showScheduleCard = true;
    console.log(project);

    this.form.patchValue(
      {
        projectID: this.project.ProjectID,
        projectName: this.project.ProjectName,
        projectTypeID: this.project.ProjectTypeID,
        active: this.project.Active,
        planOfRecord: this.project.PlanOfRecordFlag,
        description: this.project.Description,
        notes: this.project.Notes,
        departmentID: this.project.DepartmentID,
        groupID: this.project.GroupID,
        priorityID: this.project.PriorityID,
        projectNumber: this.project.ProjectNumber,
        ibo: this.project.IBO,
        mu: this.project.MU,
        createdBy: this.project.CreatedBy,
        createdAt: this.project.CreationDate,
        updatedBy: this.project.LastUpdatedBy,
        updatedAt: this.project.LastUpdateDate
      });
    this.getSchedule();
  }

  onSearchInputChange(event: any) {
    if (this.searchProjects.length === 0) {
      this.showProjectCard = false;
      this.showScheduleCard = false;
    }
  }
}
