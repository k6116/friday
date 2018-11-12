import { Component, OnInit, OnDestroy, ViewChild, ElementRef, EventEmitter, Output } from '@angular/core';
import { ToolsService } from '../../_shared/services/tools.service';
import { ApiDataAdvancedFilterService, ApiDataOrgService } from '../../_shared/services/api-data/_index';
import { Subscription } from 'rxjs/Subscription';
import { CacheService } from '../../_shared/services/cache.service';
import { ProjectTypePipe } from '../../_shared/pipes/project-type.pipe';
// import { start } from 'repl';


declare var $: any;
declare const Bloodhound;

export interface NewPLC {
  index: number;
  PLCStatusID: string;
  PLCStatusName: string;
  PLCDateFrom: string;
  PLCDateTo: string
}

@Component({
  selector: 'app-advanced-filters',
  templateUrl: './advanced-filters.component.html',
  // templateUrl: './test2.html',
  styleUrls: ['./advanced-filters.component.css', '../../_shared/styles/common.css']
})

export class AdvancedFiltersComponent implements OnInit, OnDestroy {

  @ViewChild('filterStringVC') filterStringVC: ElementRef;
  @ViewChild('filterStringOw') filterStringOw: ElementRef;

  @Output() selectedBom = new EventEmitter<any>();


  filterObject: any;
  showSpinner: boolean;
  showPage: boolean;
  showDownloadingIcon: boolean;
  htmlElement: any;


  filterString: string;
  filterStringOwner: string;
  filterCheckedArray: any;
  filterInputArray: any;
  arrPLCID:any;
  arrPLCStatus: any;
  arrPLCDate: any;
  objPLC: any;
  plcSchedules: any;
  arrOwnerEmail: any;

  // Arrays for filterObject
  arrTypeID: any;
  arrStatusID: any;
  arrPriorityID: any;
  fteMin: any;
  fteMax: any;

  // PLC information for filterObjects
  newPLC: NewPLC = {
    index: null,
    PLCStatusID: '',
    PLCStatusName: '',
    PLCDateFrom: '',
    PLCDateTo: ''
  };

  subscription2: Subscription;


  advancedFilterData: any;
  projects: any;
  projectTypes: any;
  projectStatuses: any;
  projectPriorities: any;
  plcStatuses: any;
  allManagers:any;
  managers: any;
  managerTeam: any;
  showPLCDate: boolean;

  // To default Check All
  checkAllProjectTypes: boolean; 
  checkAllProjectPriorities: boolean;
  checkAllProjectStatuses: boolean;

  advancedFilteredResults: any;

  today: string;
  minDate: string;
  
  constructor(
    private toolsService: ToolsService,
    private apiDataAdvancedFilterService: ApiDataAdvancedFilterService,
    private apiDataOrgService: ApiDataOrgService,
    private cacheService: CacheService,

  ) {

    // listen for websocket message for newly created projects
    this.subscription2 = this.cacheService.showDownloadingIcon.subscribe(show => {
      this.showDownloadingIcon = show;
    });

    // declare filter option object
    this.filterObject = {
      PLCStatusIDs: '',       // num,num,num,..
      PLCDateRanges: '',      // From|To
      ProjectName: '',        // num,num,num,..
      ProjectTypeIDs: '',
      ProjectStatusIDs: '',
      ProjectPriorityIDs: '',
      ProjectOwnerEmails: '',
      FTEMin: 'NULL',
      FTEMax: 'NULL',
      FTEDateFrom: 'NULL',        // 2017-01-01
      FTEDateTo: 'NULL'           // 2017-01-01
    };

    this.filterCheckedArray = [];
    // this.filterInputArray = [];
    this.arrTypeID = [];
    this.arrStatusID = [0];   // adding 0 as blank
    this.arrPriorityID = [0];
    this.arrPLCID = [];
    this.arrPLCStatus = [];
    this.arrPLCDate = [];
    this.arrOwnerEmail = [];
    this.objPLC = [];
    this.plcSchedules = []; // sava clicked plc statuses

    this.fteMin = [];
    this.fteMax = [];

    // set min and max date
    this.minDate = '2000-01-01';
    this.today = new Date().toJSON().split('T')[0];
  }

  async ngOnInit() {

    // hide the footer until the page is ready to be rendered
    this.toolsService.hideFooter();

    // show the spinner
    this.showSpinner = true;

    // get all filters for the page using forkjoin
    this.advancedFilterData = await this.getAdvancedFilterData()
    .catch(err => {
      console.log(err);
    });

    // seperate out for html
    this.projectTypes = this.advancedFilterData[1];
    this.projectStatuses = this.advancedFilterData[2];
    this.projectPriorities = this.advancedFilterData[3];
    this.plcStatuses = this.advancedFilterData[4];

    // initalize Checkboxes
    this.initCheckboxArrays()

    // get all managers for typeahead
    this.allManagers = this.getManagersTypeAhead('ron_nersesian@keysight.com');

    // hide the spinner
    this.showSpinner = false;

    // show page
    this.showPage = true;


    console.log('Advanced filter data:', this.advancedFilterData);
  }

  initCheckboxArrays() {
    this.checkAllProjectTypes = true;
    this.checkAllProjectPriorities = true;
    this.checkAllProjectStatuses = true;

    for (let i = 0; i < this.projectStatuses.length; i++) {
      this.arrStatusID.push(this.projectStatuses[i].id);
    }
    console.log('status array:', this.arrStatusID);

    for (let i = 0; i < this.projectTypes.length; i++) {
      this.arrTypeID.push(this.projectTypes[i].id);
    }
    
    for (let i = 0; i < this.projectPriorities.length; i++) {
      this.arrPriorityID.push(this.projectPriorities[i].id);
    }

    // Leave the NULLs !
    this.filterObject = {
      PLCStatusIDs: '',       // num,num,num,..
      PLCDateRanges: '',      // From|To
      ProjectName: '',        // num,num,num,..
      ProjectTypeIDs: String(this.arrTypeID),
      ProjectStatusIDs: String(this.arrStatusID),
      ProjectPriorityIDs: String(this.arrPriorityID),
      ProjectOwnerEmails: '',
      FTEMin: 'NULL',
      FTEMax: 'NULL',
      FTEDateFrom: 'NULL',        // 2017-01-01
      FTEDateTo: 'NULL'           // 2017-01-01
    };
    console.log(this.filterObject);

    // get all projects initially without filters
    // Paul's advanced filter stored procedure
    this.advancedFilter(this.filterObject);

    // this.arrTypeID = this.projectTypes.projectTypeID;
  }

  ngOnDestroy() {

    this.subscription2.unsubscribe();

  }

  async getAdvancedFilterData(): Promise<any> {
    return await this.apiDataAdvancedFilterService.getAdvancedFilterData().toPromise();
  }

  // results of applied filter
  async advancedFilter(filterOptions: any) {
    this.advancedFilteredResults = await this.apiDataAdvancedFilterService.getAdvancedFilteredResults(filterOptions).toPromise();
    
    this.advancedFilteredResults.nested.forEach( project => {
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

    this.advancedFilteredResults = this.advancedFilteredResults.nested;
    console.log('this.advancedFilteredResults', this.advancedFilteredResults);

    
  }

  // Project Owner
  async getManagersTypeAhead(managerEmailAddress: string) {
    this.managers = await this.apiDataOrgService.getManagementOrgStructure(managerEmailAddress).toPromise();
    this.getTypeahead(this.managers);
    console.log('managers', this.managers);
  }

  async getProjectOwnerSubordinates(managerEmailAddress: string) {
    this.managerTeam = await this.apiDataOrgService.getManagementOrgStructure(managerEmailAddress).toPromise();
    console.log('managers', this.managerTeam);
  }

  getTypeahead(managers: any) {

    // initialize bloodhound suggestion engine with data
    const bh = new Bloodhound({
      datumTokenizer: Bloodhound.tokenizers.obj.whitespace('fullName'),
      queryTokenizer: Bloodhound.tokenizers.whitespace,
      local: managers  // flat array of managers from api data service
    });

    // initialize typeahead using jquery
    $('.typeahead').typeahead({
      hint: true,
      highlight: true,
      minLength: 1,
    },
    {
      name: 'first-names',
      displayKey: 'fullName',  // use this to select the field name in the query you want to display
      source: bh
    })
    .bind('typeahead:selected', (event, selection) => {
      // once something in the typeahead is selected, trigger this function
      this.onSelect(selection);
    });

  }

  async onSelect(selection) {
    console.log('Selection:', selection);
    const email = selection.EMAIL_ADDRESS

    // Convert the array to string
    this.filterObject.ProjectOwnerEmails = String(email);
    console.log(this.filterObject.ProjectOwnerEmails);

    // Add to checkbox array
    this.arrOwnerEmail.splice(0, 0, email);

    // Show Badge
    this.updateInputFilterBadge(selection);

    // Make the db call
    this.advancedFilter(this.filterObject);

    // Show div with subordinates
    this.managerTeam = this.getProjectOwnerSubordinates(email);
    
  }

  updateInputFilterBadge(selection: any) {
    const name = selection.fullName;
    let nameExists = false
    const filterInputArray = selection.EMAIL_ADDRESS;


    // Check if filter is already applied. 
    for (let i = 0; i < this.filterCheckedArray.length; i++) {

      if (this.filterCheckedArray[i] === name) {
        nameExists = true;
      }
    }

    // If filter is not applied, add to array
    if (nameExists === false) {
      // Add array with ID and name to array
      this.filterCheckedArray.splice(0, 0, name);
      console.log('Add name');
    }

  }

  async getProjectChildren(projectName: string, projectType: string, projectOwner: string) {
    const children = await this.apiDataAdvancedFilterService.getProjectChildren(projectName, projectType, projectOwner).toPromise();
    console.log('children', children);
  }

  async getProjectParents(projectName: string, projectType: string, projectOwner: string) {
    const parents = await this.apiDataAdvancedFilterService.getProjectParents(projectName, projectType, projectOwner).toPromise();
    console.log('parents', parents);
  }

  // TEST BUTTON
  onTestFormClick() {
    // const filterOptions = {
    //   PLCStatusIDs: '',
    //   PLCDateRanges: '',
    //   ProjectName: '',
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
          }
          break;

        }

      }
    } 

    else if (checkState === true) {

      // fill filterObjects with array from init or any other default values
      for (let i = 0; i < objKey.length; i++) {

        if(objKey[i] === checkboxID) {
          switch (objKey[i]) {
            case 'ProjectTypeIDs':
              await this.onCheckboxReset(checkboxID);
              this.filterObject.ProjectTypeIDs = String(this.arrTypeID);
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
          }
          break;
        }
      }

    }
    console.log('filterObject:', this.filterObject);

    // Make the db call
    this.advancedFilter(this.filterObject);

  }

  // ProjectTypes
  onCheckboxProjectTypeClick(event: any, id: string) {
    const checked = event.target.checked;

    if (checked === true) {
      // ADD ID to array
      this.arrTypeID.splice(0, 0, id);
    } 

    else if (checked === false) {
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

    // Show Badge
    // this.updateFilterBadge(event);
    
  }

  // Project Status
  onCheckboxProjectStatusClick(event: any, id: string) {
    const checked = event.target.checked;

    if (checked === true) {
      // ADD ID to array
      this.arrStatusID.splice(0, 0, id);
    } 
    
    else if (checked === false){
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
    
    // Show Badge
    // this.updateFilterBadge(event);
  }

  // Project Priority
  onCheckboxProjectPriorityClick(event: any, id: string) {
    const checked = event.target.checked;

    if (checked === true) {
      // ADD ID to array
      this.arrPriorityID.splice(0, 0, id);
    } 
    
    else if (checked === false) {
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
    console.log(this.filterObject.ProjectPriorityIDs);

    // Make the db call
    this.advancedFilter(this.filterObject);

    // Show Badge
    // this.updateFilterBadge(event);  
    
  }

  // FTE
  // To-Do CHAI: 4 checkboxes are not really intuituve. Think of something else
  onCheckboxFTEClick(event: any) {
    const checked = event.target.checked;
    const checkboxID = event.target.id;

    // const numberFTEMin = Number(this.filterObject.FTEMin);
    // const numberFTEMax = Number(this.filterObject.FTEMax);

    if (checked === true) {
      
      switch (checkboxID) {
        case 'fte1':
          this.fteMin.push(0);
          this.fteMax.push(25);

          // No need to check, 0 is always min
          this.filterObject.FTEMin = '0';
          console.log(this.fteMin);
          
          if (this.filterObject.FTEMax === 'NULL') {
            this.filterObject.FTEMax = '25';
          }
          else if (Number(this.filterObject.FTEMax) > 25) {
            console.log('Max is larger than 25 => filterObject.FTEMax=', this.filterObject.FTEMax);
          }

          console.log('Mins:', this.fteMin);
          console.log('Maxs:', this.fteMax);
          break;

        case 'fte2':
          this.fteMin.push(25);
          this.fteMax.push(50);


          if (this.filterObject.FTEMin === 'NULL') {
            this.filterObject.FTEMin = '25';
          }
          else if (Number(this.filterObject.FTEMin) === 0) {
            console.log('Min is 0 => filterObject.FTEMin=', this.filterObject.FTEMin);
          }
          else if (Number(this.filterObject.FTEMin) > 25) {
            this.filterObject.FTEMin = '25';
          }
          if (this.filterObject.FTEMax === 'NULL') {
            this.filterObject.FTEMax = '50';
          }
          else if (Number(this.filterObject.FTEMax) === 25) {
            this.filterObject.FTEMax = '50';
          }
          else if (Number(this.filterObject.FTEMax) > 50) {
            console.log('Max is larger than 50 => filterObject.FTEMax=', this.filterObject.FTEMax);
          }

          console.log('Mins:', this.fteMin);
          console.log('Maxs:', this.fteMax);
          break;

        case 'fte3':
          this.fteMin.push(50);
          this.fteMax.push(75);

          if (this.filterObject.FTEMin === 'NULL') {
            this.filterObject.FTEMin = '50';
          }
          else if (Number(this.filterObject.FTEMin) < 50) {
            console.log('Min is less than 50 => filterObject.FTEMin=', this.filterObject.FTEMin);            
          }
          else if (Number(this.filterObject.FTEMin) === 75) {
            this.filterObject.FTEMin = '50';
          }
          
          if (this.filterObject.FTEMax === 'NULL') {
            this.filterObject.FTEMax = '75';
          }
          else if (Number(this.filterObject.FTEMax) < 75) {
            this.filterObject.FTEMax = '75';
          }
          else if (Number(this.filterObject.FTEMax) === 100) {
            console.log('Max is 100 => filterObject.FTEMax=', this.filterObject.FTEMax);
          }
          
          console.log('Mins:', this.fteMin);
          console.log('Maxs:', this.fteMax);
          break;

        case 'fte4':
          this.fteMin.push(75);
          this.fteMax.push(100);

          if (this.filterObject.FTEMin === 'NULL') {
            this.filterObject.FTEMin = '75';
          }
          else if (Number(this.filterObject.FTEMin) < 75) {
            console.log('Min is less than 75 => filterObject.FTEMin=', this.filterObject.FTEMin);            
          }
          
          this.filterObject.FTEMax = '100';
          
          console.log('Mins:', this.fteMin);
          console.log('Maxs:', this.fteMax);
          break;
      }

    }

    else if (checked === false) {

      // sort min arrays
      console.log('Before sort:', this.fteMin)
      console.log('Before sort:', this.fteMax)      

      this.fteMin.sort(function(a, b) {
        return a-b
      })

      // sort max arrays
      this.fteMax.sort(function(a, b) {
        return a-b
      })

      console.log('After sort:', this.fteMin)
      console.log('After sort:', this.fteMin)

      switch (checkboxID) {
        case 'fte1':

          // remove 0 and 25 from array
          this.fteMin.splice(0, 1);
          this.fteMax.splice(0, 1);

          console.log('Mins:', this.fteMin);
          console.log('Maxs:', this.fteMax);
          break;

        case 'fte2':

          // remove 25 from fteMin array
          for (let i = 0; i < this.fteMin.length; i++) {
            if (this.fteMin[i] === 25) {
              this.fteMin.splice(i, 1);
              break;
            }
          }

          // remove 50 from fteMax array
          for (let i = 0; i < this.fteMax.length; i++) {
            if (this.fteMax[i] === 50) {
              this.fteMax.splice(i, 1);
              break;
            }
          }

          console.log('Mins:', this.fteMin);
          console.log('Maxs:', this.fteMax);
          break;

        case 'fte3':
          
          // remove 50 from fteMin array
          for (let i = 0; i < this.fteMin.length; i++) {
            if (this.fteMin[i] === 50) {
              this.fteMin.splice(i, 1);
              break;
            }
          }

          // remove 75 from fteMax array
          for (let i = 0; i < this.fteMax.length; i++) {
            if (this.fteMax[i] === 75) {
              this.fteMax.splice(i, 1);
              break;
            }
          }

          console.log('Mins:', this.fteMin);
          console.log('Maxs:', this.fteMax);
          break;

        case 'fte4':
   
          // remove 75 from fteMin array
          for (let i = 0; i < this.fteMin.length; i++) {
            if (this.fteMin[i] === 75) {
              this.fteMin.splice(i, 1);
              break;
            }
          }

          // remove 100 from fteMax array
          for (let i = 0; i < this.fteMax.length; i++) {
            if (this.fteMax[i] === 100) {
                this.fteMax.splice(i, 1);
                break;
            }
          }

          console.log('Mins:', this.fteMin);
          console.log('Maxs:', this.fteMax);
          break;
      }

      // Save new filterObjects

      if (this.fteMin.length !== 0) {
        // new Min is first value in min array
        this.filterObject.FTEMin = this.fteMin[0];

        // new Max is last value in max array
        this.filterObject.FTEMax = this.fteMax[this.fteMax.length - 1];
      } 
      // FTEMin and FTEMax require 'NULL' for stored procedure
      else if (this.fteMin.length === 0) {
        this.filterObject.FTEMin = 'NULL';
        this.filterObject.FTEMax = 'NULL';
      }

    }

    console.log(this.filterObject);

    // Make the db call
    this.advancedFilter(this.filterObject);
  }

  // PLC Schedule
  onCheckboxPLCScheduleClick(index, event: any, plcStatus: any) {
    const checked = event.target.checked;

    // use interface to sort out all the attributes
    this.newPLC = {
      index: index,
      PLCStatusID: plcStatus.PLCStatusID,
      PLCStatusName: plcStatus.PLCStatusName,
      PLCDateFrom: 'NULL',
      PLCDateTo: 'NULL'
    }

    // add or remove to local array depending on the checkbox state
    if (checked === true) {

      // // show PLC status in results table
      // this.plcSchedules = this.newPLC;
      // console.log('Show PLC Schedule', this.plcSchedules);

      // Add checked PLC Status
      this.objPLC.push(this.newPLC);

    } else {

      // // remove PLC status from results table
      // this.plcSchedules = false;
      // console.log('Show PLC Schedule', this.plcSchedules);


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

    // Update Badge

  }

  onInputPLCChange(event: any, index) {
    console.log(index);
    const date = event.target.value;
    const id = event.target.id;

    for (let i = 0; i < this.objPLC.length; i++) {

      if (this.objPLC[i].index === index && id === 'plcFrom') {
        this.objPLC[i].PLCDateFrom = date;
        console.log(this.objPLC);
      }
      
      if (this.objPLC[i].index === index && id === 'plcTo') {
        this.objPLC[i].PLCDateTo = date;
        console.log(this.objPLC);
      } 
    }

    this.filterPLCSchedule();
  }

  // This is where the string manipulation happens
  filterPLCSchedule() {
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

    console.log('objPLC:', this.objPLC);
    console.log('NEW FILTER OBJECT:', this.filterObject);

    // Make db call
    this.advancedFilter(this.filterObject);

  }












  // filterPLCSchedule(value: any, plcStatus: any) {    

  //   // Consolidate all filters in one array
  //   if (value === true) {

  //     // Add ID to array
  //     this.arrPLCID.splice(0, 0, plcStatus.PLCStatusID);

  //     // Add from|to date  to array
  //     console.log('The default date value is:', this.filterObject.PLCDateRanges)
  //     this.arrPLCDate.splice(0,0, 'NULL|NULL')  // Has to be added to each PLCStatusID
      
  //     // Add PLC status to array
  //     this.arrPLCStatus.splice(0, 0, plcStatus.PLCStatusName);
      
  //   } else {
  //     // find ID in array
  //     for (let i = 0; i < this.arrPLCID.length; i++) {
  //       // REMOVE from array
  //       if (this.arrPLCID[i] === plcStatus.PLCStatusID) {
  //         this.arrPLCID.splice(i, 1);
  //         this.arrPLCDate.splice(i,1);
  //         this.arrPLCStatus.splice(i, 1);
  //         break;
  //       }
  //     }
  //   }
  //   console.log('Schedule Array', this.arrPLCStatus, this.arrPLCID);


  //   console.log('NEW OBJECT:', this.objPLC);

  //   // Convert the array to string
  //   this.filterObject.PLCStatusIDs = String(this.arrPLCID);
  //   this.filterObject.PLCDateRanges = String(this.arrPLCDate);
  //   console.log('PLCStatusIDs:', this.filterObject.PLCStatusIDs);
  //   console.log('PLCDateRanges:', this.filterObject.PLCDateRanges);

  //   // console.log('Filter Object:', this.filterObject);


  //   // Show Badge
  //   this.updateFilterBadge(event);

  //   // Make the db call
  //   this.advancedFilter(this.filterObject);
    
  // }

  test() {
    console.log('NIX');
  }

  // onInputPLCFromChange(event: any) {

  //   const date = event.target.value;
  //   const valid = event.target.validity.valid;

  //   console.log(event)

  //   // Make sure the input is valid
  //   if (valid === true) {

  //     // Loop through array with stored PLC StatusIDs 

  //     // Save to object
  //     this.filterObject.PLCDateRanges = date + '|NULL';
  //     console.log('Input changed!', this.filterObject.PLCDateRanges);
  //     console.log('Object:', this.filterObject);
  //   }

    


  // }

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
    console.log('Project Owners Array', this.arrOwnerEmail);

    // Convert the array to string
    this.filterObject.ProjectOwnerEmails = String(this.arrOwnerEmail);
    console.log('PROJECT OWNER STRING:', this.filterObject.ProjectOwnerEmails);

    // Make the db call
    this.advancedFilter(this.filterObject);

  }


// BADGES

  // show and remove badge for each applied filter
  updateFilterBadge(event: any) {
    const value = event.target.checked;
    const name = event.target.name;

    if (value === true) {

      // Add array with ID and name to array
      this.filterCheckedArray.splice(0, 0, name);
      
    } else {

      // Else, find array position of the checkbox ID and remove
      for (let i = 0; i < this.filterCheckedArray.length; i++) {

        if (this.filterCheckedArray[i] === name) {
          this.filterCheckedArray.splice(i, 1);
        }

      }

    }

    console.log(this.filterCheckedArray);
  }

  // not working yet
  onBadgeCloseClick(event: any) {
    const title = event.target.title;

    // remove string from checklist array    
    for (let i = 0; i < this.filterCheckedArray.length; i++) {
      if (this.filterCheckedArray[i] === title) {
        this.filterCheckedArray.splice(i, 1);
      }
    }

    // find the right checkbox and uncheck
    this.htmlElement = document.getElementsByName(title);
    this.htmlElement[0].checked = false;
    console.log(this.htmlElement);

  }



  // SEARCH BAR
  
  // on clicking the 'x' icon at the right of the search/filter input
  onClearSearchClick() {
    // clear the filter string
    this.filterString = undefined;
    // reset the focus on the filter input
    this.filterStringVC.nativeElement.focus();
    // update the count display (showing x of y) by calling onFilterStringChange()
    // this.onFilterStringChange();
  }

  onClearOwnerClick() {

    // Remove filter badge
    for (let i = 0; i < this.filterCheckedArray.length; i++) {

      if (this.filterCheckedArray[i] === this.managerTeam[0].fullName) {
        this.filterCheckedArray.splice(i, 1);
        console.log(this.filterCheckedArray);

      }

    }

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

    console.log('Export Button Clicked');

    setTimeout(() => {
      this.showDownloadingIcon = false;
    }, 1000);
  }

  
}
