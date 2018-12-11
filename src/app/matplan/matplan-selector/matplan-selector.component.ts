import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
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

  constructor(
    private router: Router,
    private fb: FormBuilder,
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

  async onProjectSelect(selectedProject: any) {
    // when a project has been selected, show all available matplans for it
    console.log(selectedProject);
    this.selectedProject = selectedProject;
    const matplanList = await this.apiDataMatplanService.showMatplans(selectedProject.ProjectID).toPromise();
    this.initMatplanForm(matplanList);
  }

  initMatplanForm(matplanList: any) {
    console.log(this.buildStatusList);
    // aliasing the newly created formArray
    const buildScheduleArray = <FormArray>this.buildScheduleForm.get('buildScheduleArray');
    matplanList.forEach( matplan => {
      const newForm = this.fb.group({
        scheduleID: matplan.ScheduleID,
        projectID: matplan.ProjectID,
        currentRevision: matplan.CurrentRevision,
        notes: matplan.Notes,
        materialPlanID: matplan.MaterialPlanID,
        buildStatusID: matplan.BuildStatusID,
        buildStatusName: matplan.BuildStatusName,
        needByDate: matplan.NeedByDate,
        neededQuantity: matplan.NeededQuantity,
        hasMatplan: true,
        scheduleUpdateDate: matplan.ScheduleUpdateDate,
        scheduleUpdatedBy: matplan.ScheduleUpdatedBy,
        schedulesDetailUpdateDate: matplan.SchedulesDetailUpdateDate,
        schedulesDetailUpdatedBy: matplan.SchedulesDetailUpdatedBy,
        matplanUpdateDate: matplan.MatplanUpdateDate,
        matplanUpdatedBy: matplan.MatplanUpdatedBy,
        matplanUpdatedByName: matplan.MatplanUpdatedByName
      });
      buildScheduleArray.push(newForm);
    });
  }

  addBuildToSchedule() {
    // aliasing the primary formArray
    const buildScheduleArray = <FormArray>this.buildScheduleForm.get('buildScheduleArray');

    // push an empty build schedule row
    buildScheduleArray.push(
      this.fb.group({
        scheduleID: null,
        projectID: this.selectedProject.ProjectID,
        currentRevision: 1,
        notes: null,
        materialPlanID: null,
        buildStatusID: null,
        buildStatusName: null,
        needByDate: null,
        neededQuantity: null,
        hasMatplan: false,
        matplanUpdateDate: null,
        matplanUpdatedBy: null,
        matplanUpdatedByName: null
      })
    );
  }

  createMatplan(matplan: any) {
    console.log(matplan);
  }

  editMatplan(matplan: any) {
    // send user to matplan-editor component
    this.router.navigate([`/main/matplan/edit/${matplan.get('materialPlanID').value}`]);
  }

  onBuildScheduleSave() {
    console.log(this.buildScheduleForm.value);
    this.apiDataSchedulesService.updateBuildScheduleNew(this.buildScheduleForm.value).subscribe( res => {
      console.log('yay');
    });
  }

}
