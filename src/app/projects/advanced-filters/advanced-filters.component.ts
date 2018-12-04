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
  providers: [AdvancedFiltersDataService, AdvancedFiltersTypeaheadService, FilterPipe]
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
  objPLC: any; // object containing all PLC info (newPLC) that's needed for filterObject
  plcSchedules: any; // contains PLC status name headers
  allManagers: any;
  managers: any;
  managerTeam: any[];

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
  lastClickedProjectName: string; // store which project was clicked last
  htmlElement: any;
  minDate: string;
  maxDate: string;
  fteMin: any; // for fte checkbox logic
  fteMax: any; // for fte checkbox logic

  // month
  currentMonth: number;
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
    private advancedFiltersDataService: AdvancedFiltersDataService
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
    await this.getCheckboxData();

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

  async getCheckboxData() {

    // get ALL FILTERS for the page using forkjoin
    this.advancedFilterData = await this.getAdvancedFilterData()
    .catch(err => {
      // console.log(err);
    });
    // seperate out for html
    // TO-DO CHAI: Remove [0] since that's been called seperatly
    this.projects = this.advancedFilterData[0];
    this.projectTypes = this.advancedFilterData[1];
    this.projectStatuses = this.advancedFilterData[2];
    this.projectPriorities = this.advancedFilterData[3];
    this.plcStatuses = this.advancedFilterData[4];

    // this.advancedFiltersTypeaheadService.getProjectsTypeahead(this, this.projects);

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
    await this.advancedFilter(this.filterObject);

    // this.advancedFiltersTypeaheadService.getProjectsTypeahead(this, this.filterObject);

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

  async getAdvancedFilterData(): Promise<any> {
    return await this.apiDataAdvancedFilterService.getAdvancedFilterData().toPromise();
  }

  // DATABASE CALL
  async advancedFilter(filterOptions: any) {

    this.showSpinner = true;

    const advancedFilteredResultsObj = await this.apiDataAdvancedFilterService.getAdvancedFilteredResults(filterOptions).toPromise();

    this.cacheService.advancedSearchFilterOption = filterOptions;

    advancedFilteredResultsObj.nested.forEach( project => {
      const schedules = [];
      if ('Schedules' in project) {

        Object.keys(project.Schedules).forEach(function(key) {
          schedules.push({
            PLCStatusName: key,
            PLCDate: project.Schedules[key]
          });
        });
        project.Schedules = schedules;
      }
    });

    this.advancedFilteredResultsFlat = advancedFilteredResultsObj.flat;       // Flat file is needed for excel download
    this.advancedFilteredResults = advancedFilteredResultsObj.nested;         // Nested files is the MAIN RESULTS files
    // const typeahead = this.advancedFiltersTypeaheadService.getProjectsTypeahead(this, this.advancedFilteredResults);

    // For PLC status headers:
    if (this.advancedFilteredResults.length !== 0) {
      // save only checked statuses to be displayed in results table header
      this.plcSchedules = this.advancedFilteredResults[0].Schedules;
    } else {
      this.plcSchedules = [];
    }



    this.showSpinner = false;
    // this.showResults = true;

    // store the number of projects, to display in the page 'showing x of y projects'
    this.filteredProjectsCount = this.advancedFilteredResults.length;

    // set/update the record count string (Showing X of Y Projects) -> happening in advanced filter?
    this.setNumProjectsDisplayString();

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

  // async onProjectClick(projectID: string) {

  //   // this.lastClickedProjectName = projectName;
  //   // console.log(this.lastClickedProjectName);

  //   this.children = await this.advancedFiltersDataService.getProjectChildren(projectID);
  //   this.parents = await this.advancedFiltersDataService.getProjectParents(projectID);

  //   console.log('children', this.children);
  //   console.log('parents', this.parents);

  // }

  onParentCheckboxClick(projectName: String) {

    // create new array to store project names
    const parentProjects = Array(this.filterObject.ProjectName);

    if (parentProjects[0] === '') {
      parentProjects[0] = this.lastClickedProjectName;
    }

    parentProjects.push(projectName);

    this.filterObject.ProjectName = String(parentProjects);

    // Make the db call
    this.advancedFilter(this.filterObject);

    // clear the filter string
    this.filterString = undefined;
  }

  onChildCheckboxClick(projectName: String) {

    // create new array to store project names
    const childProjects = Array(this.filterObject.ProjectName);

    if (childProjects[0] === '') {
      childProjects[0] = this.lastClickedProjectName;
    }

    childProjects.push(projectName);

    this.filterObject.ProjectName = String(childProjects);

    // Make the db call
    this.advancedFilter(this.filterObject);

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

  // TO-DO: Still using this???
  // Selecting a name from the typeahead list
  onProjectSelect(selection) {
    console.log(selection);
    // const email = selection.EMAIL_ADDRESS;
    const name = selection.ProjectName;
    const type = selection.ProjectType;
    const owner = selection.ProjectOwner;

    // Save email string to filterObject
    // this.filterObject.ProjectOwnerEmails = String(email);
    this.filterObject.ProjectName = String(name);

    // Add to checkbox array
    // this.arrOwnerEmail.splice(0, 0, email);

    // Make the db call
    this.advancedFilter(this.filterObject);

    // Show div with subordinates
    // this.getProjectOwnerSubordinates(email);
    // this.getProjectParents(name, type, owner);
    // this.getProjectChildren(name, type, owner);
  }

  onSelect(selection) {
    console.log('selected project owner');
    const email = selection.EMAIL_ADDRESS;

    // Save email string to filterObject
    this.filterObject.ProjectOwnerEmails = String(email);

    // Add to checkbox array
    this.arrOwnerEmail.splice(0, 0, email);

    // Make the db call
    this.advancedFilter(this.filterObject);

    // Show div with subordinates
    this.getProjectOwnerSubordinates(email);

  }

  onClearOwnerClick() {

    // reset string, manager array and scheckbox array
    this.filterStringOwner = undefined;
    this.managerTeam = [];
    this.arrOwnerEmail = [];

    // reset db object
    this.filterObject.ProjectOwnerEmails = '';

    // Make the db call
    this.advancedFilter(this.filterObject);

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
    // console.log('filterObject:', this.filterObject);

    // Make the db call
    this.advancedFilter(this.filterObject);

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
    this.advancedFilter(this.filterObject);

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
    this.advancedFilter(this.filterObject);

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
    this.advancedFilter(this.filterObject);

  }


// FTE

  onFTEClearClick() {

    this.filterObject.FTEDateFrom = 'NULL';
    this.filterObject.FTEDateTo = 'NULL';
    this.filterObject.FTEMin = 'NULL';
    this.filterObject.FTEMax = 'NULL';

    // Make the db call
    this.advancedFilter(this.filterObject);

    // Clear values of date ranges input
    this.fteDateFrom = '';
    this.fteDateTo = '';

    // unselect all toggle buttons -> removes PLC from reults table
    $('.fte-toggle').removeClass('active');

  }

  onFTEToggleSelected(event: any) {

    const id = event.target.id;
    this.currentMonth = Number(moment().format('M'));

    switch (id) {
      case 'all':
        // this.filterObject.FTEDateFrom = '01/01/1900';
        this.filterObject.FTEDateFrom = 'NULL';
        this.filterObject.FTEDateTo = 'NULL';
        break;

      case 'month':
        const firstDayOfMonth0 = moment().format('MM/01/YYYY');   // First day of current month
        const firstDayOfMonth1 = moment(firstDayOfMonth0).add(1, 'month').format('MM/01/YYYY');   // First day of following month

        this.filterObject.FTEDateFrom = String(firstDayOfMonth0);
        this.filterObject.FTEDateTo = String(firstDayOfMonth1);
        break;

      case 'qtr':
        let qtr0; // Beginning of CURRENT quarter
        let qtr1; // Begiining of FOLLOWING quarter

        // Determining beginning of the quarter
        if (this.currentMonth === 11 || this.currentMonth === 12 || this.currentMonth === 1) {
          qtr0 = moment().format('11/01/YYYY');
        } else if (this.currentMonth === 2 || this.currentMonth === 3 || this.currentMonth === 4) {
          qtr0 = moment().format('01/01/YYYY');
        } else if (this.currentMonth === 5 || this.currentMonth === 6 || this.currentMonth === 7) {
          qtr0 = moment().format('05/01/YYYY');
        } else if (this.currentMonth === 8 || this.currentMonth === 9 || this.currentMonth === 10) {
          qtr0 = moment().format('08/01/YYYY');
        }

        qtr1 = moment(qtr0).add(3, 'month').format('MM/01/YYYY');

        this.filterObject.FTEDateFrom = String(qtr0);
        this.filterObject.FTEDateTo = String(qtr1);

        break;

      case 'year':
        let fiscalYear0;         // Beginning of fiscal year; 11/01/YYYY
        let fiscalYear1;         // End of fiscal Year; 11/01/YYYY + 1year

        if (this.currentMonth === 11 || this.currentMonth === 12) {

          fiscalYear0 = moment().format('11/01/YYYY'); // first day of CURRENT fiscal year
          fiscalYear1 = moment(fiscalYear0).add(1, 'year').format('11/01/YYYY'); // first day of FOLLOWING fiscal year

        } else {

          fiscalYear1 = moment().format('11/01/YYYY');  // first day of FOLLOWING fiscal year
          fiscalYear0 = moment(fiscalYear1).subtract(1, 'year').format('01/01/YYYY'); // first day of CURRENT fiscal year

        }

        this.filterObject.FTEDateFrom = String(fiscalYear0);
        this.filterObject.FTEDateTo = String(fiscalYear1);

        break;
    }

    this.fteDateFrom = moment(this.filterObject.FTEDateFrom).format('YYYY-MM-DD');
    this.fteDateTo = moment(this.filterObject.FTEDateTo).format('YYYY-MM-DD');

    // Make the db call
    this.advancedFilter(this.filterObject);
  }

  onFTETotalGoClick(minValue: any, maxValue: any) {

    if (minValue === '') {
      this.filterObject.FTEMin = String('NULL');
    } else {
      this.filterObject.FTEMin = String(minValue);
    }

    if (maxValue === '') {
    this.filterObject.FTEMax = String('NULL');
    } else {
      this.filterObject.FTEMax = String(maxValue);
    }

    // Make the db call
    this.advancedFilter(this.filterObject);
  }

  onFTEMaxChange(value: string) {

    if (value === '') {
    this.filterObject.FTEMax = 'NULL';
    } else {
    this.filterObject.FTEMax = value;
    }

    // Make the db call
    this.advancedFilter(this.filterObject);
  }

  onFTEMinChange(value: string) {

    if (value === '') {
    this.filterObject.FTEMin = 'NULL';
    } else {
    this.filterObject.FTEMin = value;
    }

    // Make the db call
    this.advancedFilter(this.filterObject);
  }

  onInputFTEChange(event: any) {
    const date = event.target.value; // input date
    const id = event.target.id; // either fteFrom or fteTo
    const valid = event.target.validity.valid;
    // console.log(valid);

     // Only allow dates from 2000 to current date
     if (valid === true ) {
       switch (id) {
         case 'fteFrom':
           this.filterObject.FTEDateFrom = String(date);
           break;
          case 'fteTo':
           this.filterObject.FTEDateTo = String(date);
           break;
       }

       this.filterObject.FTEMin = String(0);
       this.filterObject.FTEMax = String(100);
      // console.log(this.filterObject);

      // Make the db call
      this.advancedFilter(this.filterObject);
     }
  }

// PLC SCHEDULES

  onCheckboxPLCScheduleClick(index, event: any, plcStatus: any) {
    const checked = event.target.checked;

    // use interface to sort out all the attributes
    this.newPLC = {
      index: index,
      PLCStatusID: plcStatus.PLCStatusID,
      PLCStatusName: plcStatus.PLCStatusName,
      PLCDateFrom: 'NULL',
      PLCDateTo: 'NULL'
    };

    // add or remove to local array depending on the checkbox state
    if (checked === true) {

      // Add checked PLC Status
      this.objPLC.push(this.newPLC);

    } else {

      // find the right object to delete by comparing their index
      for (let i = 0; i < this.objPLC.length; i++) {
        if (this.objPLC[i].index === index) {

          // remove from array
          this.objPLC.splice(i, 1);

          break;
        }
      }

    }

    // Call function that takes care of the string manipulation for the db
    this.filterPLCSchedule();

  }

  onInputPLCChange(event: any, index) {
    const date = event.target.value; // input date
    const id = event.target.id; // either plcFrom or plcTo
    const valid = event.target.validity.valid;

    // Only allow dates from 1900 and complete dates
    if (valid === true ) {

      // loop through objPLC to save input value
      for (let i = 0; i < this.objPLC.length; i++) {

        if (this.objPLC[i].index === index && id === 'plcFrom') {

          if (date !== '') {
            this.objPLC[i].PLCDateFrom = date;
          } else { // on clear input click
            this.objPLC[i].PLCDateFrom = 'NULL';
          }

        }

        if (this.objPLC[i].index === index && id === 'plcTo') {

          if (date !== '') {
            this.objPLC[i].PLCDateTo = date;
          } else { // on clear input click
            this.objPLC[i].PLCDateTo = 'NULL';
          }

        }

      }

      // string manipulation
      this.filterPLCSchedule();

    }

  }

  // This is where the string manipulation happens
  async filterPLCSchedule() {
    const arrID = [];
    const arrFromDate = [];

    // organize the data in buckets in order to convert each array into strings
    for (let i = 0; i < this.objPLC.length; i++) {
      arrID.splice(0, 0, this.objPLC[i].PLCStatusID);
      arrFromDate.splice(0, 0, this.objPLC[i].PLCDateFrom + '|' + this.objPLC[i].PLCDateTo);
    }

    // save strings into the db object
    this.filterObject.PLCStatusIDs = String(arrID);
    this.filterObject.PLCDateRanges = String(arrFromDate);

    // Make db call
    await this.advancedFilter(this.filterObject);
  }

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
    this.advancedFilter(this.filterObject);

  }

// SEARCH BAR

  onSearchClick(filterString: string) {

    // NOTE: use wildcard search to get any project containing the searchterm
    // or type in projectNames seperated by commas to get all projects with those names

    // save search term into filterObject
    this.filterObject.ProjectName = String(filterString);

    // Make the db call
    this.advancedFilter(this.filterObject);

  }

  // on clicking the 'x' icon at the right of the search/filter input
  onClearSearchClick() {

    // clear the filter string
    this.filterString = undefined;

    $('.projects-filter-input').typeahead('val', '');

    // reset the focus on the filter input
    this.filterStringVC.nativeElement.focus();

    // save search term into filterObject
    this.filterObject.ProjectName = '';
    this.filterObject.ProjectID = '';

    // Make the db call
    this.advancedFilter(this.filterObject);

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

  onDashboardClick() {
    // navigate to the display page
    // this.router.navigate([`/main/projects/advanced-dashboard/`]);

    // this.showDashboard = true;
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
    this.advancedFilter(filterOptions);
    // this.getProjectOwnerSubordinates('henri_komrij@keysight.com');
    // this.getProjectChildren('Loki', 'Program', 'ethan_hunt@keysight.com');
    // this.getProjectParents('Arges70', 'NCI', 'ethan_hunt@keysight.com');

  }

}
