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

    console.log('projects received in projects modal');
    console.log(this.projects);
    console.log(`number of projects: ${this.projects.length}`);

    this.projectsDisplay = this.projects.slice(0, 100);
    console.log(`number of displayed projects: ${this.projectsDisplay.length}`);

    this.paginationLinks = this.toolsService.buildPaginationRanges(this.projects, 'ProjectName', 100);
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

  onScroll(event) {
    // console.log('scrolling div..');
    const $el = $('div.project-table-cont');
    const scrollPosition = $el.scrollTop();
    const scrollHeight = $el.prop('scrollHeight');
    const height = $el.height();
    const totalDivHeight = scrollHeight - height;
    // console.log(`scroll position: ${scrollPosition}, div height total: ${totalDivHeight}`);
    if (scrollPosition >= totalDivHeight) {
      console.log('scroll bar is at the bottom');
      const numDisplayedProjects = this.projectsDisplay.length;
      const numProjects = this.projects.length;
      const numRemainingProjects = numProjects - numDisplayedProjects;
      const numProjectsToAdd = Math.min(100, numRemainingProjects);
      if (numProjectsToAdd > 0) {
        console.log('number of projects to add: ' + numProjectsToAdd);
        const projectsToAdd = this.projects.slice(numDisplayedProjects, numDisplayedProjects + numProjectsToAdd);
        console.log('projects to add:');
        console.log(projectsToAdd);
        this.projectsDisplay.push(...projectsToAdd);
        console.log(`number of displayed projects: ${this.projectsDisplay.length}`);
      }
    }
  }

  onCancelClicked() {
    console.log('cancel button clicked');
    this.outerDivState = 'out';
    this.innerDivState = 'out';
    this.cancel.emit(true);
  }

}

