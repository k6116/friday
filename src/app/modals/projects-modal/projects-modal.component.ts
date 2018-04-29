import { Component, OnInit, AfterViewInit, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { trigger, state, style, transition, animate, keyframes, group } from '@angular/animations';
import { ToolsService } from '../../_shared/services/tools.service';

declare var $: any;

@Component({
  selector: 'app-projects-modal',
  templateUrl: './projects-modal.component.html',
  styleUrls: ['./projects-modal.component.css'],
  animations: [
    trigger('modalStateOuter', [
      state('in', style({
        'background-color': 'rgba(0, 0, 0, 0.2)'
      })),
      transition('in => out', [
        animate(500, style({
          'background-color': 'rgba(255, 255, 255, 0)'
        }))
      ]),
      transition('out => in', [
        animate(500, style({
          'background-color': 'rgba(0, 0, 0, 0.2)'
        }))
      ])
    ]),
    trigger('modalStateInner', [
      state('in', style({
        opacity: 1
      })),
      transition('in => out', [
        animate(500, style({
          opacity: 0
        }))
      ]),
      transition('out => in', [
        animate(500, style({
          opacity: 1
        }))
      ])
    ])
  ]
})
export class ProjectsModalComponent implements OnInit, AfterViewInit {

  outerDivState: string;
  innerDivState: string;
  filterString: string;
  paginateFilter: any;
  paginationLinks: any;
  selectedPage: number;
  checkboxValue: any;
  projectsDisplay: any;
  numProjectsToDisplayAtOnce: number;
  numProjectsToDisplay: number;
  showInfoModal: boolean;

  @Input() projects: any;
  @Output() selectedProject = new EventEmitter<any>();
  @Output() cancel = new EventEmitter<boolean>();

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    // console.log(event);
    const newHeight = $('div.projects-modal-body').height() - 170;
    $('div.project-table-cont').height(newHeight);
  }

  constructor(
    private toolsService: ToolsService
  ) {

  }

  ngOnInit() {

    this.outerDivState = 'out';
    this.innerDivState = 'out';
    setTimeout(() => {
      this.outerDivState = 'in';
    }, 0);
    setTimeout(() => {
      this.innerDivState = 'in';
    }, 0);

    // set the number of projects to display initially, and to add for infinite scroll, and for pagination chunks
    this.numProjectsToDisplayAtOnce = 100;
    this.numProjectsToDisplay = 100;

    console.log('projects received in projects modal');
    console.log(this.projects);
    console.log(`number of projects: ${this.projects.length}`);

    this.projectsDisplay = this.projects.slice(0, this.numProjectsToDisplayAtOnce);
    console.log(`number of displayed projects: ${this.projectsDisplay.length}`);

    this.paginationLinks = this.toolsService.buildPaginationRanges(this.projects, 'ProjectName', this.numProjectsToDisplayAtOnce);
    console.log(this.paginationLinks);

    this.paginateFilter = {on: false, property: 'ProjectName', regexp: `[${this.paginationLinks[0]}]`};
    this.selectedPage = 0;

  }

  ngAfterViewInit() {

    // init bootstrap tooltips
    setTimeout(() => {
      $('[data-toggle="tooltip"]').tooltip();
    }, 1000);

    const newHeight = $('div.projects-modal-body').height() - 170;
    $('div.project-table-cont').height(newHeight);

  }

  onSelectedProject(selProject: any) {

    console.log('Selected Project Id:');
    console.log(selProject.ProjectID);

    console.log('Selected Project:');
    console.log(selProject.ProjectName);

    this.outerDivState = 'out';
    this.innerDivState = 'out';
    this.selectedProject.emit(selProject);
    this.outerDivState = 'out';
    this.innerDivState = 'out';

  }

  onPaginationLinkClick(link) {
    console.log('pagination link clicked: ' + link);
    this.paginateFilter = {on: true, property: 'ProjectName', regexp: `[${link}]`};
    this.selectedPage = this.paginationLinks.indexOf(link);
  }

  onPaginationArrowClick(direction: string) {
    console.log('pagination arrow clicked: ' + direction);
    let newPage: boolean;
    if (direction === 'right') {
      if (this.selectedPage !== this.paginationLinks.length - 1) {
        this.selectedPage++;
        newPage = true;
      }
    } else if (direction === 'left') {
      if (this.selectedPage !== 0) {
        this.selectedPage--;
        newPage = true;
      }
    }
    if (newPage) {
      const link = this.paginationLinks[this.selectedPage];
      this.paginateFilter = {on: true, property: 'ProjectName', regexp: `[${link}]`};
    }
  }

  onScroll() {
    if (this.scrollAtBottom()) {
      this.addProjectsForInfiniteScroll2();
    }
  }

  scrollAtBottom(): boolean {
    // get the project cards container element using jQuery
    const $el = $('div.project-table-cont');
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

  // option 1: push more projects into the array that is in the loop, however can't filter on projects not in array
  addProjectsForInfiniteScroll() {
    // get the number of currently displayed projects
    const numDisplayedProjects = this.projectsDisplay.length;
    // get the number of total projects
    const numProjects = this.projects.length;
    // calculate the number of remaining projects that could be displaed
    const numRemainingProjects = numProjects - numDisplayedProjects;
    // take the minimum of X projects or remaining projects
    const numProjectsToAdd = Math.min(this.numProjectsToDisplayAtOnce, numRemainingProjects);
    // if there are any more projects to add
    if (numProjectsToAdd > 0) {
      // slice off another chunk of project objects to add to the array
      const projectsToAdd = this.projects.slice(numDisplayedProjects, numDisplayedProjects + numProjectsToAdd);
      // add the new projects to the array of projects to display
      this.projectsDisplay.push(...projectsToAdd);
    }
  }

  // option 2: use all projects in the ngFor, but use filter pipe to limit, update limit when reaching the bottom
  addProjectsForInfiniteScroll2() {
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
    }
  }

  onProjectInfoClick(element) {
    console.log('project info clicked');
    console.log($(element));

    let left = $(element).closest('div.card-button').offset().left - $(element).closest('div.project-table-cont').offset().left + 35;
    const top = $(element).closest('div.card-button').offset().top - $(element).closest('div.project-table-cont').offset().top;

    console.log(`position - top: ${top}, left: ${left}`);

    const cardsWidth = $('div.project-table-cont').width();
    const widthRight = cardsWidth - left;
    const widthLeft = left;

    // rule: if there is enough width to the right (400px), show to the right, otherwise take the max of the two and use that
    // to show to the left, just subtract the width (400px) to use for the left property (plus 35)
    console.log(`remaining widths - right: ${widthRight}, left: ${widthLeft}`);
    if (widthRight > 400) {
      left = left;
    } else {
      const maxWidth = Math.max(widthRight, widthLeft);
      if (maxWidth === widthRight) {
        left = left;
      } else {
        left = left - 400 - 35;
      }
    }

    // set the top and left css properties of the modal
    const $el = $('div.projects-info-modal-outer-cont');
    $el.css('left', left);
    $el.css('top', top);

    // show the modal
    this.showInfoModal = true;

  }

  onCancelClicked() {
    console.log('cancel button clicked');
    this.outerDivState = 'out';
    this.innerDivState = 'out';
    this.cancel.emit(true);
  }

  onProjectsInfoModalCloseClick() {
    this.showInfoModal = false;
  }

}

