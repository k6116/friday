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

// import { start } from 'repl';
const moment = require('moment');

declare const require: any;

declare var $: any;
declare const Bloodhound;

export interface NewPLC {
  index: number;
  PLCStatusID: string;
  PLCStatusName: string;
  PLCDateFrom: string;
  PLCDateTo: string;
}

@Component({
  selector: 'app-advanced-filters',
  templateUrl: './advanced-filters.component.html',
  styleUrls: ['./advanced-filters.component.css', '../../_shared/styles/common.css'],
  providers: [AdvancedFiltersDataService, AdvancedFiltersFTEService, AdvancedFiltersProjectSearchService, AdvancedFiltersTypeaheadService,
    AdvancedFiltersPLCService, FilterPipe]
})

export class AdvancedFiltersComponent implements OnInit, OnDestroy {

  @ViewChild('filterStringVC') filterStringVC: ElementRef;
  @ViewChild('filterStringOw') filterStringOw: ElementRef;
  @ViewChild('hiddenInput') hiddenInput: ElementRef;

  @Output() selectedBom = new EventEmitter<any>();

  filterObject: any;      // main Object containing strings that's being send to the db
  advancedFilterData: any; // All projects on init using forkjoin
  projects: any;
  projectTypes: any;
  projectStatuses: any;
  projectPriorities: any;
  plcStatuses: any;
  selectedProjectID: number;
  parents: any;
  children: any;

  filterString: string;     // string for top search bar
  filterStringOwner: string; // string for owner search bar
  filterCheckedArray: any; // array to clear out owners
  numProjectsDisplayString: string;  // string to show on the page (showing x of y projects)
  filteredProjectsCount: number;  // number of project currently displayed, if there is a filter set
  totalProjectsCount: number;  // total number of projects

  // Arrays for filterObject
  arrTypeID: any;
  arrOwnerEmail: any;
  arrStatusID: any;
  arrPriorityID: any;
  arrChildren: any;
  arrParents: any;
  objPLC: any; // object containing all PLC info (newPLC) that's needed for filterObject
  plcSchedules: any; // contains PLC status name headers
  allManagers: any;
  managers: any;
  managerTeam: any[];
  holdProjects: number[]; // array of projectIDs that user wants to hold in the results table

  // PLC information for filterObjects
  newPLC: NewPLC = {
    index: null,
    PLCStatusID: '',
    PLCStatusName: '',
    PLCDateFrom: '',
    PLCDateTo: ''
  };

  // For default Check All
  checkAllProjectTypes: boolean;
  checkAllProjectPriorities: boolean;
  checkAllProjectStatuses: boolean;

  // Filter Results
  advancedFilteredResults: any;
  advancedFilteredResultsFlat: any; // for excel download

  // etc
  subscription2: Subscription; // for excel download
  showSpinner: boolean;
  showPage: boolean;
  showParentChild: boolean; // only show parent child filter boxes if clicked on a project from results table
  showDashboard: boolean;
  showFilterCol: boolean;
  showDownloadingIcon: boolean;
  htmlElement: any;
  minDate: string;
  maxDate: string;
  fteMin: any; // for fte checkbox logic
  fteMax: any; // for fte checkbox logic

  // month
  // currentMonth: number;
  fteDateFrom: any; // for FTE date range input - format yyyy-MM-dd required
  fteDateTo: any; // for FTE date range input - format yyyy-MM-dd required

  // TO-DO PAUL: REMOVE TEMP CODE
  showDashboardButton: boolean;


  constructor(
    private router: Router,
    // To-DO Chai: move all these call to the data service
    private apiDataAdvancedFilterService: ApiDataAdvancedFilterService,
    private apiDataOrgService: ApiDataOrgService,
    private authService: AuthService,
    private cacheService: CacheService,
    private excelExportService: ExcelExportService,
    private toolsService: ToolsService,
    private advancedFiltersTypeaheadService: AdvancedFiltersTypeaheadService,
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
      ProjectID: '',          // num,num,num
      ProjectTypeIDs: '',     // num,num,num,..
      ProjectStatusIDs: '',   // num,num,num,..
      ProjectPriorityIDs: '', // num,num,num,..
      ProjectOwnerEmails: '', // email1, email2, email3,...
      FTEMin: 'NULL',         // 0
      FTEMax: 'NULL',         // 100
      FTEDateFrom: 'NULL',    // 2017-01-01
      FTEDateTo: 'NULL'       // 2017-01-01
    };

    this.filterCheckedArray = [];
    this.arrTypeID = [];
    this.arrStatusID = [0];   // adding 0 as blank
    this.arrPriorityID = [0];
    this.arrOwnerEmail = [];
    this.arrChildren = [];
    this.arrParents = [];
    this.objPLC = [];
    this.plcSchedules = []; // save clicked plc statuses
    this.fteMin = [];
    this.fteMax = [];
    this.minDate = '1900-01-01';
    this.maxDate = '2900-01-01';

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

    // don't show parent-child filter boxes
    this.showParentChild = false;

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

    // set "ALL" flags to true
    this.checkAllProjectTypes = true;
    this.checkAllProjectPriorities = true;
    this.checkAllProjectStatuses = true;

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

  // PARENT-CHILD-PROJECTS

  onParentCheckboxClick(event: any, projectID: number) {

    const checked = event.target.checked;

    // first position is the parent project
    // this.arrParents[0] = this.selectedProjectID;

    if (checked === true) {
      // ADD ID to array
      this.arrParents.push(projectID);

    } else if (checked === false) {
      // find ID in array
      for (let i = 0; i < this.arrParents.length; i++) {
        // REMOVE from array
        if (this.arrParents[i] === projectID) {
          this.arrParents.splice(i, 1);
          break;
        }
      }
    }

    // If arrChildren has projectIDs combine parent and child with spread operator
    let arrFamily = [];
    if (this.arrChildren.length !== 0) {

      arrFamily = [...this.arrChildren, ...this.arrParents];
      // remove first position since that will be duplicate
      // arrFamily.splice(0, 1);

    } else {
      arrFamily = this.arrParents;
    }


    // convert array to string and save to filterObject
    this.filterObject.ProjectID = String(arrFamily);

    // Make the db call
    this.advancedFiltersDataService.advancedFilter(this, this.filterObject);

    // clear the filter string
    this.filterString = undefined;
  }

  onChildCheckboxClick(event: any, projectID: number) {

    const checked = event.target.checked;

    // first position is the parent project
    // this.arrChildren[0] = this.selectedProjectID;

    if (checked === true) {
      // ADD ID to array
      this.arrChildren.push(projectID);

    } else if (checked === false) {
      // find ID in array
      for (let i = 0; i < this.arrChildren.length; i++) {
        // REMOVE from array
        if (this.arrChildren[i] === projectID) {
          this.arrChildren.splice(i, 1);
          break;
        }
      }
    }

    // If arrParents has projectIDs combine parent and child with spread operator
    let arrFamily = [];
    if (this.arrParents.length !== 0) {
      arrFamily = [...this.arrChildren, ...this.arrParents];
      // remove first position since that will be duplicate
      // arrFamily.splice(0, 1);
    } else {
      arrFamily = this.arrChildren;
    }

    // convert array to string and save to filterObject
    this.filterObject.ProjectID = String(arrFamily);

    console.log('family:', arrFamily);

    // Make the db call
    this.advancedFiltersDataService.advancedFilter(this, this.filterObject);

    // clear the filter string
    this.filterString = undefined;
  }

// PROJECT OWNERS

  async getManagers(managerEmailAddress: string) {
    this.managers = await this.apiDataOrgService.getManagementOrgStructure(managerEmailAddress).toPromise();
    const typeahead = this.advancedFiltersTypeaheadService.getManagerTypeahead(this, this.managers);
    // this.getManagerTypeahead(this.managers);
  }

  async getProjectOwnerSubordinates(managerEmailAddress: string) {
    this.managerTeam = await this.apiDataOrgService.getManagementOrgStructure(managerEmailAddress).toPromise();
  }

  onClearOwnerClick() {

    // reset string, manager array and scheckbox array
    this.filterStringOwner = undefined;
    this.managerTeam = [];
    this.arrOwnerEmail = [];

    // reset db object
    this.filterObject.ProjectOwnerEmails = '';

    // Make the db call
    this.advancedFiltersDataService.advancedFilter(this, this.filterObject);

    // this.filterStringOwner.nativeElement.focus();

  }


// CHECKBOXES

  // reset checkbox array to initial state
  onCheckboxReset(chekboxID: any) {

    switch (chekboxID) {
      case 'ProjectTypeIDs':
        for (let i = 0; i < this.projectTypes.length; i++) {
          this.arrTypeID.push(this.projectTypes[i].id);
        }
        break;
      case 'ProjectStatusIDs':
        this.arrStatusID = [0]; // adding zero as blank
        for (let i = 0; i < this.projectStatuses.length; i++) {
          this.arrStatusID.push(this.projectStatuses[i].id);
        }
        break;
      case 'ProjectPriorityIDs':
        this.arrPriorityID = [0];  // adding zero as blank
        for (let i = 0; i < this.projectPriorities.length; i++) {
          this.arrPriorityID.push(this.projectPriorities[i].id);
        }
        break;
      case 'PLCStatusIDs':
        for (let i = 0; i < this.plcStatuses.length; i++) {
          this.newPLC = {
            index: i,
            PLCStatusID: this.plcStatuses[i].PLCStatusID,
            PLCStatusName: this.plcStatuses[i].PLCStatusName,
            PLCDateFrom: 'NULL',
            PLCDateTo: 'NULL'
          };
          this.objPLC.push(this.newPLC);
        }
        break;
    }

  }

  // Checkbox "All"
  async onCheckAllClick(event: any) {
    const checkboxID = event.target.id;
    const checkState = event.target.checked;
    const objKey = Object.keys(this.filterObject);

    if (checkState === false) {
      // loop through array of object keys and compare with the checkbox IDs
      for (let i = 0; i < objKey.length; i++) {

        if (objKey[i] === checkboxID) {

          switch (objKey[i]) {
            case 'ProjectTypeIDs':
              this.arrTypeID = [];
              this.filterObject.ProjectTypeIDs = String(this.arrTypeID);
              break;
            case 'ProjectOwnerEmails':
              this.arrOwnerEmail = this.managerTeam[0].EMAIL_ADDRESS;
              this.filterObject.ProjectOwnerEmails = String(this.arrOwnerEmail);
              break;
            case 'ProjectStatusIDs':
              this.arrStatusID = [];
              this.filterObject.ProjectStatusIDs = String(this.arrStatusID);
              break;
            case 'ProjectPriorityIDs':
              this.arrPriorityID = [];
              this.filterObject.ProjectPriorityIDs = String(this.arrPriorityID);
              break;
            case 'FTEMin':
              this.filterObject.FTEMin = 'NULL';
              this.filterObject.FTEMax = 'NULL';
              break;
            case 'PLCStatusIDs':
              this.objPLC = [];
              this.filterObject.PLCStatusIDs = String(this.objPLC);
              break;
          }
          break;

        }

      }
    } else if (checkState === true) {

      // fill filterObjects with array from init or any other default values
      for (let i = 0; i < objKey.length; i++) {

        if (objKey[i] === checkboxID) {
          switch (objKey[i]) {
            case 'ProjectTypeIDs':
              await this.onCheckboxReset(checkboxID);
              this.filterObject.ProjectTypeIDs = String(this.arrTypeID);
              break;
            case 'ProjectOwnerEmails':
              for (let j = 0; i < this.managerTeam.length; j++) {
              this.arrOwnerEmail.push(this.managerTeam[j].EMAIL_ADDRESS);
              }
              this.filterObject.ProjectOwnerEmails = String(this.arrOwnerEmail);
              break;
            case 'ProjectStatusIDs':
              await this.onCheckboxReset(checkboxID);
              this.filterObject.ProjectStatusIDs = String(this.arrStatusID);
              break;
            case 'ProjectPriorityIDs':
              await this.onCheckboxReset(checkboxID);
              this.filterObject.ProjectPriorityIDs = String(this.arrPriorityID);
              break;
            case 'FTEMin':
              this.filterObject.FTEMin = '0';
              this.filterObject.FTEMax = '100';
              break;
            case 'PLCStatusIDs':
              // objPLC contains newPLC array because it also needs to save dates
              // selecting all means newPLC has to be created for each PLC status
              await this.onCheckboxReset(checkboxID);
              const arr = [];
              for (let j = 0; i < this.objPLC.length; j++) {
                arr.push(this.objPLC[j].PLCStatusID);
              }
              this.filterObject.PLCStatusIDs = String(arr);
              break;
          }
          break;
        }
      }

    }

    // Make the db call
    this.advancedFiltersDataService.advancedFilter(this, this.filterObject);

  }

  // ProjectTypes
  onCheckboxProjectTypeClick(event: any, id: string) {
    const checked = event.target.checked;

    if (checked === true) {
      // ADD ID to array
      this.arrTypeID.splice(0, 0, id);
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

    // Make the db call
    this.advancedFiltersDataService.advancedFilter(this, this.filterObject);

  }

  // Project Status
  onCheckboxProjectStatusClick(event: any, id: string) {
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
  onCheckboxProjectPriorityClick(event: any, id: string) {
    const checked = event.target.checked;

    if (checked === true) {
      // ADD ID to array
      // this.arrPriorityID.splice(0, 0, id);
      this.arrPriorityID.push(id);
    } else if (checked === false) {
      // console.log('checked is false.')
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
    $('.fte-toggle').removeClass('active');

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

// PLC SCHEDULES

  // Send plc filter data to db when clicking the'Go' button on the plc filter header
  async onPLCGoClick() {
    // translate local plc object to filterObject strings
    await this.advancedFiltersPLCService.getScheduleString(this);

    // Make db call -> move to db call on 'go' click
    this.advancedFiltersDataService.advancedFilter(this, this.filterObject);
  }

  // Checking or Unchecking 'ALL' plc status checkboxes
  onPLCCheckAllClick(event: any, index) {
    // note: Use ngModel plcStatus.checked on checkboxes
    // - If 'All' checkbox is checked, loop through plcStatuses and set checked to true.
    // - If 'All' checkbox is unchecked, set to false
    // - Update local objPLC with new data. It will be used onPLCGoClick

    const checked = event.target.checked;

    if (checked === true) {

      for (let i = 0; i < this.plcStatuses.length; i++) {
        this.plcStatuses[i].checked = true;                           // to enable plc schedules input boxes
        this.onPLCStatusCheckboxClick(i, event, this.plcStatuses[i]); // to save data locally in objPLC
      }

    } else if (checked === false) {

      for (let i = 0; i < this.plcStatuses.length; i++) {
        this.plcStatuses[i].checked = false;                          // to disable plc schedules input boxes
        this.onPLCStatusCheckboxClick(i, event, this.plcStatuses[i]); // to save data locally in objPLC
      }

    }

  }

  // Checking or unchecking the plc status checkbox
  onPLCStatusCheckboxClick(index, event: any, plcStatus: any) {
    // console.log('2');
    const checked = event.target.checked;

    // use interface to sort out all the attributes
    this.newPLC = {
      index: index,                           // to macth up date-input box with status-scheckbox onInputPLCChange
      PLCStatusID: plcStatus.PLCStatusID,
      PLCStatusName: plcStatus.PLCStatusName, // for filterObject
      PLCDateFrom: 'NULL',                    // for filterObject
      PLCDateTo: 'NULL'                       // for filterObject
    };

    if (checked === true) {
      // Add checked PLC Status to local PLC object
      this.objPLC.push(this.newPLC);

    } else if (checked === false) {
      // find and remove the appropriate status in the local plc object
      this.advancedFiltersPLCService.onPLCStatusUncheck(this);

    }

    // this.advancedFiltersPLCService.onClick(this, checked);

  }

  onInputPLCChange(event: any, index) {

    const valid = event.target.validity.valid;

    // Only allow dates from 1900 and complete dates
    if (valid === true ) {
      this.advancedFiltersPLCService.onInputChange(this, event, index);
    }

  }

// PROJECT OWNER

  onCheckboxProjectOwnerClick(event: any, email: string) {
    const value = event.target.checked;

    // Consolidate all filters in one array
    if (value === true) {
      // ADD ID to array
      this.arrOwnerEmail.splice(0, 0, email);
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

  }

  async onClearAllClick() {

    // Clear inputs
    this.filterString = '';
    this.filterStringOwner = '';

    // Clear out all local changes
    this.filterCheckedArray = [];
    this.arrTypeID = [];
    this.arrStatusID = [0];   // adding 0 as blank
    this.arrPriorityID = [0];
    this.arrOwnerEmail = [];
    this.arrChildren = [];
    this.arrParents = [];
    this.objPLC = [];
    this.plcSchedules = []; // save clicked plc statuses
    this.fteMin = [];
    this.fteMax = [];
    this.minDate = '1900-01-01';
    this.maxDate = '2900-01-01';

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
    this.advancedFiltersDataService.advancedFilter(this, this.filterObject);

  }

  // SHOW FILTER TOGGLE
  onShowFilterToggleClick() {

    $('#sidebar').toggleClass('active');

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
