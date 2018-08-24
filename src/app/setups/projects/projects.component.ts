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
  projectNameRegex: any;
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
  typeSortCoefficient = -1;
  nameSortCoefficient = -1;

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

  orderByType(type: boolean) {

    if (type) {
      this.typeSortCoefficient = -this.typeSortCoefficient;
            this.projectList.sort((a, b) =>
            a.ProjectTypeName < b.ProjectTypeName ? -this.typeSortCoefficient
            : a.ProjectTypeName > b.ProjectTypeName ? this.typeSortCoefficient : 0);
      } else {
        this.nameSortCoefficient = -this.nameSortCoefficient;
            this.projectList.sort((a, b) =>
            a.ProjectName < b.ProjectName ? -this.nameSortCoefficient
            : a.ProjectName > b.ProjectName ? this.nameSortCoefficient : 0);
      }
      this.searchProjects =  ' '; // Refresh Project Search
  }

  onSearchChanged(event: any) {
      this.project = null;
      this.showProjectCard = false;
      this.showScheduleCard = false;
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

  getProjects() {
    this.apiDataProjectService.getProjects()
    .subscribe(
      res => {
        this.projectList = res;
        this.searchProjects = ' '; // this will avoid shoing a blank list of projects.
      },
      err => {
        this.cacheService.raiseToast('error', `Unable to Obtain Project: ${err}`);
      }
    );
  }

  getSelectionChoices() {

    this.apiDataProjectService.getProjectTypesList()
    .subscribe(
      res => {
        this.projectTypeChoices = res;
      },
      err => {
        this.cacheService.raiseToast('error', `Unable to Obtain Project Types: ${err}`);
      }
    );

    this.apiDataProjectService.getProjectDepartments()
    .subscribe(
      res => {
        this.departmentChoices = res;
      },
      err => {
        this.cacheService.raiseToast('error', `Unable to Obtain Project Departments: ${err}`);
      }
    );

    this.apiDataProjectService.getProjectGroups()
    .subscribe(
      res => {
        this.groupChoices = res;
      },
      err => {
        this.cacheService.raiseToast('error', `Unable to Obtain Project Groups: ${err}`);
      }
    );

    this.apiDataProjectService.getProjectPriorities()
    .subscribe(
      res => {
        this.priorityChoices = res;
      },
      err => {
        this.cacheService.raiseToast('error', `Unable to Obtain Project Priorities: ${err}`);
      }
    );

    this.apiDataProjectService.getProjectPLCStatus()
    .subscribe(
      res => {
        this.plcStatusChoices = res;
      },
      err => {
        this.cacheService.raiseToast('error', `Unable to Obtain PLC Status: ${err}`);
      }
    );
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
        projectName: this.searchProjects ? this.searchProjects.trim().replace(/[^a-zA-Z0-9\\s\\-]/gm, '') : null
      });
      this.cacheService.raiseToast('info', 'New Project Entry Form Created.');
  }

  onProjectClick(project: any) {

    this.project = project;
    this.showProjectCard = true;
    this.showScheduleCard = true;

    this.form.patchValue(
      {
        projectID: this.project.ProjectID,
        projectName:  this.project.ProjectName,
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

  onSaveProjectClick() {

    // Save: Either Update or Create

    if (this.form.value.projectID > 0) {
    this.apiDataProjectService.updateProjectSetup(this.form.value, this.authService.loggedInUser.id)
      .subscribe(
        res => {
          this.cacheService.raiseToast('success', 'Project Updated Successfully');
          this.getProjects();
        },
        err => {
          this.cacheService.raiseToast('error', `Project Schedule Failed to Update: ${err}`);
        }
      );
    } else {

      this.apiDataProjectService.createProjectSetup(this.form.value, this.authService.loggedInUser.id)
      .subscribe(
        res => {
          this.form.patchValue(
            {
              projectID: res.newProjectID
            });
            this.schedule = [];
            this.scheduleId = 0;
            this.createDefaultScheduleRow();
            this.showScheduleCard = true;
            this.cacheService.raiseToast('success', 'New Project Created');
            this.getProjects();
        },
        err => {
          this.cacheService.raiseToast('error', `Create Project Failed: ${err}`);
        }
      );
    }
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
              this.cacheService.raiseToast('success', 'Project Removed Successfully');
              this.project = null;
              this.schedule = null;
              this.showProjectCard = false;
              this.showScheduleCard = false;
              this.getProjects();
              deleteModalSubscription.unsubscribe();
            },
            err => {
              this.cacheService.raiseToast('error', `Delete Propject Failed: ${err}`);
            }
          );
        }
      });
  }

  createDefaultScheduleRow() {
    if (this.schedule === null) {
      this.schedule = [];
    }
    this.schedule.push({
      ScheduleID: this.scheduleId,
      ProjectID: this.project ? this.project.ProjectID : this.form.value.projectID,
      CurrentRevision: 0,
      RevisionNotes: '',
      PLCStatusID: 0,
      PLCDate: moment().format('MM/DD/YYYY'),
      Notes: '',
      DeleteRow: 0
    });
  }

  onAddScheduleRow() {

    this.createDefaultScheduleRow();
  }

  onSaveSchedule() {

    // If detail records exist, update the schedule
    if (this.schedule.filter(function(x) { return x.DeleteRow === false || x.DeleteRow === 0; }).length > 0) {
    this.apiDataSchedulesService.updateProjectScheduleXML(this.schedule, this.revisionNotes)
      .subscribe(
        res => {
          if (this.schedule[0].CurrentRevision === 0) { this.schedule[0].CurrentRevision = 1; } // must have been a new schedule
          this.cacheService.raiseToast('success', 'Project Schedule Saved');
        },
        err => {
          this.cacheService.raiseToast('error', `Unable to Update Project Schedule: ${err}`);
        }
      );
    } else {
      // no detail records so remove the schedule header record
      this.apiDataSchedulesService.destroyScheduleSP(this.scheduleId)
      .subscribe(
        res => {
          this.cacheService.raiseToast('success', 'Project Schedule Removed');
        },
        err => {
          this.cacheService.raiseToast('error', `Unable to Remove Project Schedule: ${err}`);
        }
      );
    }
    this.getSchedule();
  }

  getSchedule() {
    this.apiDataSchedulesService.getProjectSchedule(this.project ? this.project.ProjectID : this.form.value.projectID)
    .subscribe(
      res => {
        if (res.length > 0) {

        this.schedule = res;
        this.schedule.forEach(element => {
          element.PLCDate = moment(element.PLCDate).format('YYYY-MM-DD');
        });

        this.revisionNotes = res[0].RevisionNotes;
        this.scheduleId = res[0].ScheduleID;
        } else {
        this.schedule = [];
        this.scheduleId = 0;
        this.createDefaultScheduleRow();
      }
      },
      err => {
        this.cacheService.raiseToast('error', `Unable to Obtain Project Schedule: ${err}`);
      }
    );
  }
}
