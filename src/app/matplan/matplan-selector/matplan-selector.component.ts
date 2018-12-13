import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { CacheService, ToolsService } from '../../_shared/services/_index';
import { ApiDataMatplanService, ApiDataSchedulesService } from '../../_shared/services/api-data/_index';

declare var $: any;
declare const Bloodhound;

@Component({
  selector: 'app-matplan-selector',
  templateUrl: './matplan-selector.component.html',
  styleUrls: ['./matplan-selector.component.css', '../../_shared/styles/common.css']
})
export class MatplanSelectorComponent implements OnInit {

  selectedProject: any; // for displaying project name in the view
  buildStatusList: any; // for offering list of build status options in the form
  buildScheduleForm: FormGroup;
  scheduleID: number = null;  // store the scheduleID from the database (if we have it) so we can initialize new records with it

  // title text for form validation
  dateTitle = 'Build Date is required';
  qtyTitle = 'Quantity must be a whole positive integer';
  createMatplanTitle = 'Build Schedule must be saved before matplan can be created';

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private cacheService: CacheService,
    private toolsService: ToolsService,
    private apiDataMatplanService: ApiDataMatplanService,
    private apiDataSchedulesService: ApiDataSchedulesService
  ) { }

  ngOnInit() {

    // initialize the build schedule formgroup
    this.buildScheduleForm = this.fb.group({
      buildScheduleArray: this.fb.array([])
    });

    // get list of build status types for displaying in view
    this.apiDataSchedulesService.indexBuildStatus().subscribe( res => this.buildStatusList = res);

    // get list of projects, and filter using typeahead in input box
    this.apiDataMatplanService.indexProjects().subscribe( res => {

       // initialize bloodhound suggestion engine with data
       const bh = new Bloodhound({
        datumTokenizer: Bloodhound.tokenizers.obj.whitespace('ProjectName'),
        queryTokenizer: Bloodhound.tokenizers.whitespace,
        local: res  // flat array of bills from api data service
      });

      // initialize typeahead using jquery
      $('.typeahead').typeahead({
        hint: true,
        highlight: true,
        minLength: 1
      },
      {
        name: 'project-names',
        displayKey: 'ProjectName',  // use this to select the field name in the query you want to display
        source: bh
      })
      .bind('typeahead:selected', (event, selection) => {
        // once something in the typeahead is selected, trigger this function
        this.onProjectSelect(selection);
      });

    });
  }

  testForm() {
    console.log('form');
    console.log(this.buildScheduleForm);
    console.log('values');
    console.log(this.buildScheduleForm.value);
  }

  resetForm() {
    // remove all controls in the formArray
    const formArray = <FormArray>this.buildScheduleForm.get('buildScheduleArray');
    while (formArray.length !== 0) {
      formArray.removeAt(0);
    }
    // reset the pristine/dirty flags in the form
    this.buildScheduleForm.reset();
  }

  async onProjectSelect(selectedProject: any) {
    this.resetForm(); // reset the form
    // when a project has been selected, show all available matplans for it
    this.selectedProject = selectedProject;
    const scheduleList = await this.apiDataMatplanService.showMatplans(selectedProject.ProjectID).toPromise();
    if (!Array.isArray(scheduleList) || !scheduleList.length) {
      // if response is null, undefined, or empty, don't try to initialize the form with values from the response
    } else {
      this.scheduleID = scheduleList[0].ScheduleID;
      this.initMatplanForm(scheduleList);
    }
  }

  initMatplanForm(scheduleList: any) {
    // get validator patterns
    const wholePositiveNumbers = this.toolsService.regexWholePositiveNumbers;

    // aliasing the newly created formArray
    const buildScheduleArray = <FormArray>this.buildScheduleForm.get('buildScheduleArray');
    scheduleList.forEach( schedule => {
      // because Schedules is mixing Build Schedule and PLC data in the same table, we need to parse the returned
      // records that are actually build schedules, and not PLC schedules
      if (schedule.BuildStatusID !== null) {
        const newForm = this.fb.group({
          scheduleID: schedule.ScheduleID,
          schedulesDetailID: schedule.SchedulesDetailID,
          projectID: schedule.ProjectID,
          currentRevision: schedule.CurrentRevision,
          notes: schedule.Notes,
          materialPlanID: schedule.MaterialPlanID,
          buildStatusID: [schedule.BuildStatusID, [Validators.required]],
          buildStatusName: schedule.BuildStatusName,
          needByDate: [schedule.NeedByDate, [Validators.required]],
          neededQuantity: [schedule.NeededQuantity, [Validators.required, Validators.pattern(wholePositiveNumbers)]],
          hasMatplan: schedule.MaterialPlanID ? true : false,
          scheduleUpdateDate: schedule.ScheduleUpdateDate,
          scheduleUpdatedBy: schedule.ScheduleUpdatedBy,
          schedulesDetailUpdateDate: schedule.SchedulesDetailUpdateDate,
          schedulesDetailUpdatedBy: schedule.SchedulesDetailUpdatedBy,
          matplanUpdateDate: schedule.MatplanUpdateDate,
          matplanUpdatedBy: schedule.MatplanUpdatedBy,
          matplanUpdatedByName: schedule.MatplanUpdatedByName,
          toBeDeleted: false
        });
        buildScheduleArray.push(newForm);
      }
    });
  }

  addBuildToSchedule() {
    // get validator patterns
    const wholePositiveNumbers = this.toolsService.regexWholePositiveNumbers;

    // aliasing the primary formArray
    const buildScheduleArray = <FormArray>this.buildScheduleForm.get('buildScheduleArray');

    // push an empty build schedule row
    buildScheduleArray.push(
      this.fb.group({
        scheduleID: this.scheduleID ? this.scheduleID : null,
        schedulesDetailID: null,
        projectID: this.selectedProject.ProjectID,
        currentRevision: 1,
        notes: null,
        materialPlanID: null,
        buildStatusID: [null, [Validators.required]],
        buildStatusName: null,
        needByDate: [null, [Validators.required]],
        neededQuantity: [null, [Validators.required, Validators.pattern(wholePositiveNumbers)]],
        hasMatplan: false,
        matplanUpdateDate: null,
        matplanUpdatedBy: null,
        matplanUpdatedByName: null,
        toBeDeleted: false
      })
    );
  }

  createMatplan(matplan: any) {
    const projectID = matplan.get('projectID').value;
    const buildStatusID = matplan.get('buildStatusID').value;

    // create the matplan
    this.apiDataMatplanService.createMatplan(projectID, buildStatusID).subscribe( res => {
      // return the new ID value and patch the form with this value
      matplan.get('materialPlanID').patchValue(res.materialPlanID);
      matplan.get('hasMatplan').patchValue(true);
      this.cacheService.raiseToast('success', `${res.message}`);
    },
    err => {
      this.cacheService.raiseToast('error', `${err.status}: ${err.statusText}`);
    });
  }

  editMatplan(matplan: any) {
    // send user to matplan-editor component
    this.router.navigate([`/main/matplan/edit/${matplan.get('materialPlanID').value}`]);
  }

  deleteBuildSchedule({schedule, index}) {
    const isDatabaseValue = schedule.get('schedulesDetailID').value;
    if (isDatabaseValue) {
      // if the record to be deleted does have a ID in the database, then we need to mark it for deletion
      schedule.get('toBeDeleted').patchValue(true);
    } else {
      // if it's not a database value, then just kill it in the frontend
      const formArray = <FormArray> this.buildScheduleForm.get('buildScheduleArray');
      formArray.removeAt(index);
    }
  }

  onBuildScheduleSave() {
    const form = this.buildScheduleForm.value;
    const formArray = this.buildScheduleForm.get('buildScheduleArray').value;

    const formIsValid = this.validateBuildScheduleForm(formArray);

    if (formIsValid) {
      // send the data to the database
      this.apiDataSchedulesService.updateBuildScheduleNew(form).subscribe( res => {
        this.cacheService.raiseToast('success', `${res.message}`);
        this.onProjectSelect(this.selectedProject);
      },
      err => {
        this.cacheService.raiseToast('error', `${err.status}: ${err.statusText}`);
      });
    } else {
      this.cacheService.raiseToast('error', 'Cannot have 2 builds with the same name');
    }
  }

  validateBuildScheduleForm(formArray: any) {
    // validate to ensure we don't have 2 of the same build
    const buildTypes = [];
    for (let i = 0; i < formArray.length; i++) {
      if (buildTypes.includes(formArray[i].buildStatusID)) {
        // multiple builds of the same type, so the form is invalid
        return false;
      } else {
        buildTypes.push(formArray[i].buildStatusID);
      }
    }

    return true;
  }

}
