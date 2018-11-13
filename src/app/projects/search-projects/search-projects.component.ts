import { Component, OnInit, OnDestroy, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs/Subject';
import { ApiDataProjectService } from '../../_shared/services/api-data/_index';
import { FilterPipe } from '../../_shared/pipes/filter.pipe';
import { ToolsService } from '../../_shared/services/tools.service';
import { WebsocketService } from '../../_shared/services/websocket.service';
import { ClickTrackingService } from '../../_shared/services/click-tracking.service';
import { CacheService } from '../../_shared/services/cache.service';
import { RoutingHistoryService } from '../../_shared/services/routing-history.service';
import { ExcelExportService } from '../../_shared/services/excel-export.service';

declare var $: any;
import * as _ from 'lodash';

@Component({
  selector: 'app-search-projects',
  templateUrl: './search-projects.component.html',
  styleUrls: ['./search-projects.component.css', '../../_shared/styles/common.css'],
  providers: [FilterPipe]
})
export class SearchProjectsComponent implements OnInit, OnDestroy {

  @ViewChild('filterStringVC') filterStringVC: ElementRef;
  @ViewChild('filterDropDownVC') filterDropDownVC: ElementRef;

  ngUnsubscribe = new Subject();
  projectsBrowseData: any;
  projects: any;
  showSpinner: boolean;
  showPage: boolean;
  numProjectsToDisplayAtOnce: number;
  totalProjectsCount: number;  // total number of projects
  addedProjectsCount: number;  // number of projects currently added to the page via infinate scroll (increments of 100)
  filteredProjectsCount: number;  // number of project currently displayed, if there is a filter set
  numProjectsToDisplay: number; // number of projects to show initially and to add for infinate scroll
  numProjectsDisplayString: string;  // string to show on the page (showing x of y projects)
  filters: any[];
  filterString: string;
  filterSelection: string;
  selectedFilter: any;  // selected filter object from the dropdown (from this.filters)
  dropDownData: any;
  subscription1: Subscription;
  subscription2: Subscription;
  subscription3: Subscription;
  popoverProjectID: number;
  fuzzySearchThreshold: number;
  timer: any;
  showDownloadingIcon: boolean;


  constructor(
    private router: Router,
    private apiDataProjectService: ApiDataProjectService,
    private filterPipe: FilterPipe,
    private toolsService: ToolsService,
    private websocketService: WebsocketService,
    private clickTrackingService: ClickTrackingService,
    private cacheService: CacheService,
    private changeDetectorRef: ChangeDetectorRef,
    private routingHistoryService: RoutingHistoryService,
    private excelExportService: ExcelExportService
  ) {

    // set the fuzzy search threshold value
    this.fuzzySearchThreshold = 0.4;

    // set the number of projects to display initially, and to add for infinite scroll
    this.numProjectsToDisplayAtOnce = 100;
    this.numProjectsToDisplay = 100;
    this.addedProjectsCount = 100;

    this.filters = [
      {
        displayName: 'Project Name',
        columnName: 'ProjectName',
        matchFuzzy: true,
        matchExact: false,
        matchOptimistic: false,
        isDropdown: false
      },
      {
        displayName: 'Project Type',
        columnName: 'ProjectTypeName',
        matchFuzzy: false,
        matchExact: true,
        matchOptimistic: false,
        isDropdown: true,
        dropDownArrayIndex: 0,
        dropDownProperty: 'projectTypeName'
      },
      {
        displayName: 'Description',
        columnName: 'Description',
        matchFuzzy: false,
        matchExact: false,
        matchOptimistic: true,
        isDropdown: false
      },
      {
        displayName: 'Priority',
        columnName: 'PriorityName',
        matchFuzzy: false,
        matchExact: true,
        matchOptimistic: false,
        isDropdown: true,
        dropDownArrayIndex: 2,
        dropDownProperty: 'priorityName'
      },
      {
        displayName: 'Project Status',
        columnName: 'ProjectStatusName',
        matchFuzzy: false,
        matchExact: true,
        matchOptimistic: false,
        isDropdown: true,
        dropDownArrayIndex: 1,
        dropDownProperty: 'projectStatusName'
      }
    ];

    // listen for websocket message for newly created projects
    this.subscription1 = this.websocketService.getNewProject().subscribe(project => {
      // make an api call to get new projects data
      this.refreshProjectCards();
    });

    // listen for websocket message for newly created projects
    this.subscription2 = this.cacheService.showDownloadingIcon.subscribe(show => {
      this.showDownloadingIcon = show;
    });


  }



  async ngOnInit() {

    // hide the footer until the page is ready to be rendered
    this.toolsService.hideFooter();

    // if there is no cached projects data, get projects from the database
    if (!this.cacheService.projectsBrowseData) {

      // show the spinner
      this.showSpinner = true;

      // get all data for the page using forkjoin: project, schedule, and roster
      this.projectsBrowseData = await this.getProjectsBrowseData()
      .catch(err => {
        this.displayError(err);
      });

      // hide the spinner
      this.showSpinner = false;

      // break here if there is no response (some error occured)
      if (!this.projectsBrowseData) {
        return;
      // otherwise, cache the data for quick load on revisit
      } else {
        this.cacheService.projectsBrowseData = this.projectsBrowseData;
      }

    // otherwise, just use the cached projects data for better performance
    } else {

      // get data from the cache
      this.projectsBrowseData = this.cacheService.projectsBrowseData;

    }

    // store the projects in the component
    this.projects = this.projectsBrowseData[0];

    // console.log('projects data:');
    // console.log(this.projects);

    // store the dropdown data
    this.dropDownData = this.projectsBrowseData.slice(1);

    // add an empty object to each drop down list, for the default first selection
    this.addEmptyObjectsToDropDowns();

    // store the number of projects, to display in the page 'showing x of y projects'
    this.totalProjectsCount = this.projects.length;

    // set the selected filter to the first one ('Project Name')
    this.selectedFilter = this.filters[0];

    // fire the filter string change to run it through the pipe
    this.onFilterStringChange();

    // display the page
    this.showPage = true;

    // populate the search input with the previous search
    // only if coming back from the display page
    this.repopulateSearchTerm();

    // show the footer
    this.toolsService.showFooter();

    // remove change detection
    this.detachChangeDetection();

  }


  ngOnDestroy() {

    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();

    this.subscription1.unsubscribe();
    this.subscription2.unsubscribe();

    clearInterval(this.timer);

    this.changeDetectorRef.detach();

  }


  async getProjectsBrowseData(): Promise<any> {

    return await this.apiDataProjectService.getProjectsBrowseData().toPromise();

  }


  detachChangeDetection() {
    // detach the change detector and manually fire it x times per second
    // for better user experience for search (typing response/feedback)
    this.changeDetectorRef.detach();
    this.timer = setInterval(() => {
      this.changeDetectorRef.detectChanges();
    }, 500);
  }


  repopulateSearchTerm() {

    // only if there is data in the cache (could have refreshed display page then hit return to search button)
    if (this.cacheService.projectSelectedFilter) {
      // get the full routing history, as an array of strings with the navigation paths
      const routingHistory = this.routingHistoryService.history;
      // only consider if there are more than two in the history
      if (routingHistory.length >= 2) {
        const previousRoute = routingHistory[routingHistory.length - 2];
        // if the previous route matches the path 'main/projects/display/*'
        // and there is a stored search term
        const pathRegex = new RegExp('main\/projects\/display\/.+', 'g');
        if (pathRegex.test(previousRoute)) {

          // set the filter string (will populate the input via two-way binding)
          this.filterString = this.cacheService.projectSearchTerm;
          this.selectedFilter = this.cacheService.projectSelectedFilter;
          this.filterSelection = this.cacheService.projectSelectedValue;

          // call the filter string change method to display the correct record count
          this.onFilterStringChange();
        }
      }
    }


  }


  // refresh the project cards if another user has added a new project while user is on the page
  // replaces the need for a refresh button
  refreshProjectCards() {
    this.apiDataProjectService.getProjects()
      .subscribe(
        res => {
          // update the projects array of objects
          this.projects = res;
          // update the cached data
          this.cacheService.projectsBrowseData[0] = res;
          // update the number of projects, to display in the page 'showing x of y projects'
          this.totalProjectsCount = this.projects.length;
          // // call filter string change to update the record count string
          this.onFilterStringChange();
        },
        err => {
          // console.log('get projects data error:');
          // console.log(err);
        }
    );
  }


  // add an object to the beginning of the dropdowns arrays
  // with an empty string, as the default selection
  addEmptyObjectsToDropDowns() {

    this.dropDownData.forEach(dropDown => {
      // take a copy of the first object
      const firstObject = $.extend(true, {}, dropDown[0]);
      // replace the properties with zeros or empty strings
      for (const property in firstObject) {
        if (firstObject.hasOwnProperty(property)) {
          if (typeof firstObject[property] === 'number') {
            firstObject[property] = 0;
          } else if (typeof firstObject[property] === 'string') {
            firstObject[property] = '(Select Option)';
          }
        }
      }

      // add it to the first position (zero index)
      if (!_.find(dropDown, firstObject)) {
        dropDown.splice(0, 0, firstObject);
      }

    });

  }


  // look for instances where we want to log the search for click tracking
  onFilterStringKeydown(event) {
    // get the key code
    // REF: https://www.cambiaresearch.com/articles/15/javascript-char-codes-key-codes
    const key = event.keyCode || event.charCode;
    // 8 = backspace; 46 = delete
    // if ( key === 8 || key === 46 ) {
    if (this.filterString) {
      // get the number of selected characters
      const selectedIndexStart = this.filterStringVC.nativeElement.selectionStart;
      const selectedIndexEnd = this.filterStringVC.nativeElement.selectionEnd;
      const numSelectedCharacters = selectedIndexEnd - selectedIndexStart;
      // if all of the text is selected, and the user either hits the backspace, delete,
      // or any other character (starting a new search), log the search for click tracking
      // NOTE: since this is key down event the filter string will be the previous string (no need to cache)
      if (numSelectedCharacters === this.filterString.length) {
        // log a record in the click tracking table
        this.clickTrackingService.logClickWithEvent(`page: Search Projects,
          text: ${this.selectedFilter.displayName} > ${this.filterString}`);
      }
    }
  }


  // on clicking the 'x' icon at the right of the search/filter input
  onClearSearchClick() {
    // clear the filter string
    this.filterString = undefined;
    // reset the focus on the filter input
    this.filterStringVC.nativeElement.focus();
    // update the count display (showing x of y) by calling onFilterStringChange()
    this.onFilterStringChange();
  }


  onFilterByChange(filterBy) {
    // find the filter object based on the selected dropdown value
    const foundFilter = this.filters.find(filter => {
      return filter.displayName === filterBy;
    });
    if (foundFilter) {
      // clear the existing filter
      this.clearFilter();
      // set the filter object
      this.selectedFilter = foundFilter;
    }
    // set the focus on the input box, if it is not a dropdown
    if (!foundFilter.isDropdown) {
      setTimeout(() => {
        this.filterStringVC.nativeElement.focus();
      }, 500);
    // otherwise, set the focus on the dropdown
    } else {
      this.filterSelection = '(Select Option)';
      setTimeout(() => {
        this.filterDropDownVC.nativeElement.focus();
      }, 500);
    }
  }


  onFilterSelectChange(dropDownValue) {
    if (dropDownValue && dropDownValue !== '(Select Option)') {
      // set the filter string to the selected dropdown value
      this.filterString = dropDownValue;
      this.filterSelection = dropDownValue;
      // call filter string change to update the record count string
      this.onFilterStringChange();
      // log a record in the click tracking table
      this.clickTrackingService.logClickWithEvent(`page: Search Projects, text: ${this.selectedFilter.displayName} > ${dropDownValue}`);
    } else {
      // if there is no dropdown value, clear the filter
      this.clearFilter();
    }
  }


  // if there is a filter/search term entered, log it for click tracking on lose focus
  // NOTE: clicking the x icon will also trigger this
  onFilterLostFocus() {
    if (this.filterString) {
      // log a record in the click tracking table
      this.clickTrackingService.logClickWithEvent(`page: Search Projects, text: ${this.selectedFilter.displayName} > ${this.filterString}`);
    }
  }


  // clear the existing filter string; if a different search by is selected for example
  clearFilter() {
    this.filterString = undefined;
    // call filter string change to update the record count string
    this.onFilterStringChange();
  }


  // use the same filter pipe, with the same options passed, to get an array of object that should be displayed with the filter
  // the sole purpose is to show the number of projects (Showing X of Y Projects)
  onFilterStringChange() {
    // get the array of projects objects that are displayed
    const projects = this.filterPipe.transform(this.projects, this.filterString, this.selectedFilter.columnName,
      {limitTo: this.numProjectsToDisplay, matchFuzzy: {on: this.selectedFilter.matchFuzzy, threshold: this.fuzzySearchThreshold},
      matchOptimistic: this.selectedFilter.matchOptimistic, matchExact: this.selectedFilter.matchExact});
    // get the number of displayed/filtered projects
    this.filteredProjectsCount = projects.length;
    // update the record count (Showing X of Y Projects)
    this.setNumProjectsDisplayString();
  }


  // set/update the record count string (Showing X of Y Projects)
  setNumProjectsDisplayString() {
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


  // display a popover with the full project name (for long overflowing project names)
  onNameMouseEnter(project: any) {

    const $ruler = $('span.project-name-ruler');
    $ruler.html(project.ProjectName);
    // console.log('measured width of project name:');
    const measuredWidth = $ruler.outerWidth();
    // console.log($ruler.outerWidth());

    // get the current width of the container (500 to 800 px)
    const currentWidth = $(`div.project-name[data-id="${project.ProjectID}"]`).outerWidth();
    // console.log('current allowed width of project name');
    // console.log(currentWidth);

    // only show the popover if there is a project name (not null) and it is over X characters
    if (project.ProjectName) {
      if (measuredWidth >= (currentWidth - 60)) {

        // set the jquery element
        const $el = $(`div.project-name[data-id="${project.ProjectID}"]`);

        // set the popover options
        const options = {
          animation: true,
          placement: 'top',
          html: true,
          trigger: 'focus',
          title: `Project Name`,
          content: project.ProjectName
        };

        // show the popover
        $el.popover(options);
        $el.popover('show');

        // store the project id
        this.popoverProjectID = project.ProjectID;

      }

    }

  }


  // hide/destroy the popover
  onNameMouseLeave(projectID: number) {

    // set the jquery element
    const $el = $(`div.project-name[data-id="${projectID}"]`);

    // dispose of the popover
    $el.popover('dispose');

    // clear the project id
    this.popoverProjectID = undefined;

  }


  // display a popover with the full description
  onDescriptionMouseEnter(project: any) {

    const $ruler = $('span.project-description-ruler');
    $ruler.html(project.Description);
    // console.log('measured width of project description:');
    const measuredWidth = $ruler.outerWidth();
    // console.log($ruler.outerWidth());

    // get the current width of the container (500 to 800 px)
    const currentWidth = $(`div.project-description[data-id="${project.ProjectID}"]`).outerWidth();
    // console.log('current allowed width of project description');
    // console.log(currentWidth);

    // only show the popover if there is a description (not null) and it is over 200 characters
    if (project.Description) {
      if ((measuredWidth / 2) >= (currentWidth - 60)) {

        // set the jquery element
        const $el = $(`div.project-description[data-id="${project.ProjectID}"]`);

        // set the popover options
        const options = {
          animation: true,
          placement: 'top',
          html: true,
          trigger: 'focus',
          title: `Description`,
          content: project.Description
        };

        // show the popover
        $el.popover(options);
        $el.popover('show');

        // store the project id
        this.popoverProjectID = project.ProjectID;

      }

    }

  }


  // hide/destroy the popover
  onDescriptionMouseLeave(projectID: number) {

    // set the jquery element
    const $el = $(`div.project-description[data-id="${projectID}"]`);

    // dispose of the popover
    $el.popover('dispose');

    // clear the project id
    this.popoverProjectID = undefined;

  }


  // display a popover with the status, priority, and department
  onAttributesMouseEnter(project: any) {

    // set the jquery element
    const $el = $(`div.attributes-hover[data-id="${project.ProjectID}"]`);

    // set the popover options
    // NOTE: getting the content from the hidden div (display: none)
    const options = {
      animation: true,
      placement: 'top',
      html: true,
      trigger: 'focus',
      title: `Project Attributes`,
      content: $(`div.project-attributes-cont[data-id="${project.ProjectID}"]`).html()
    };

    // show the popover
    $el.popover(options);
    $el.popover('show');

    // store the project id
    this.popoverProjectID = project.ProjectID;

  }


  // hide/destroy the popover
  onAttributesMouseLeave(projectID: number) {

    // set the jquery element
    const $el = $(`div.attributes-hover[data-id="${projectID}"]`);

    // dispose of the popover
    $el.popover('dispose');

    // clear the project id
    this.popoverProjectID = undefined;

  }


  // display a popover with the record history/info - created by and creation date
  onRecordHistoryMouseEnter(project: any) {

    // set the jquery element
    const $el = $(`div.record-history[data-id="${project.ProjectID}"]`);

    // set the popover options
    // NOTE: getting the content from the hidden div (display: none)
    const options = {
      animation: true,
      placement: 'top',
      html: true,
      trigger: 'focus',
      title: `Record History`,
      content: $(`div.project-creation-cont[data-id="${project.ProjectID}"]`).html()
    };

    // show the popover
    $el.popover(options);
    $el.popover('show');

    // store the project id
    this.popoverProjectID = project.ProjectID;

  }


  // hide/destroy the popover
  onRecordHistoryMouseLeave(projectID: number) {

    // set the jquery element
    const $el = $(`div.record-history[data-id="${projectID}"]`);

    // dispose of the popover
    $el.popover('dispose');

    // clear the project id
    this.popoverProjectID = undefined;

  }


  onScroll() {
    // if the scrollbar is at the bottom, and there is no active filter
    // add another chunk of projects
    if (this.scrollAtBottom() && !this.filterString) {
      // console.log('scrollbar is at the bottom');
      this.addProjectsForInfiniteScroll();
    }
  }


  scrollAtBottom(): boolean {
    // get the project cards container element using jQuery
    const $el = $('div.projects-cards-cont');
    // get the current scrollbar position from the top in pixels
    const scrollPosition = $el.scrollTop();
    // get the total scrollable height of the div with this calculation
    // need to subtract the visible height to get a comparable height with scrollTop
    const scrollHeight = $el.prop('scrollHeight');
    const height = $el.height();
    const totalDivHeight = scrollHeight - height;
    // if the scroll position is at (or maybe slightly below due to rounding), return true otherwise false
    if (scrollPosition >= totalDivHeight - 5) {
      return true;
    } else {
      return false;
    }
  }


  // use all projects in the ngFor, but use filter pipe to limit, update limit when reaching the bottom
  addProjectsForInfiniteScroll() {

    // get the number of currently displayed projects
    const numDisplayedProjects = this.numProjectsToDisplay;
    // get the number of total projects
    const numProjects = this.projects.length;
    // calculate the number of remaining projects that could be displayed
    const numRemainingProjects = numProjects - numDisplayedProjects;
    // take the minimum of X projects or remaining projects
    const numProjectsToAdd = Math.min(this.numProjectsToDisplayAtOnce, numRemainingProjects);
    // if there are any more projects to add
    if (numProjectsToAdd > 0) {
      // update / increment the number of projects to display (using the filter pipe)
      this.numProjectsToDisplay += numProjectsToAdd;
      this.onFilterStringChange();
      this.addedProjectsCount += numProjectsToAdd;
    }

  }


  onProjectClick(project) {

    // destroy any popovers that may still be displayed
    if (this.popoverProjectID) {
      $(`div.project-name[data-id="${this.popoverProjectID}"]`).popover('dispose');
      $(`div.project-description[data-id="${this.popoverProjectID}"]`).popover('dispose');
      $(`div.attributes-hover[data-id="${this.popoverProjectID}"]`).popover('dispose');
      $(`div.record-history[data-id="${this.popoverProjectID}"]`).popover('dispose');
    }

    // store the current filter string and object in the cache service, to re-populate the input box when navigating back
    this.cacheService.projectSearchTerm = this.filterString ? this.filterString : undefined;
    this.cacheService.projectSelectedFilter = this.selectedFilter;
    this.cacheService.projectSelectedValue = this.filterSelection;

    // set flag for back button
    this.cacheService.fromMyProjectsFlag = false;

    // navigate to the display page
    this.router.navigate([`/main/projects/display/${project.ProjectID}`]);
  }


  displayError(err) {

    // hide the spinner
    this.showSpinner = false;

    // build the error message
    // TO-DO BILL: make this adapt to other types of errors, not just sequelize
    const errorMessage = `<b>Message:</b>  ${err.json().title}; ${err.json().error.message.name};
      ${err.json().error.message.original.message}; Status Code: ${err.status}`;

    // display a bootstrap modal with the error message
    this.cacheService.confirmModalData.emit(
      {
        title: 'Error',
        message: `Oops, an error occured.  Please contact
          <a href="https://confluence.it.keysight.com/display/JARVIS/About+Jarvis">support</a>.<br><br>
          ${errorMessage}`,
        iconClass: 'fa-exclamation-triangle',
        iconColor: this.cacheService.alertIconColor,
        closeButton: true,
        allowOutsideClickDismiss: true,
        allowEscKeyDismiss: true,
        buttons: [
          {
            text: 'Ok',
            bsClass: 'btn-secondary',
            emit: false
          }
        ]
      }
    );

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
      },
      {
        name: 'ProjectTypeName',
        alias: 'ProjectType'
      },
      {
        name: 'Description',
      },
      {
        name: 'Notes',
      },
      {
        name: 'ProjectStatusName',
        alias: 'Status'
      },
      {
        name: 'PriorityName',
        alias: 'Priority'
      },
      {
        name: 'GroupName',
        alias: 'Group'
      },
      {
        name: 'EntityName',
        alias: 'Entity'
      },
      {
        name: 'EntityOwnerName',
        alias: 'EntityOwner'
      },
      {
        name: 'MU'
      },
      {
        name: 'IBO'
      },
      {
        name: 'OracleItemNumber'
      },
      {
        name: 'FullName',
        alias: 'CreatedBy'
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
    const projects = this.filterPipe.transform(this.projects, this.filterString, this.selectedFilter.columnName,
      {matchFuzzy: {on: this.selectedFilter.matchFuzzy, threshold: this.fuzzySearchThreshold},
      matchOptimistic: this.selectedFilter.matchOptimistic, matchExact: this.selectedFilter.matchExact});

    // export / download an Excel file with the projects data (client version)
    // setTimeout(() => {
    //   this.excelExportService.exportClient('Jarvis Projects Export', 'Projects', projects);
    // }, 2000);

    // export / download an Excel file with the projects data (server version)
    setTimeout(() => {
      this.excelExportService.exportServer('Jarvis Projects Export', 'Projects', projects, colsToExport);
    }, 1000);

  }


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


}
