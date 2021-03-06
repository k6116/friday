import { Component, OnInit, OnDestroy, ViewChild, ElementRef, EventEmitter, Output } from '@angular/core';
import { ToolsService } from '../../_shared/services/tools.service';
import { ApiDataAdvancedFilterService, ApiDataOrgService } from '../../_shared/services/api-data/_index';
import { Subscription } from 'rxjs/Subscription';
import { ExcelExportService } from '../../_shared/services/excel-export.service';
import { AuthService } from '../../_shared/services/auth.service';
import { CacheService } from '../../_shared/services/cache.service';
import { Router, NavigationEnd } from '@angular/router';
import { FilterPipe } from '../../_shared/pipes/filter.pipe';
import { AdvancedFiltersTypeaheadService } from './services/advanced-filters-typeahead.service';
import { AdvancedFiltersDataService } from './services/advanced-filters-data.service';
import { AdvancedFiltersFTEService } from './services/advanced-filters-FTE.service';
import { AdvancedFiltersProjectSearchService } from './services/advanced-filters-project-search.service';
import { AdvancedFiltersPLCService } from './services/advanced-filters-plc.service';
import { AdvancedFiltersCheckboxesService } from './services/advanced-filters-checkboxes.service';

// import { start } from 'repl';
const moment = require('moment');

declare const require: any;

declare var $: any;
declare const Bloodhound;

@Component({
  selector: 'app-advanced-filters',
  templateUrl: './advanced-filters.component.html',
  styleUrls: ['./advanced-filters.component.css', '../../_shared/styles/common.css'],
  providers: [AdvancedFiltersDataService, AdvancedFiltersCheckboxesService, AdvancedFiltersFTEService, AdvancedFiltersProjectSearchService,
    AdvancedFiltersTypeaheadService, AdvancedFiltersPLCService, FilterPipe]
})

export class AdvancedFiltersComponent implements OnInit, OnDestroy {

  @ViewChild('filterStringVC') filterStringVC: ElementRef;
  @ViewChild('filterStringOw') filterStringOw: ElementRef;
  @ViewChild('hiddenInput') hiddenInput: ElementRef;

  @Output() selectedBom = new EventEmitter<any>();

  filterObject: any;      // main Object containing strings that's being send to the db
  advancedFilterData: any; // All projects on init using forkjoin
  // projects: any;
  projectTypes: any;
  projectStatuses: any;
  projectPriorities: any;
  plcStatuses: any;
  selectedProjectID: number;
  parents: any;
  children: any;
  noParents: boolean;
  noChildren: boolean;

  filterString: string;     // string for top search bar
  filterStringOwner: string; // string for owner search bar
  numProjectsDisplayString: string;  // string to show on the page (showing x of y projects)
  filteredProjectsCount: number;  // number of project currently displayed, if there is a filter set
  totalProjectsCount: number;  // total number of projects

  // local arrays for filterObject
  arrTypeID: any;
  arrOwnerEmail: any;
  arrStatusID: any;
  arrPriorityID: any;
  arrFamily: any; // combines Children and Parents for filterObject
  objPLC: any; // object containing all PLC info (newPLC) that's needed for filterObject
  plcSchedules: any; // contains PLC status name headers
  allManagers: any;
  managers: any;
  managerTeam: any[];
  holdProjects: number[]; // array of projectIDs that user wants to hold in the results table

  // Filter Results
  advancedFilteredResults: any;
  advancedFilteredResultsFlat: any; // for excel download

  // etc
  subscription2: Subscription; // for excel download
  showSpinner: boolean;
  showPage: boolean;
  showDashboard: boolean;
  showFilterCol: boolean;
  showDownloadingIcon: boolean;
  htmlElement: any;
  minDate: string;
  maxDate: string;
  fteMin: any; // for fte checkbox logic
  fteMax: any; // for fte checkbox logic

  // month
  fteDateFrom: any; // for FTE date range input - format yyyy-MM-dd required
  fteDateTo: any; // for FTE date range input - format yyyy-MM-dd required

  // TO-DO PAUL: REMOVE TEMP CODE
  showDashboardButton: boolean;

  // 'All' checkboxes - used with [(ngModel)]
  allProjectTypesCheckbox: boolean;
  allProjectPrioritiesCheckbox: boolean;
  allProjectOwnersCheckbox: boolean;
  allProjectStatusesCheckbox: boolean;
  allParentsCheckbox: boolean;
  allChildrenCheckbox: boolean;
  allPLCSchedulesCheckbox: boolean;

  constructor(
    private router: Router,
    private apiDataAdvancedFilterService: ApiDataAdvancedFilterService,
    private apiDataOrgService: ApiDataOrgService,
    private authService: AuthService,
    private cacheService: CacheService,
    private excelExportService: ExcelExportService,
    private toolsService: ToolsService,
    private advancedFiltersTypeaheadService: AdvancedFiltersTypeaheadService,
    private advancedFiltersCheckboxesService: AdvancedFiltersCheckboxesService,
    private advancedFiltersDataService: AdvancedFiltersDataService,
    private advancedFiltersFTEService: AdvancedFiltersFTEService,
    private advancedFiltersProjectSearchService: AdvancedFiltersProjectSearchService,
    private advancedFiltersPLCService: AdvancedFiltersPLCService
  ) {

    // TO-DO PAUL: REMOVE TEMP CODE
    if (this.authService.loggedInUser.email === 'paul_sung@keysight.com' ||
        this.authService.loggedInUser.email === 'tawanchai.schmitz@keysight.com' ||
        this.authService.loggedInUser.email === 'bill_schuetzle@keysight.com' ||
        this.authService.loggedInUser.email === 'bryan.cheung@keysight.com') {
          this.showDashboardButton = true;
        }

    // declare filter option object; NULLs ar REQUIRED
    this.filterObject = {
      PLCStatusIDs: '',       // num1,num2,num3,..
      PLCDateRanges: '',      // From1|To1, From2|To2, From3|To3,...
      ProjectName: '',        // name, name, name,..
      ProjectID: '',          // num,num,num,..
      ProjectTypeIDs: '',     // num,num,num,..
      ProjectStatusIDs: '',   // num,num,num,..
      ProjectPriorityIDs: '', // num,num,num,..
      ProjectOwnerEmails: '', // email, email, email,...
      FTEMin: 'NULL',         // 0
      FTEMax: 'NULL',         // 100
      FTEDateFrom: 'NULL',    // 2017-01-01
      FTEDateTo: 'NULL'       // 2017-01-01
    };

    // this.filterCheckedArray = [];
    this.arrTypeID = [];
    this.arrStatusID = [];   // adding 0 to show blanks
    this.arrPriorityID = []; // adding 0 to show blanks
    this.arrOwnerEmail = [];
    // this.arrChildren = [];
    // this.arrParents = [];
    this.arrFamily = [];
    this.objPLC = [];       // contains newPLC on plc status checked
    this.plcSchedules = []; // save clicked plc statuses
    this.fteMin = [];
    this.fteMax = [];
    this.minDate = '1900-01-01';
    this.maxDate = '2900-01-01';
    this.noParents = true;
    this.noChildren = true;

    // 'ALL'-checkboxes that default true
    this.allProjectTypesCheckbox = true;
    this.allProjectPrioritiesCheckbox = true;
    this.allProjectStatusesCheckbox = true;

    // For Excel Download
    this.subscription2 = this.cacheService.showDownloadingIcon.subscribe(show => {
      this.showDownloadingIcon = show;
    });

  }

  async ngOnInit() {

    // hide the footer until the page is ready to be rendered
    this.toolsService.hideFooter();

    // show the spinner
    this.showSpinner = true;

    // show results table, not dashboard
    this.showDashboard = false;

    // show filter column
    this.showFilterCol = true;

    // get data for all checkboxes
    await this.advancedFiltersDataService.getCheckboxData(this);

    await this.getAllProjects();

    this.initTypeahead();

    // hide the spinner
    this.showSpinner = false;

    // show page
    this.showPage = true;

    // show the footer
    this.toolsService.showFooter();

  }

  ngOnDestroy() {

    // for excel download
    this.subscription2.unsubscribe();

  }

  async getAllProjects() {

    // Initial results table should show all projects.
    // Therefore the filterObject should have ProjectTypeIDs, ProjectStatusIDs and ProjectPriorityIDs prefilled.

    // Set default checkbox values
    await this.initCheckboxValues();

    // Update filterObject with filtered checkbox values.
    // Leave the NULLs !
    this.filterObject = {
      PLCStatusIDs: '',       // num,num,num,..
      PLCDateRanges: '',      // From|To
      ProjectName: '',        // name,name,name...
      ProjectID: '',          // num,num,num,..
      ProjectTypeIDs: String(this.arrTypeID),
      ProjectStatusIDs: String(this.arrStatusID),
      ProjectPriorityIDs: String(this.arrPriorityID),
      ProjectOwnerEmails: '',
      FTEMin: 'NULL',
      FTEMax: 'NULL',
      FTEDateFrom: 'NULL',        // 2017/01/01
      FTEDateTo: 'NULL'           // 2017/01/01
    };

    // send to db
    await this.advancedFiltersDataService.advancedFilter(this, this.filterObject);

    // store the number of projects, to display in the page 'showing x of y projects'
    this.totalProjectsCount = this.advancedFilteredResults.length;

    // set/update the record count string (Showing X of Y Projects)
    this.setNumProjectsDisplayString();

  }

  initCheckboxValues() {

    // loop through filter groups and push them to array so they can be added to the filterObject
    for (let i = 0; i < this.projectStatuses.length; i++) {
      this.arrStatusID.push(this.projectStatuses[i].id);
    }

    for (let i = 0; i < this.projectTypes.length; i++) {
      this.arrTypeID.push(this.projectTypes[i].id);
    }

    for (let i = 0; i < this.projectPriorities.length; i++) {
      this.arrPriorityID.push(this.projectPriorities[i].id);
    }

    // Select All default true checkboxes
    this.selectAllProjectTypes(this.allProjectTypesCheckbox);
    this.selectAllProjectPriorities(this.allProjectPrioritiesCheckbox);
    this.selectAllProjectStatuses(this.allProjectStatusesCheckbox);

  }

  async initTypeahead() {

    const initProjectList = await this.advancedFiltersDataService.getTypeaheadData()
    .catch(err => {
      // console.log(err);
    });

    // Project Name Input
    // Need timeout because DOM only shows after all data has been retrieved and spinner is hidden
    setTimeout(() => {
      const typeahead = this.advancedFiltersTypeaheadService.initProjectTypeahead(this, initProjectList);
    }, 0);

    // Manager Name Input
    this.allManagers = this.getManagers('ron_nersesian@keysight.com');

  }

  // set/update the record count string (Showing X of Y Projects)
  setNumProjectsDisplayString() {

    // store the number of projects, to display in the page 'showing x of y projects'
    // this.totalProjectsCount = this.advancedFilteredResults.length;

    // no projects are displayed
    if (this.filteredProjectsCount === 0) {
      this.numProjectsDisplayString = `Showing 0 of ${this.totalProjectsCount} Projects`;
    // all projects are displayed
    } else if (this.filteredProjectsCount === this.totalProjectsCount) {
      this.numProjectsDisplayString = `Showing All ${this.totalProjectsCount} Projects`;
    // some projects are displayed (there is a filter)
    } else {
      this.numProjectsDisplayString = `Showing ${this.filteredProjectsCount} of ${this.totalProjectsCount} Projects`;
    }

  }

// PROJECT OWNERS

  async getManagers(managerEmailAddress: string) {
    this.managers = await this.apiDataOrgService.getManagementOrgStructure(managerEmailAddress).toPromise();
    const typeahead = this.advancedFiltersTypeaheadService.getManagerTypeahead(this, this.managers);
    // this.getManagerTypeahead(this.managers);
  }

  async getProjectOwnerSubordinates(managerEmailAddress: string) {
    this.managerTeam = await this.apiDataOrgService.getManagementOrgStructure(managerEmailAddress).toPromise();
    this.managerTeam[0].selected = true;
    this.checkIfAllProjectOwnersSelected();
  }

  onClearOwnerClick() {

    // reset string, manager array and scheckbox array
    this.filterStringOwner = undefined;
    this.managerTeam = [];
    this.arrOwnerEmail = [];

    // uncheck the 'All' button
    this.allProjectOwnersCheckbox = false;

    // reset db object
    this.filterObject.ProjectOwnerEmails = '';

    // Make the db call
    this.advancedFiltersDataService.advancedFilter(this, this.filterObject);

    // this.filterStringOwner.nativeElement.focus();

  }


// CHECKBOXES

  // Project Types
  async selectAllProjectTypes(checked: boolean) {

    for (let i = 0; i < this.projectTypes.length; i++) {
      this.projectTypes[i].selected = this.allProjectTypesCheckbox;
    }

    await this.advancedFiltersCheckboxesService.onAllProjectTypesCheck(this, checked);

    // convert array to string and save to filterObject
    this.filterObject.ProjectTypeIDs = String(this.arrTypeID);

    // console.log('on ALL checkbox clicked', this.filterObject.ProjectTypeIDs);

    // Make the db call
    this.advancedFiltersDataService.advancedFilter(this, this.filterObject);

  }

  checkIfAllProjectTypesSelected() {
    this.allProjectTypesCheckbox = this.projectTypes.every(function(item: any) {
      return item.selected === true;
    });
  }

  onProjectTypeCheckboxClick(event: any, id: string) {
    const checked = event.target.checked;

    if (checked === true) {
      // ADD ID to array
      this.arrTypeID.push(id);
    } else if (checked === false) {
      // find ID in array
      for (let i = 0; i < this.arrTypeID.length; i++) {
        // REMOVE from array
        if (this.arrTypeID[i] === id) {
          this.arrTypeID.splice(i, 1);
          break;
        }
      }
    }

    // Convert and save array to filterObject
    this.filterObject.ProjectTypeIDs = String(this.arrTypeID);

    // console.log('on individual checkbox click', this.filterObject.ProjectTypeIDs);

    // Make the db call
    this.advancedFiltersDataService.advancedFilter(this, this.filterObject);

  }

  // Project Status
  async selectAllProjectStatuses(checked: boolean) {
    // const checked = event.target.checked;

    for (let i = 0; i < this.projectStatuses.length; i++) {
      this.projectStatuses[i].selected = this.allProjectStatusesCheckbox;
    }

    await this.advancedFiltersCheckboxesService.onAllProjectStatusesCheck(this, checked);

    // convert array to string and save to filterObject
    this.filterObject.ProjectStatusIDs = String(this.arrStatusID);

    // Make the db call
    this.advancedFiltersDataService.advancedFilter(this, this.filterObject);

  }

  checkIfAllProjectStatusesSelected() {
    this.allProjectStatusesCheckbox = this.projectStatuses.every(function(item: any) {
      return item.selected === true;
    });
  }

  onProjectStatusCheckboxClick(event: any, id: string) {
    const checked = event.target.checked;

    if (checked === true) {
      // ADD ID to array
      this.arrStatusID.push(id);
    } else if (checked === false) {
      // find ID in array
      for (let i = 0; i < this.arrStatusID.length; i++) {
        // REMOVE from array
        if (this.arrStatusID[i] === id) {
          this.arrStatusID.splice(i, 1);
          break;
        }
      }
    }

    // Convert and save array to filterObject
    this.filterObject.ProjectStatusIDs = String(this.arrStatusID);

    // Make the db call
    this.advancedFiltersDataService.advancedFilter(this, this.filterObject);

  }

  // Project Priority
  async selectAllProjectPriorities(checked: boolean) {

    for (let i = 0; i < this.projectPriorities.length; i++) {
      this.projectPriorities[i].selected = this.allProjectPrioritiesCheckbox;
    }
    await this.advancedFiltersCheckboxesService.onAllProjectPriorities(this, checked);

    // convert array to string and save to filterObject
    this.filterObject.ProjectPriorityIDs = String(this.arrPriorityID);

    // Make the db call
    this.advancedFiltersDataService.advancedFilter(this, this.filterObject);

  }

  checkIfAllProjectPrioritiesSelected() {
    this.allProjectPrioritiesCheckbox = this.projectPriorities.every(function(item: any) {
      return item.selected === true;
    });
  }

  onProjectPriorityCheckboxClick(event: any, id: string) {
    const checked = event.target.checked;

    if (checked === true) {
      // ADD ID to array
      this.arrPriorityID.push(id);
    } else if (checked === false) {
      // find ID in array
      for (let i = 0; i < this.arrPriorityID.length; i++) {
        // REMOVE from array
        if (this.arrPriorityID[i] === id) {
          this.arrPriorityID.splice(i, 1);
          break;
        }
      }
    }

    // Convert and save array to filterObject
    this.filterObject.ProjectPriorityIDs = String(this.arrPriorityID);

    // Make the db call
    this.advancedFiltersDataService.advancedFilter(this, this.filterObject);

  }

  // Project Owners
  async selectAllProjectOwners(checked: boolean) {

    // update all .selcected to value of 'ALL'-checkbox
    for (let i = 0; i < this.managerTeam.length; i++) {
      this.managerTeam[i].selected = this.allProjectOwnersCheckbox;
    }

    if (this.allProjectOwnersCheckbox === true) {
      // update all .selcected to value of 'ALL'-checkbox
      for (let i = 0; i < this.managerTeam.length; i++) {
        this.arrOwnerEmail.push(this.managerTeam[i].EMAIL_ADDRESS);
      }
    } else if (this.allProjectOwnersCheckbox === false) {
      this.arrOwnerEmail = [];
    }

    // convert array to string and save to filterObject
    this.filterObject.ProjectOwnerEmails = String(this.arrOwnerEmail);

    // Make the db call
    this.advancedFiltersDataService.advancedFilter(this, this.filterObject);

  }

  checkIfAllProjectOwnersSelected() {
    this.allProjectOwnersCheckbox = this.managerTeam.every(function(item: any) {
      return item.selected === true;
    });
  }

  onCheckboxProjectOwnerClick(event: any, email: string) {
    const value = event.target.checked;

    // Consolidate all filters in one array
    if (value === true) {
      // ADD ID to array
      this.arrOwnerEmail.push(email);
    } else {
      // find ID in array
      for (let i = 0; i < this.arrOwnerEmail.length; i++) {
        // REMOVE from array
        if (this.arrOwnerEmail[i] === email) {
          this.arrOwnerEmail.splice(i, 1);
          break;
        }
      }
    }
    // console.log('Project Owners Array', this.arrOwnerEmail);

    // Convert the array to string and save to filterObject
    this.filterObject.ProjectOwnerEmails = String(this.arrOwnerEmail);
    // console.log('PROJECT OWNER STRING:', this.filterObject.ProjectOwnerEmails);

    // Make the db call
    this.advancedFiltersDataService.advancedFilter(this, this.filterObject);


  }

  // Parent
  async selectAllParents(event: any) {
    const checked = event.target.checked;

    for (let i = 0; i < this.parents.length; i++) {
      this.parents[i].selected = this.allParentsCheckbox;
    }

    // console.log('parents', this.parents);

    await this.advancedFiltersCheckboxesService.onAllParentsCheck(this, checked);

    // convert array to string and save to filterObject
    this.filterObject.ProjectID = String(this.arrFamily);

    // Make the db call
    this.advancedFiltersDataService.advancedFilter(this, this.filterObject);
  }

  checkIfAllParentsSelected() {
    this.allParentsCheckbox = this.parents.every(function(item: any) {
      return item.selected === true;
    });
  }

  onParentCheckboxClick(event: any, projectID: number) {
    const checked = event.target.checked;

    // first position in arrFamily is the clicked-on project -> saved in local typeahead.service
    // goal is to update arrFamily with parents then convert to filterObject String

    if (checked === true) {
      // ADD ID to array
      this.arrFamily.push(projectID);

    } else if (checked === false) {
      // find ID in array
      for (let i = 0; i < this.arrFamily.length; i++) {
        // REMOVE from array
        if (this.arrFamily[i] === projectID) {
          this.arrFamily.splice(i, 1);
          break;
        }
      }
    }

    // convert array to string and save to filterObject
    this.filterObject.ProjectID = String(this.arrFamily);
    // console.log('filterObject:', this.filterObject.ProjectID);

    // Make the db call
    this.advancedFiltersDataService.advancedFilter(this, this.filterObject);

    // clear the filter string
    this.filterString = undefined;
  }

  // Children
  async selectAllChildren(event: any) {
    const checked = event.target.checked;

    for (let i = 0; i < this.children.length; i++) {
      this.children[i].selected = this.allChildrenCheckbox;
    }

    await this.advancedFiltersCheckboxesService.onAllChildrenCheck(this, checked);

    // convert array to string and save to filterObject
    this.filterObject.ProjectID = String(this.arrFamily);

    // Make the db call
    this.advancedFiltersDataService.advancedFilter(this, this.filterObject);
  }

  checkIfAllChildrenSelected() {
    this.allChildrenCheckbox = this.children.every(function(item: any) {
      return item.selected === true;
    });
  }

  onChildCheckboxClick(event: any, projectID: number) {

    const checked = event.target.checked;

    // first position in arrFamily is the clicked-on project
    // goal is to update arrFamily with children

    if (checked === true) {
      // ADD ID to array
      this.arrFamily.push(projectID);

    } else if (checked === false) {
      // find ID in array
      for (let i = 0; i < this.arrFamily.length; i++) {
        // REMOVE from array
        if (this.arrFamily[i] === projectID) {
          this.arrFamily.splice(i, 1);
          break;
        }
      }
    }
    // convert array to string and save to filterObject
    this.filterObject.ProjectID = String(this.arrFamily);

    // Make the db call
    this.advancedFiltersDataService.advancedFilter(this, this.filterObject);

    // clear the filter string
    this.filterString = undefined;
  }

  // PLC Schedules
  async selectAllPLCSchedules() {

    // clear all plc inputs
    $('input.plcInput').val('');

    if (this.allPLCSchedulesCheckbox === true) {
      this.objPLC = [];
      for (let i = 0; i < this.plcStatuses.length; i++) {
        this.plcStatuses[i].selected = true;                                          // to enable plc schedules input boxes
        this.onPLCStatusCheck(i, this.allPLCSchedulesCheckbox, this.plcStatuses[i]); // to save data locally in objPLC
      }

    } else if (this.allPLCSchedulesCheckbox === false) {

      for (let i = 0; i < this.plcStatuses.length; i++) {
        this.plcStatuses[i].selected = false;                                         // to disable plc schedules input boxes
        this.onPLCStatusCheck(i, this.allPLCSchedulesCheckbox, this.plcStatuses[i]); // to save data locally in objPLC
      }

    }

  }

  checkIfAllPLCSchedulesSelected() {
    this.allPLCSchedulesCheckbox = this.plcStatuses.every(function(item: any) {
      return item.selected === true;
    });
  }

  async onPLCGoButtonClick() {

    // translate local plc object (objPLC) to filterObject strings
    this.filterObject = await this.advancedFiltersPLCService.getPLCFilterObject(this.objPLC, this.filterObject);

    // Make db call
    this.advancedFiltersDataService.advancedFilter(this, this.filterObject);
  }

  onPLCStatusCheck(index, checked: boolean, plcStatus: any) {
    const obj = this.objPLC;

    if (checked === true) {

      this.objPLC = this.advancedFiltersPLCService.onPLCStatusCheck(obj, plcStatus, index);

    } else if (checked === false) {

      this.objPLC = this.advancedFiltersPLCService.onPLCStatusUncheck(obj, index);

    }

  }

  onInputPLCChangeFrom(event: any, index) {

    const valid = event.target.validity.valid;  // Only allow dates from 1900 and complete dates
    const date = event.target.value;
    const obj = this.objPLC;

    if (valid === true ) {

      this.objPLC = this.advancedFiltersPLCService.onInputPLCChangeFrom(obj, date, index);

    }
  }

  onInputPLCChangeTo(event: any, index) {
    const valid = event.target.validity.valid;  // Only allow dates from 1900 and complete dates
    const date = event.target.value;
    const obj = this.objPLC;

    if (valid === true ) {

      this.objPLC = this.advancedFiltersPLCService.onInputPLCChangeTo(obj, date, index);

    }
  }

// FTE

  onFTEClearClick() {

    this.filterObject.FTEDateFrom = 'NULL';
    this.filterObject.FTEDateTo = 'NULL';
    this.filterObject.FTEMin = 'NULL';
    this.filterObject.FTEMax = 'NULL';

    // Make the db call
    this.advancedFiltersDataService.advancedFilter(this, this.filterObject);

    // Clear values of date ranges input
    this.fteDateFrom = '';
    this.fteDateTo = '';

    // unselect all toggle buttons -> removes PLC from reults table
    $('#option1').click();

  }

  async onFTEToggleSelected(event: any) {

    // Toggle between ALL - Current Month - Current Qtr - Current Yr
    await this.advancedFiltersFTEService.fteToggle(this, event.target.id);

    // Make the db call
    this.advancedFiltersDataService.advancedFilter(this, this.filterObject);

  }

  onFTEMaxChange(value: string) {

    if (value === '') {
    this.filterObject.FTEMax = 'NULL';
    } else {
    this.filterObject.FTEMax = value;
    }

    // Make the db call
    this.advancedFiltersDataService.advancedFilter(this, this.filterObject);
  }

  onFTEMinChange(value: string) {

    if (value === '') {
    this.filterObject.FTEMin = 'NULL';
    } else {
    this.filterObject.FTEMin = value;
    }

    // Make the db call
    this.advancedFiltersDataService.advancedFilter(this, this.filterObject);

  }

  async onInputFTEChange(event: any) {

    const valid = event.target.validity.valid;

     // Only allow dates from 2000 to current date
     if (valid === true ) {
      // save values to filterObject
      await this.advancedFiltersFTEService.onInputFTEChange(this, event);
      // Make the db call
      this.advancedFiltersDataService.advancedFilter(this, this.filterObject);
     }

  }

// SEARCH BAR

  async onSearchClick(filterString: string) {

    // send filterString through filterpipe and get fuzzy-search results
    const fuzzyFilterList = this.advancedFiltersTypeaheadService.getFilteredProjects(filterString);

    // get the string of ProjectIDs from the fuzzy search result
    await this.advancedFiltersProjectSearchService.onSearch(this, fuzzyFilterList);

    // Make the db call
    this.advancedFiltersDataService.advancedFilter(this, this.filterObject);

  }

  // on clicking the 'x' icon at the right of the search/filter input
  onClearSearchClick() {

    this.advancedFiltersProjectSearchService.onClear(this);

    $('.projects-filter-input').typeahead('val', '');

    // clear parents and children
    this.noParents = true;
    this.noChildren = true;

  }

// DASHBOARD

onDashboardClick() {

  // hide search input
  // hide filterbar
  $('#sidebar').toggleClass('active');
  $('.wrapper').toggleClass('dashboard-wrapper');

  // hide 'hide filterbar' button
  if ($('button.filter-toggle').attr('hidden')) {

    $('button.filter-toggle').attr('hidden', false);
    $('div.projects-search-string').attr('hidden', false);


  } else {

    $('button.filter-toggle').attr('hidden', true);
    $('div.projects-search-string').attr('hidden', true);

  }

}

  // RESET BUTTON

  async onResetButt() {

    // Clear inputs
    this.filterString = '';
    this.filterStringOwner = '';

    // Clear out all local arrays
    // this.filterCheckedArray = [];
    this.arrTypeID = [];
    this.arrPriorityID = [0];
    this.arrOwnerEmail = [];
    this.arrStatusID = [0];   // adding 0 as blank
    // this.arrParents = [];
    // this.arrChildren = [];
    this.arrFamily = [];
    this.fteMin = [];
    this.fteMax = [];
    this.minDate = '1900-01-01';
    this.maxDate = '2900-01-01';
    this.objPLC = [];
    this.plcSchedules = []; // save clicked plc statuses

    // 'ALL'-checkboxes that default true
    this.allProjectTypesCheckbox = true;
    this.allProjectPrioritiesCheckbox = true;
    this.allProjectStatusesCheckbox = true;

    // show spinner
    this.showSpinner = true;

    // clear results
    this.advancedFilteredResults = [];
    // Reset to default values
    await this.initCheckboxValues();

    // Update filterObject with filtered checkbox values.
    // Leave the NULLs !
    this.filterObject = {
      PLCStatusIDs: '',       // num,num,num,..
      PLCDateRanges: '',      // From|To
      ProjectName: '',        // name,name,name...
      ProjectID: '',          // num,num,num,..
      ProjectTypeIDs: String(this.arrTypeID),
      ProjectStatusIDs: String(this.arrStatusID),
      ProjectPriorityIDs: String(this.arrPriorityID),
      ProjectOwnerEmails: '',
      FTEMin: 'NULL',
      FTEMax: 'NULL',
      FTEDateFrom: 'NULL',        // 2017/01/01
      FTEDateTo: 'NULL'           // 2017/01/01
    };

    // Make the db call
    await this.advancedFiltersDataService.advancedFilter(this, this.filterObject);

    // Hide Spinner
    this.showSpinner = false;


  }

  // SHOW FILTER TOGGLE
  onShowFilterToggleClick() {

    $('#sidebar').toggleClass('active');

  }

  onResetButtonMouseEnter() {

    const options = {
      title: 'Reset to initial values',
      placement: 'left'
    };

    $('button.reset-button').tooltip(options);
    $('button.reset-button').tooltip('show');

  }

  onResetButtonMouseLeave() {

    $('button.export-button').tooltip('dispose');

  }

// EXPORT FUNCTION

  onExportButtonMouseEnter() {

    const options = {
      title: 'Download Excel File',
      placement: 'left'
    };

    $('button.export-button').tooltip(options);
    $('button.export-button').tooltip('show');

  }

  onExportButtonMouseLeave() {
    $('button.export-button').tooltip('dispose');
  }

  onExportClick() {

    // show the animated downloading icon
    this.showDownloadingIcon = true;

    // hide the tooltip
    $('button.export-button').tooltip('dispose');

    // set an array of objects representing the selected columns to export
    // NOTE: if this is null or undefined it will export all columns
    const colsToExport = [
          {
            name: 'ProjectName',
            alias: 'JarvisID'
          },
          {
            name: 'ProjectName',
          },
          {
            name: 'ProjectTypeName',
            alias: 'ProjectType'
          },
          {
            name: 'PriorityName',
            alias: 'Priority'
          },
          {
            name: 'ProjectStatusName',
            alias: 'Status'
          },
          {
            name: 'ProjectOwnerName',
            alias: 'ProjectOwner'
          },
          {
            name: 'TotalProjectFTE',
          },
          {
            name: 'Schedule',
          },
          {
            name: 'CreatedBy',
          },
          {
            name: 'CreationDate'
          },
          {
            name: 'LastUpdatedBy'
          },
          {
            name: 'LastUpdateDate'
          }
        ];

    // get the array of projects objects that are displayed
    // const projects = this.filterPipe.transform(this.projects, this.filterString, this.selectedFilter.columnName,
    //   {matchFuzzy: {on: this.selectedFilter.matchFuzzy, threshold: this.fuzzySearchThreshold},
    //   matchOptimistic: this.selectedFilter.matchOptimistic, matchExact: this.selectedFilter.matchExact});

    // export / download an Excel file with the projects data (server version)
    setTimeout(() => {
      this.excelExportService.exportServer('Jarvis Projects Export', 'Projects', this.advancedFilteredResultsFlat);
    }, 1000);
  }

  // TEST BUTTON
  onTestFormClick() {
    // const filterOptions = {
    //   PLCStatusIDs: '',
    //   PLCDateRanges: '',
    //   ProjectName: '',
    //   ProjectID: '',
    //   ProjectTypeIDs: '',
    //   ProjectStatusIDs: '',
    //   ProjectPriorityIDs: '',
    //   ProjectOwnerEmails: '',
    //   FTEMin: 'NULL',
    //   FTEMax: 'NULL',
    //   FTEDateFrom: 'NULL',
    //   FTEDateTo: 'NULL'
    // };
    const filterOptions = {
      PLCStatusIDs: '1,2,3,4,5,6',
      PLCDateRanges: 'NULL|NULL,2017-05-01|2019-09-01,2017-05-01|2019-09-01,NULL|NULL,NULL|NULL,2017-05-01|2019-09-01',
      ProjectName: '',
      ProjectID: '',
      ProjectTypeIDs: '1,2,3',
      ProjectStatusIDs: '',
      ProjectPriorityIDs: '1',
      ProjectOwnerEmails: '',
      FTEMin: '1.5',
      FTEMax: '5.5',
      FTEDateFrom: '2017-01-01',
      FTEDateTo: '2019-01-01'
    };

    // Make the db call
    this.advancedFiltersDataService.advancedFilter(this, this.filterObject);

    // this.getProjectOwnerSubordinates('henri_komrij@keysight.com');
    // this.getProjectChildren('Loki', 'Program', 'ethan_hunt@keysight.com');
    // this.getProjectParents('Arges70', 'NCI', 'ethan_hunt@keysight.com');

  }

}
