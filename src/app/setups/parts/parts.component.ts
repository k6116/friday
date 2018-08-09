import { Component, OnInit } from '@angular/core';
import { ApiDataSchedulesService, ApiDataPartService, ApiDataProjectService,
  ApiDataEmployeeService } from '../../_shared/services/api-data/_index';
import { CacheService } from '../../_shared/services/cache.service';
import { AuthService } from '../../_shared/services/auth.service';
import * as moment from 'moment';
import { FormBuilder, FormGroup, Validators  } from '@angular/forms';

@Component({
  selector: 'app-parts',
  templateUrl: './parts.component.html',
  styleUrls: ['./parts.component.css', '../../_shared/styles/common.css']
})


export class PartSetupComponent implements OnInit {
  form: FormGroup;
  searchParts: string;
  partList: any;
  part: any;
  schedule: any;
  showPartCard: boolean;
  showScheduleCard: boolean;
  partTypeChoices: any;
  designerChoices: any;
  plannerChoices: any;
  buildStatusChoices: any;
  revisionNotes: string;
  scheduleId: number;

  constructor(
    private formBuilder: FormBuilder,
    private apiDataSchedulesService: ApiDataSchedulesService,
    private apiDataPartService: ApiDataPartService,
    private apiDataProjectService: ApiDataProjectService,
    private apiDataEmployeeService: ApiDataEmployeeService,
    private authService: AuthService,
    private cacheService: CacheService
  ) { }

  ngOnInit() {

    this.initFormValues();
    this.getParts();
    this.getSelectionChoices();
  }

  initFormValues() {
    this.form = this.formBuilder.group({
    partID: [null, [Validators.required]],
    partName: [null, [Validators.required]],
    description: [null, [Validators.required]],
    chipXDim: [null, [Validators.required]],
    chipYDim: [null, [Validators.required]],
    partTypeID: [null, [Validators.required]],
    departmentID: [null, [Validators.required]],
    partStatus: [null, [Validators.required]],
    designerEmployeeID: [null, [Validators.required]],
    plannerEmployeeID: [null, [Validators.required]],
    dutFamily: [null, [Validators.required]],
    oracleItemNumber: [null, [Validators.required]],
    oracleItemStatus: [null, [Validators.required]],
    oracleDescription: [null, [Validators.required]],
    oracleDWSFDeptWSF: [null, [Validators.required]],
    oracleICATItemCategories: [null, [Validators.required]],
    notes: [null, [Validators.required]],
    tags: [null, [Validators.required]],
    itemStatus: [null, [Validators.required]],
    createdBy: [null, [Validators.required]],
    createdAt: [null, [Validators.required]],
    updatedBy: [null, [Validators.required]],
    updatedAt: [null, [Validators.required]]
  });
}
  onCreatePartClick() {

    this.showPartCard = true;
    this.showScheduleCard = false;

    this.schedule = null;
    this.scheduleId = 0;
    this.revisionNotes = '';
    this.part = null;

    this.form.reset();
    this.form.patchValue(
      {
        partName: this.searchParts
      });

  }

  onSavePartClick() {

    if (this.form.value.partID > 0) { // EXISTING PART
    this.apiDataPartService.updatePart(this.form.value, this.authService.loggedInUser.id)
      .subscribe(
        res => {
        },
        err => {
          console.log(err);
        }
      );
    } else { // NEW PART

      this.apiDataPartService.createPart(this.form.value, this.authService.loggedInUser.id)
      .subscribe(
        res => {
          this.form.patchValue(
            {
              partID: res.newPart.id
            });
        },
        err => {
          console.log(err);
        }
      );
    }
    this.getParts();
  }

  onDeletePartClick() {

      // emit confirmation modal after they click request button
      this.cacheService.confirmModalData.emit(
        {
          title: 'Delete Part Confirmation',
          message: `Are you sure you want to delete ${this.part.PartName} ?`,
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
          this.apiDataPartService.deletePart(this.part.PartID, this.scheduleId, this.authService.loggedInUser.id)
          .subscribe(
            del => {
              console.log('part deleted');
              this.part = null;
              this.schedule = null;
              this.showPartCard = false;
              this.showScheduleCard = false;
              this.getParts();
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
      PartID: this.part.PartID,
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
    this.apiDataSchedulesService.updatePartSchedule(this.schedule, this.revisionNotes, this.authService.loggedInUser.id)
      .subscribe(
        res => {
          console.log('Saved Part Schedule');
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

  getParts() {
    this.apiDataPartService.getParts()
    .subscribe(
      res => {
        console.log('Parts List:', this.partList);
        this.partList = res;
      },
      err => {
        console.log(err);
      }
    );
  }

  getSelectionChoices() {

    this.apiDataPartService.getPartTypes()
    .subscribe(
      res => {
        console.log('Part Types:', res);
        this.partTypeChoices = res;
      },
      err => {
        console.log(err);
      }
    );

    this.apiDataEmployeeService.getDesigners()
    .subscribe(
      res => {
        console.log('Designers:', res);
        this.designerChoices = res;
      },
      err => {
        console.log(err);
      }
    );

    this.apiDataEmployeeService.getPlanners()
    .subscribe(
      res => {
        console.log('Planners:', res);
        this.plannerChoices = res;
      },
      err => {
        console.log(err);
      }
    );

    this.apiDataProjectService.getBuildStatus().subscribe(
      res => {
        console.log('Build Status:', res);
        this.buildStatusChoices = res;
      },
      err => {
        console.log(err);
      });
  }

  getSchedule() {
    this.apiDataSchedulesService.getPartSchedule(this.part.PartID)
    .subscribe(
      res => {
        if (res.length > 0) {
        this.schedule = res;
        this.revisionNotes = res[0].RevisionNotes;
        this.scheduleId = res[0].ScheduleID;
        console.log('Part Schedule:', this.schedule);
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

  onPartClick(part: any) {

    this.part = part;
    this.showPartCard = true;
    this.showScheduleCard = true;
    console.log(part);

    this.form.patchValue(
      {
        partID: this.part.PartID,
        partName: this.part.PartName,
        description: this.part.Description,
        chipXDim: this.part.ChipXDim,
        chipYDim: this.part.ChipYDim,
        partTypeID: this.part.PartTypeID,
        departmentID: this.part.DepartmentID,
        partStatus: this.part.PartStatus,
        designerEmployeeID: this.part.DesignerEmployeeID,
        plannerEmployeeID: this.part.PlannerEmployeeID,
        dutFamily: this.part.DUTFamily,
        oracleItemNumber: this.part.OracleItemNumber,
        oracleItemStatus: this.part.OracleItemStatus,
        oracleDescription: this.part.OracleDescription,
        oracleDWSFDeptWSF: this.part.OracleDWSFDeptWSF,
        oracleICATItemCategories: this.part.OracleICATItemCategories,
        notes: this.part.Notes,
        tags: this.part.Tags,
        itemStatus: this.part.ItemStatus,
        createdBy: this.part.CreatedBy,
        createdAt: this.part.CreationDate,
        updatedBy: this.part.LastUpdatedBy,
        updatedAt: this.part.LastUpdateDate
      });

    this.getSchedule();
  }

  onSearchInputChange(event: any) {
    if (this.searchParts.length === 0) {
      this.showPartCard = false;
      this.showScheduleCard = false;
    }
  }

}
