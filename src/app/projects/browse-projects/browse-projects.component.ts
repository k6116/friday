import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ApiDataProjectService } from '../../_shared/services/api-data/_index';
import { FilterPipe } from '../../_shared/pipes/filter.pipe';
import { ToolsService } from '../../_shared/services/tools.service';

declare var $: any;

@Component({
  selector: 'app-browse-projects',
  templateUrl: './browse-projects.component.html',
  styleUrls: ['./browse-projects.component.css', '../../_shared/styles/common.css'],
  providers: [FilterPipe]
})
export class BrowseProjectsComponent implements OnInit {

  @ViewChild('filterStringVC') filterStringVC: ElementRef;
  @ViewChild('filterDropDownVC') filterDropDownVC: ElementRef;

  projects: any;
  projectsToDisplay: any;
  showPage: boolean;
  projectTypeBinding: any;
  numProjectsToDisplayAtOnce: number;
  filterString: string;
  totalProjects: number;
  totalProjectsCount: number;  // total number of projects
  addedProjectsCount: number;  // number of projects currently added to the page via infinate scroll (increments of 100)
  filteredProjectsCount: number;  // number of project currently displayed, if there is a filter set
  numProjectsToDisplay: number; // number of projects to show initially and to add for infinate scroll
  displayedProjects: number;
  filters: any[];
  selectedFilter: any;  // selected filter object from the dropdown (from this.filters)
  dropDownData: any;
  numProjectsDisplayString: string;  // string to show on the page (showing x of y projects)
  showSpinner: boolean;


  constructor(
    private apiDataProjectService: ApiDataProjectService,
    private filterPipe: FilterPipe,
    private toolsService: ToolsService
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
          // store the dropdown data
          this.dropDownData = res.slice(1);
          // add an empty object to each drop down list, for the default first selection
          this.addEmptyObjectsToDropDowns();
          // store the number of projects, to display in the page 'showing x of y projects'
          this.totalProjects = this.projects.length;
          this.totalProjectsCount = this.projects.length;
          // set the number of displayed projects
          this.displayedProjects = this.projects.length;
          // set the selected filter to the first one ('Project Name')
          this.selectedFilter = this.filters[0];
          // fire the filter string change to run it through the pipe
          // TO-DO: rename this method
          this.onFilterStringChange();
          // hide the spinner
          this.showSpinner = false;
          // display the page
          this.showPage = true;
          // show the footer
          this.toolsService.showFooter();
        },
        err => {
          // hide the spinner
          this.showSpinner = false;
          // console.log('get project data error:');
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
      // replace the properties with zeros, empty strings
      for (const property in firstObject) {
        if (firstObject.hasOwnProperty(property)) {
          if (typeof firstObject[property] === 'number') {
            firstObject[property] = 0;
          } else if (typeof firstObject[property] === 'string') {
            firstObject[property] = '';
          }
        }
      }
      // add it to the first position (zero index)
      dropDown.splice(0, 0, firstObject);
    });

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
      }, 100);
    // otherwise, set the focus on the dropdown
    } else {
      setTimeout(() => {
        this.filterDropDownVC.nativeElement.focus();
      }, 100);
    }
  }

  onFilterSelectChange(dropDownValue) {
    // console.log('dropdown value:');
    // console.log(dropDownValue);
    if (dropDownValue) {
      this.filterString = dropDownValue;
      this.onFilterStringChange();
    } else {
      this.clearFilter();
    }
  }

  // clear the existing filter string; if a different search by is selected for example
  clearFilter() {
    this.filterString = undefined;
    this.onFilterStringChange();
  }


  onFilterStringChange() {
    const projects = this.filterPipe.transform(this.projects, this.filterString, this.selectedFilter.columnName,
      {limitTo: this.numProjectsToDisplay, matchFuzzy: this.selectedFilter.matchFuzzy,
      matchOptimistic: this.selectedFilter.matchOptimistic, matchExact: this.selectedFilter.matchExact});
    this.displayedProjects = projects.length;
    this.filteredProjectsCount = projects.length;
    this.setNumProjectsDisplayString();
  }


  setNumProjectsDisplayString() {
    // no projects displayed
    if (this.filteredProjectsCount === 0) {
      this.numProjectsDisplayString = `Showing 0 of ${this.totalProjectsCount} Projects`;
    } else if (this.filteredProjectsCount === this.totalProjectsCount) {
      this.numProjectsDisplayString = `Showing All ${this.totalProjectsCount} Projects`;
    } else {
      this.numProjectsDisplayString = `Showing ${this.filteredProjectsCount} of ${this.totalProjectsCount} Projects`;
    }
  }


  // display a popover with the full description
  onDescriptionMouseEnter(project: any) {

    // console.log('project description and length:');
    // console.log(project.Description);
    // console.log(project.Description ? project.Description.length : 0);

    // only show the popover if there is a description (not null) and it is over 200 characters
    if (project.Description) {
      if (project.Description.length >= 130) {

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


  setProjctTypeIconClass(projectTypeName) {
    const classes = {
      'nc-icon': true,
      'nc-ram': projectTypeName === 'NCI',
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
      // console.log(`added ${numProjectsToAdd} projects; now showing ${this.numProjectsToDisplay} projects`);
      this.onFilterStringChange();
      this.addedProjectsCount += numProjectsToAdd;
    }

  }



}
