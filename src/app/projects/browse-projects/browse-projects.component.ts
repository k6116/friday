import { Component, OnInit } from '@angular/core';
import { ApiDataProjectService } from '../../_shared/services/api-data/_index';

declare var $: any;

@Component({
  selector: 'app-browse-projects',
  templateUrl: './browse-projects.component.html',
  styleUrls: ['./browse-projects.component.css', '../../_shared/styles/common.css']
})
export class BrowseProjectsComponent implements OnInit {

  projects: any;
  projectsToDisplay: any;
  showPage: boolean;
  projectTypeBinding: any;
  numProjectsToDisplayAtOnce: number;
  numProjectsToDisplay: number;

  constructor(
    private apiDataProjectService: ApiDataProjectService
  ) {

    // set the number of projects to display initially, and to add for infinite scroll
    this.numProjectsToDisplayAtOnce = 100;
    this.numProjectsToDisplay = 100;

    // create an object to use for class and style binding for the project type
    this.projectTypeBinding = [
      {
        projectTypeName: 'NCI',
        iconClass: 'nc-ram',
        color: 'darkred'
      },
      {
        projectTypeName: 'NPI',
        iconClass: 'nc-keyboard-wireless',
        color: 'darkgreen'
      },
      {
        projectTypeName: 'NPPI',
        iconClass: 'nc-socket-europe-1',
        color: 'darkred'
      },
      {
        projectTypeName: 'NTI',
        iconClass: 'nc-lab',
        color: 'darkred'
      },
      {
        projectTypeName: 'Research',
        iconClass: 'nc-microscope',
        color: 'darkred'
      },
      {
        projectTypeName: 'MFG',
        iconClass: 'nc-settings-91',
        color: 'darkred'
      },
      {
        projectTypeName: 'Program',
        iconClass: 'nc-code-editor',
        color: 'darkred'
      },
      {
        projectTypeName: 'Solution',
        iconClass: 'nc-book-open-2',
        color: 'darkred'
      },
      {
        projectTypeName: 'Initiative',
        iconClass: 'nc-board-28',
        color: 'darkred'
      },
      {
        projectTypeName: 'TOF Engaged',
        iconClass: 'nc-bulb-63',
        color: 'darkred'
      },
      {
        projectTypeName: 'Completed',
        iconClass: 'nc-sign-closed',
        color: 'darkred'
      },
      {
        projectTypeName: 'General',
        iconClass: 'nc-gantt',
        color: 'darkred'
      },
    ];

  }

  ngOnInit() {

    // get all the projects
    this.apiDataProjectService.getProjects()
      .subscribe(
        res => {
          console.log('get projects successfull:');
          console.log(res);
          this.projects = res;
          // this.projectsToDisplay = this.projects.slice(0, this.numProjectsToDisplayAtOnce);
          // console.log(`number of displayed projects: ${this.projectsToDisplay.length}`);
          // display the page
          this.showPage = true;
        },
        err => {
          console.log('get project data error:');
          console.log(err);
        }
    );

  }


  // display a popover with the full description
  onDescriptionMouseEnter(project: any) {

    // console.log(project);

    console.log('project description and length:');
    console.log(project.Description);
    console.log(project.Description ? project.Description.length : 0);

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



  trimProjects(numProjects: number) {
    this.projects = this.projects.slice(0, numProjects);
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
    if (this.scrollAtBottom()) {
      console.log('scrollbar is at the bottom');
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
    // calculate the number of remaining projects that could be displaed
    const numRemainingProjects = numProjects - numDisplayedProjects;
    // take the minimum of X projects or remaining projects
    const numProjectsToAdd = Math.min(this.numProjectsToDisplayAtOnce, numRemainingProjects);
    // if there are any more projects to add
    if (numProjectsToAdd > 0) {
      // update / increment the number of projects to display (using the filter pipe)
      this.numProjectsToDisplay += numProjectsToAdd;
      console.log(`added ${numProjectsToAdd} projects; now showing ${this.numProjectsToDisplay} projects`);
    }

  }


}
