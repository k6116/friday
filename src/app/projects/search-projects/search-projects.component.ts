import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, HostListener } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { ApiDataProjectService } from '../../_shared/services/api-data/_index';
import { FilterPipe } from '../../_shared/pipes/filter.pipe';
import { ToolsService } from '../../_shared/services/tools.service';
import { WebsocketService } from '../../_shared/services/websocket.service';
import { ClickTrackingService } from '../../_shared/services/click-tracking.service';

declare var $: any;

@Component({
  selector: 'app-search-projects',
  templateUrl: './search-projects.component.html',
  styleUrls: ['./search-projects.component.css', '../../_shared/styles/common.css'],
  providers: [FilterPipe]
})
export class SearchProjectsComponent implements OnInit, AfterViewInit {

  @ViewChild('filterStringVC') filterStringVC: ElementRef;
  @ViewChild('filterDropDownVC') filterDropDownVC: ElementRef;

  projects: any;
  projectsToDisplay: any;
  showPage: boolean;
  projectTypeBinding: any;
  numProjectsToDisplayAtOnce: number;
  filterString: string;
  totalProjectsCount: number;  // total number of projects
  addedProjectsCount: number;  // number of projects currently added to the page via infinate scroll (increments of 100)
  filteredProjectsCount: number;  // number of project currently displayed, if there is a filter set
  numProjectsToDisplay: number; // number of projects to show initially and to add for infinate scroll
  filters: any[];
  selectedFilter: any;  // selected filter object from the dropdown (from this.filters)
  dropDownData: any;
  numProjectsDisplayString: string;  // string to show on the page (showing x of y projects)
  showSpinner: boolean;
  cardFixedWidth: number; // total width of fixed width areas of the card (type, attributes)
  subscription1: Subscription;

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    // this.resizeProjectCardsNameCont();
  }


  constructor(
    private apiDataProjectService: ApiDataProjectService,
    private filterPipe: FilterPipe,
    private toolsService: ToolsService,
    private websocketService: WebsocketService,
    private clickTrackingService: ClickTrackingService
  ) {

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


  }


  ngOnInit() {

    // hide the footer until the page is ready to be rendered
    this.toolsService.hideFooter();

    // show the waiting to render spinner
    this.showSpinner = true;

    // get all the data for the page using forkjoin - projects, and dropdowns
    this.apiDataProjectService.getProjectsBrowseData()
      .subscribe(
        res => {
          // console.log('projects browse response:');
          // console.log(res);
          // store the projects
          this.projects = res[0];
          console.log('projects list:');
          console.log(this.projects);
          // store the dropdown data
          this.dropDownData = res.slice(1);
          // add an empty object to each drop down list, for the default first selection
          this.addEmptyObjectsToDropDowns();
          // store the number of projects, to display in the page 'showing x of y projects'
          this.totalProjectsCount = this.projects.length;
          // set the selected filter to the first one ('Project Name')
          this.selectedFilter = this.filters[0];
          // fire the filter string change to run it through the pipe
          this.onFilterStringChange();
          // hide the spinner
          this.showSpinner = false;
          // display the page
          this.showPage = true;
          // show the footer
          this.toolsService.showFooter();
          setTimeout(() => {
            this.calcFixedWidthArea();
            // this.resizeProjectCardsNameCont();
          }, 0);
        },
        err => {
          // hide the spinner
          this.showSpinner = false;
          // console.log('get project data error:');
          // console.log(err);
        }
    );

    // listen for websocket message for newly created projects
    this.subscription1 = this.websocketService.getNewProject().subscribe(project => {
      // make an api call to get new projects data
      this.refreshProjectCards();
    });

  }


  ngAfterViewInit() {
    // setTimeout(() => {
    //   this.calcFixedWidthArea();
    // }, 1000);
  }


  calcFixedWidthArea() {
    // note: use outerWidth to get the width including the borders
    // note: use eq(0) to return the first card; since all the cards will be the same
    const projectTypeContWidth = $('div.project-type-cont').eq(0).outerWidth();
    const projectAttrsContWidth = $('div.project-card-right-cont').eq(0).outerWidth();
    // store the total fixed width (for performance, these will not change)
    this.cardFixedWidth = projectTypeContWidth + projectAttrsContWidth;
    console.log('fixed width area:');
    console.log(this.cardFixedWidth);
  }


  resizeProjectCardsNameCont() {
    setTimeout(() => {
      const t0 = performance.now();
      // get the total card width
      const projectCardWidth = $('div.project-card').eq(0).outerWidth();
      // calculate the space available for the project name and description
      const availableWidth = projectCardWidth - this.cardFixedWidth - (40 * 2);
      // console.log('availalbe width for name and description');
      // console.log(availableWidth);
      // determine the width
      let setWidth;
      if (availableWidth >= 1000) {
        setWidth = 1000;
      } else if (availableWidth <= 500) {
        setWidth = 500;
      } else {
        setWidth = availableWidth;
      }
      $('div.project-details-cont').css('width', setWidth);
      const t1 = performance.now();
      // console.log(`resize project cards name container took ${t1 - t0} milliseconds`);
    }, 100);
  }


  // refresh the project cards if another user has added a new project while user is on the page
  // replaces the need for a refresh button
  refreshProjectCards() {
    this.apiDataProjectService.getProjects()
      .subscribe(
        res => {
          // update the projects array of objects
          this.projects = res;
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
      dropDown.splice(0, 0, firstObject);
    });

  }


  // onFilterStringKeypress(event) {
  //   // setTimeout(() => {
  //   //   this.resizeProjectCardsNameCont();
  //   // }, 0);
  //   console.log('filter string keypress event triggered:');
  //   console.log(event);
  // }


  onFilterStringKeydown(event) {
    const key = event.keyCode || event.charCode;
    // console.log('filter string keydown event triggered with key:');
    // console.log(key);
    // 8 = backspace; 46 = delete
    if ( key === 8 || key === 46 ) {
      console.log('backspace or delete key pressed');
      console.log(event);
      console.log(this.filterStringVC.nativeElement.selectionStart);
      console.log(this.filterStringVC.nativeElement.selectionEnd);
      const highlightIndexStart = this.filterStringVC.nativeElement.selectionStart;
      const highlightIndexEnd = this.filterStringVC.nativeElement.selectionEnd;
      const numHighlightedCharacters = highlightIndexEnd - highlightIndexStart;
      console.log('number of highlighted characters:');
      console.log(numHighlightedCharacters);
      console.log('filter string:');
      console.log(this.filterString);
      if (numHighlightedCharacters === this.filterString.length) {
        console.log('click tracking record logged, on filter clear with backspace or delete');
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
    // update the width of the project name and description container using jQuery
    // must be done because filter pipe will add and remove cards from the dom
    // this.resizeProjectCardsNameCont();
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
      console.log('selected filter:');
      console.log(this.selectedFilter);
    }
    // set the focus on the input box, if it is not a dropdown
    if (!foundFilter.isDropdown) {
      setTimeout(() => {
        this.filterStringVC.nativeElement.focus();
      }, 100);
    // otherwise, set the focus on the dropdown
    } else {
      setTimeout(() => {
        this.filterDropDownVC.nativeElement.focus();
      }, 100);
    }
  }


  onFilterSelectChange(dropDownValue) {
    if (dropDownValue && dropDownValue !== '(Select Option)') {
      // set the filter string to the selected dropdown value
      this.filterString = dropDownValue;
      // call filter string change to update the record count string
      this.onFilterStringChange();
      // log a record in the click tracking table
      this.clickTrackingService.logClickWithEvent(`page: Search Projects, text: ${this.selectedFilter.displayName} > ${dropDownValue}`);
    } else {
      // if there is no dropdown value (first selection, which is null), clear the filter
      this.clearFilter();
    }
    // update the width of the project name and description container using jQuery
    // must be done because filter pipe will add and remove cards from the dom
    // this.resizeProjectCardsNameCont();
  }


  // log a click on filter input box if there is a filter/search term entered
  onFilterLostFocus() {
    if (this.filterString) {
      console.log('click tracking record logged, on filter lost focus');
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
      {limitTo: this.numProjectsToDisplay, matchFuzzy: {on: this.selectedFilter.matchFuzzy, threshold: 0.3},
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

      }

    }

  }


  // hide/destroy the popover
  onNameMouseLeave(projectID: number) {

    // set the jquery element
    const $el = $(`div.project-name[data-id="${projectID}"]`);

    // dispose of the popover
    $el.popover('dispose');

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

      }

    }

  }


  // hide/destroy the popover
  onDescriptionMouseLeave(projectID: number) {

    // set the jquery element
    const $el = $(`div.project-description[data-id="${projectID}"]`);

    // dispose of the popover
    $el.popover('dispose');

  }


  // class binding using the ngClass directive in the html
  // to set project type icon (icon font class)
  setProjctTypeIconClass(projectTypeName) {
    const classes = {
      'nc-icon': true,
      'nc-ram': projectTypeName === 'NCI',
      'nc-keyboard': projectTypeName === 'NMI',
      'nc-keyboard-wireless': projectTypeName === 'NPI',
      'nc-socket-europe-1': projectTypeName === 'NPPI',
      'nc-lab': projectTypeName === 'NTI',
      'nc-microscope': projectTypeName === 'Research',
      'nc-settings-91': projectTypeName === 'MFG',
      'nc-code-editor': projectTypeName === 'Program',
      'nc-book-open-2': projectTypeName === 'Solution',
      'nc-board-28': projectTypeName === 'Initiative',
      'nc-bulb-63': projectTypeName === 'TOF Engaged',
      'nc-sign-closed': projectTypeName === 'Completed',
      'nc-gantt': projectTypeName === 'General'
    };
    return classes;
  }


  // style binding using the ngStyle directive in the html
  // to set the color for the project type name and icon
  setProjctTypeColor(projectTypeName) {
    switch (projectTypeName) {
      case 'NCI':
        return 'rgb(139, 0, 0)';  // red
      case 'NPI':
        return 'rgb(0, 0, 139)';  // dark blue
      case 'NPPI':
        return 'rgb(16, 140, 160)';  // turquiose
      case 'NTI':
        return 'rgb(215, 123, 10)';  // orange
      case 'Research':
        return 'rgb(0, 100, 0)';  // green
      case 'Initiative':
        return 'rgb(184, 134, 11)';  // dark yellow-gold
      case 'General':
        return 'rgb(0, 101, 209)';  // blue
      default:
        return 'rgb(139, 0, 139)';  // magenta
    }
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



}
