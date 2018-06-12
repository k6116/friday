import { Component, OnInit, AfterViewInit, Input, Output, EventEmitter,
  HostListener, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { trigger, state, style, transition, animate, keyframes, group } from '@angular/animations';
import { ToolsService } from '../../_shared/services/tools.service';
import { ApiDataService } from '../../_shared/services/api-data.service';
import { AppDataService } from '../../_shared/services/app-data.service';
import { AuthService } from '../../auth/auth.service';

declare var $: any;

@Component({
  selector: 'app-projects-modal',
  templateUrl: './projects-modal.component.html',
  styleUrls: ['./projects-modal.component.css'],
  // changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('modalStateOuter', [
      state('in', style({
        'background-color': 'rgba(0, 0, 0, 0.4)'
      })),
      transition('in => out', [
        animate(500, style({
          'background-color': 'rgba(255, 255, 255, 0)'
        }))
      ]),
      transition('out => in', [
        animate(500, style({
          'background-color': 'rgba(0, 0, 0, 0.4)'
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
  showRosterModal: boolean;
  clickedProjectForInfoModal: any;
  clickedProjectForRosterModal: any;
  userID: any;
  userEmail: string;
  userPLMData: any;
  publicProjectTypes: any;
  projectAccessTeamList: any;
  projectAccessApprovedList: any;
  projectAccessSubmittedList: any;
  projectAccessDeniedList: any;

  @Input() projects: any;
  @Output() selectedProject = new EventEmitter<any>();
  @Output() cancel = new EventEmitter<boolean>();

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    const newHeight = $('div.projects-modal-body').height() - 170;
    $('div.project-table-cont').height(newHeight);
  }

  constructor(
    private toolsService: ToolsService,
    private changeDetectorRef: ChangeDetectorRef,
    private apiDataService: ApiDataService,
    private appDataService: AppDataService,
    private authService: AuthService,
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

    // get the user id and email
    this.userID = this.authService.loggedInUser ? this.authService.loggedInUser.id : null;
    this.userEmail = this.authService.loggedInUser ? this.authService.loggedInUser.email : null;

    this.getUserPLMData(this.userEmail);
    this.getPublicProjectTypes();
  }

  ngAfterViewInit() {

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

    // get the position to display based on the clicked element (button)
    const position = this.calculateModalPosition(element, 'div.projects-info-modal-outer-cont');

    // set the modal position (top and left css properties)
    this.setModalPosition(position, 'div.projects-info-modal-outer-cont');

    // get and deliver the project data to the modal component
    this.clickedProjectForInfoModal = this.getProject(element);

    // show the modal
    setTimeout(() => {
      this.showInfoModal = true;
    }, 0);

    // hide the tooltip
    $(`.card-button.info[data-id=${this.clickedProjectForInfoModal.ProjectID}]`).tooltip('hide');

  }


  onProjectRosterClick(element) {

    // get the position to display based on the clicked element (button)
    const position = this.calculateModalPosition(element, 'div.projects-roster-modal-outer-cont');

    // set the modal position (top and left css properties)
    this.setModalPosition(position, 'div.projects-roster-modal-outer-cont');

    // get and deliver the project data to the modal component
    this.clickedProjectForRosterModal = this.getProject(element);

    // show the modal
    setTimeout(() => {
      this.showRosterModal = true;
    }, 0);

    // hide the tooltip
    $(`.card-button.roster[data-id=${this.clickedProjectForRosterModal.ProjectID}]`).tooltip('hide');

  }

  // since the modals are a single element, need to move the position to align with the button before displaying
  // returns an object with left and top properties
  calculateModalPosition(element, modalSelector: string): any {

    // set the button width in pixels
    const buttonWidth = $(element).closest('div.card-button').outerWidth();

    // get the left position using the distance from the left side of the window with the left sides of the cards table and card button
    // (subtract the table distance from the button distance)
    // use .closest to find the closest parent, in case the icon inside the button is clicked and passed as the element
    let left = $(element).closest('div.card-button').offset().left - $('div.project-table-cont').offset().left;
    // get the top position in a similar way, except accounting also for the scroll distance from the top of the table
    const top = ($(element).closest('div.card-button').offset().top -
      $('div.project-table-cont').offset().top) + $('div.project-table-cont').scrollTop();

    // calculate the available widths from the button to the left and right sides of the table
    const cardsWidth = $('div.project-table-cont').width();
    const widthRight = cardsWidth - left;
    const widthLeft = left;

    // determine the final left position, based on available widths to the left and right
    // rule: if there is enough width to the right (400px), show to the right, otherwise take the max of the two and use that
    // to show to the left, just subtract the width (400px) to use for the left property

    // get the width of the modal
    const modalWidth = $(modalSelector).outerWidth();

    // calculate the left position
    let position: string;
    if (widthRight > modalWidth) {
      position = 'right';
      left = left + buttonWidth + 10;   // display modal to the right of the button
    } else {
      const maxWidth = Math.max(widthRight, widthLeft);
      if (maxWidth === widthRight) {
        position = 'right';
        left = left + buttonWidth + 10;   // display modal to the right of the button
      } else {
        position = 'left';
        left = left - modalWidth - 10;   // display modal to the left of the button
      }
    }

    // return an object with the left and top values
    return {
      position: position,
      left: left,
      top: top
    };

  }

  // update the top and left css properties for the modal
  setModalPosition(position, selector) {

    // set the container's position
    const $el = $(selector);
    $el.css('left', position.left);
    $el.css('top', position.top);

    // set the triangle position
    const $elTriangle = $(`${selector} .dropdown-triangle`);
    const $elTriangleCover = $(`${selector} .dropdown-triangle-cover`);
    if (position.position === 'right') {
      $elTriangle.css('left', '-8px');
      $elTriangle.css('right', 'unset');
      $elTriangleCover.css('left', '0');
      $elTriangleCover.css('right', 'unset');
    } else if (position.position === 'left') {
      $elTriangle.css('left', 'unset');
      $elTriangle.css('right', '-8px');
      $elTriangleCover.css('left', 'unset');
      $elTriangleCover.css('right', '0');
    }

  }

  // update the clickedProject that is passed to the component through @input
  getProject(element): any {

    // get the project id from the card buttons custom html attribute 'data-id'
    const projectID = $(element).closest('div.card-button').data('id');

    // find the project from the array of all projects using the id
    return this.projects.find(project => {
      return project.ProjectID === +projectID;
    });

  }

  onCancelClicked() {
    console.log('cancel button clicked');
    this.outerDivState = 'out';
    this.innerDivState = 'out';
    this.cancel.emit(true);
  }

  onProjectsInfoModalCloseClick() {
    setTimeout(() => {
      this.showInfoModal = false;
    }, 0);
  }

  onProjectsRosterModalCloseClick() {
    setTimeout(() => {
      this.showRosterModal = false;
    }, 0);
  }

  // show the tooltip on mouse enter
  onCardButtonMouseEnter(title: string, buttonClass: string, projectID: number) {

    // set bootstrap tooltip options (uses js not html so need to set the title)
    const tooltipOptions = {
      title: title,
      placement: 'left'
    };

    // attaches a tooltip handler to the specific button element
    $(`.card-button.${buttonClass}[data-id=${projectID}]`).tooltip(tooltipOptions);

    // show the tooltip
    $(`.card-button.${buttonClass}[data-id=${projectID}]`).tooltip('show');

  }

  // dispose of the tooltip on mouse leave
  // NOTE: this is critical to prevent scroll performance issues
  onCardButtonMouseLeave(buttonClass: string, projectID: number) {

    // hide and destroy the button element's tooltip
    $(`.card-button.${buttonClass}[data-id=${projectID}]`).tooltip('dispose');

  }

  onRequestedProject(project: any) {
    this.apiDataService.submitProjectAccessRequest(project, this.userID)
    .subscribe(
      res => {

        // send email
        this.apiDataService.sendRequestProjectEmail(this.userID, project.CreatedBy, project.ProjectName).subscribe(
          eRes => {
            this.appDataService.raiseToast('success', 'Request Access Email Delivered.');
          },
          err => {
            console.log(err);
          }
        );
        console.log(res);
      },
      err => {
        console.log(err);
      }
    );
  }

  getUserPLMData(userEmailAddress: string) {
    this.apiDataService.getUserPLMData(userEmailAddress)
    .subscribe(
      res => {
        console.log('User PLM Data Retrieved');
        this.appDataService.userPLMData = res;
        this.getProjectAccessTeamList();
        this.getProjectAccessList();
      },
      err => {
        console.log(err);
      }
    );
  }

  getPublicProjectTypes() {
    this.apiDataService.getPublicProjectTypes(this.userID)
    .subscribe(
      res => {
        this.publicProjectTypes = Object.keys(res).map(i => res[i].LookupValue);
        // console.log(this.publicProjectTypes.indexOf('N1CI'));
      },
      err => {
        console.log(err);
      }
    );
  }

  getProjectAccessTeamList() {
    const managerEmailAddress = this.appDataService.userPLMData[0].SUPERVISOR_EMAIL_ADDRESS;
    this.apiDataService.getProjectAccessTeamList(this.userID, managerEmailAddress)
    .subscribe(
      res => {
        this.projectAccessTeamList = Object.keys(res).map(i => res[i].id);
        console.log('Team List');
        console.log(this.projectAccessTeamList);
      },
      err => {
        console.log(err);
      }
    );
  }

  getProjectAccessList() {
    this.apiDataService.getProjectAccessList(this.userID)
    .subscribe(
      res => {

        // Convert into an array of Approved ProjectIDs
        this.projectAccessApprovedList = Object.keys(res)
          .filter(i => res[i].requestStatus === 'Approved')
          .reduce((obj, i) => {
              obj[i] = res[i]; return obj;
            }, {});
        this.projectAccessApprovedList = Object.keys(this.projectAccessApprovedList)
          .map(i => this.projectAccessApprovedList[i].projectID);

        // Convert into an array of Submitted ProjectIDs
        this.projectAccessSubmittedList = Object.keys(res)
          .filter(i => res[i].requestStatus === 'Submitted')
          .reduce((obj, i) => {
              obj[i] = res[i]; return obj;
            }, {});
        this.projectAccessSubmittedList = Object.keys(this.projectAccessSubmittedList)
          .map(i => this.projectAccessSubmittedList[i].projectID);

        // Convert into an array of Denied ProjectIDs
        this.projectAccessDeniedList = Object.keys(res)
          .filter(i => res[i].requestStatus === 'Denied')
          .reduce((obj, i) => {
              obj[i] = res[i]; return obj;
            }, {});
        this.projectAccessDeniedList = Object.keys(this.projectAccessDeniedList)
          .map(i => this.projectAccessDeniedList[i].projectID);

        console.log('Approved List');
        console.log(this.projectAccessApprovedList);
        console.log('Submitted List');
        console.log(this.projectAccessSubmittedList);
        console.log('Denied List');
        console.log(this.projectAccessDeniedList);
      },
      err => {
        console.log(err);
      }
    );
  }

}

