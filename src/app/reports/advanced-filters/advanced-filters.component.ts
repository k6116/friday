import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { ToolsService } from '../../_shared/services/tools.service';
import { ApiDataAdvancedFilterService } from '../../_shared/services/api-data/_index';
import { Subscription } from 'rxjs/Subscription';
import { CacheService } from '../../_shared/services/cache.service';


declare var $: any;

@Component({
  selector: 'app-advanced-filters',
  templateUrl: './advanced-filters.component.html',
  styleUrls: ['./advanced-filters.component.css', '../../_shared/styles/common.css']
})
export class AdvancedFiltersComponent implements OnInit, OnDestroy {

  @ViewChild('filterStringVC') filterStringVC: ElementRef;

  filterObject: any;
  showSpinner: boolean;
  showPage: boolean;
  showDownloadingIcon: boolean;
  htmlElement: any;


  filterString: string;
  filterCheckedArray: any;
  arrID: any;

  subscription2: Subscription;


  advancedFilterData: any;
  projects: any;
  projectTypes: any;
  projectStatuses: any;
  projectPriorities: any;
  plcStatuses: any;

  advancedFilteredResults: any;

  constructor(
    private toolsService: ToolsService,
    private apiDataAdvancedFilterService: ApiDataAdvancedFilterService,
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
    this.arrID = [];

  }

  async ngOnInit() {

    // hide the footer until the page is ready to be rendered
    this.toolsService.hideFooter();

    // show the spinner
    this.showSpinner = true;

    this.advancedFilter(this.filterObject);


    // get all data for the page using forkjoin: project, schedule, and roster
    this.advancedFilterData = await this.getAdvancedFilterData()
    .catch(err => {
      console.log(err);
    });

    // this.projects = this.advancedFilterData[0];
    this.projectTypes = this.advancedFilterData[1];
    this.projectStatuses = this.advancedFilterData[2];
    this.projectPriorities = this.advancedFilterData[3];
    this.plcStatuses = this.advancedFilterData[4];

    // hide the spinner
    this.showSpinner = false;
    console.log('Advanced filter data:', this.advancedFilterData);
    console.log('projects:', this.projects);

    this.showPage = true;

  }

  ngOnDestroy() {

    this.subscription2.unsubscribe();

  }

  async getAdvancedFilterData(): Promise<any> {

    return await this.apiDataAdvancedFilterService.getAdvancedFilterData().toPromise();

  }

  async advancedFilter(filterOptions: any) {
    this.advancedFilteredResults = await this.apiDataAdvancedFilterService.getAdvancedFilteredResults(filterOptions).toPromise();
    console.log('this.advancedFilteredResults', this.advancedFilteredResults);
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

// CHECKBOXES

  onCheckboxProjectTypeClick(event: any, id: string) {
    const value = event.target.checked;

    // Consolidate all filters in one array
    if (value === true) {
      // ADD ID to array
      this.arrID.splice(0, 0, id);
    } else {
      // find ID in array
      for (let i = 0; i < this.arrID.length; i++) {
        // REMOVE from array
        if (this.arrID[i] === id) {
          this.arrID.splice(i, 1);
          break;
        }
      }
    }
    console.log('Array', this.arrID);

    // Convert the array to string
    this.filterObject.ProjectTypeIDs = String(this.arrID);
    console.log(this.filterObject.ProjectTypeIDs);

    // Show Badge
    this.updateFilterBadge(event);

    // Make the db call
    this.advancedFilter(this.filterObject);
    
  }

  onCheckboxProjectStatusClick(event: any, id: string) {
    const value = event.target.checked;

    // Consolidate all filters in one array
    if (value === true) {
      // ADD ID to array
      this.arrID.splice(0, 0, id);
    } else {
      // find ID in array
      for (let i = 0; i < this.arrID.length; i++) {
        // REMOVE from array
        if (this.arrID[i] === id) {
          this.arrID.splice(i, 1);
          break;
        }
      }
    }
    console.log('ProjectStatus Array', this.arrID);

    // Convert the array to string
    this.filterObject.ProjectStatusIDs = String(this.arrID);
    console.log(this.filterObject.ProjectStatusIDs);

    // Show Badge
    this.updateFilterBadge(event);

    // Make the db call
    this.advancedFilter(this.filterObject);
    
  }

  onCheckboxProjectPriorityClick(event: any, id: string) {
    const value = event.target.checked;

    // Consolidate all filters in one array
    if (value === true) {
      // ADD ID to array
      this.arrID.splice(0, 0, id);
    } else {
      // find ID in array
      for (let i = 0; i < this.arrID.length; i++) {
        // REMOVE from array
        if (this.arrID[i] === id) {
          this.arrID.splice(i, 1);
          break;
        }
      }
    }
    console.log('ProjectPriorityIDs Array', this.arrID);

    // Convert the array to string
    this.filterObject.ProjectPriorityIDs = String(this.arrID);
    console.log(this.filterObject.ProjectPriorityIDs);

    // Show Badge
    this.updateFilterBadge(event);

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
  }















// OLD
  onCheckboxFilterClick(event: any, projectFilterID: number, projectFilterName: string) {
    console.log(event, projectFilterID, projectFilterName);

    const value = event.target.checked;
    const name = event.target.name;
    const id = event.target.id;
    console.log('ID | Name | Value:', id, name, value);

    let index = 0;

    // create array with generic name so it can be used for any filter in badge
    const projectData = {id: projectFilterID, name: projectFilterName};
    console.log('projectData:', projectData);

    // removing digit from string to bucket the ID in the right bucket
    const option1 = id.replace(/[0-9]/g, '');

    // For Filter Badge
    if (value === true) {
      // Add array with ID and name to object
      this.filterCheckedArray.splice(0, 0, projectData);
      this.filterObject
    } else {
      // Else, find array position of the checkbox ID and remove
      for (let i = 0; i < this.filterCheckedArray.length; i++) {
        if (this.filterCheckedArray[i] === name) {
          index = i;
        }
      }
      this.filterCheckedArray.splice(index, 1);
    }

    console.log(this.filterCheckedArray);

  }
  
}
