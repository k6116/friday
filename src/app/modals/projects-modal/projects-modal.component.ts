import { Component, OnInit, AfterViewInit, Input, Output, EventEmitter,
  HostListener, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { trigger, state, style, transition, animate, keyframes, group } from '@angular/animations';
import { FormGroup, FormArray, FormControl, Validators, FormBuilder } from '@angular/forms';
import { ToolsService } from '../../_shared/services/tools.service';
import { ApiDataEmployeeService, ApiDataProjectService, ApiDataPermissionService,
  ApiDataEmailService } from '../../_shared/services/api-data/_index';
import { AppDataService } from '../../_shared/services/app-data.service';
import { AuthService } from '../../_shared/services/auth.service';

declare var $: any;
declare const introJs: any;

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
        animate(250, style({
          'background-color': 'rgba(255, 255, 255, 0)'
        }))
      ]),
      transition('out => in', [
        animate(250, style({
          'background-color': 'rgba(0, 0, 0, 0.4)'
        }))
      ])
    ]),
    trigger('modalStateInner', [
      state('in', style({
        opacity: 1
      })),
      transition('in => out', [
        animate(250, style({
          opacity: 0
        }))
      ]),
      transition('out => in', [
        animate(250, style({
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
  projectPermissionList: any;
  projectPermissionTeamList: any;
  projectPermissionApprovedList: any;
  projectPermissionSubmittedList: any;
  projectPermissionDeniedList: any;
  projectData: any;
  projectRolesList: any;
  clickOutsideException: string;
  selProject: any;
  selProjectRole: any;

  @Input() projects: any;
  @Input() fteTutorialState: number;
  @Output() tutorialStateEmitter = new EventEmitter<number>();
  @Output() selectedProject = new EventEmitter<any>();
  @Output() cancel = new EventEmitter<boolean>();

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.resizeProjectCardsContainer();
  }

  constructor(
    private toolsService: ToolsService,
    private changeDetectorRef: ChangeDetectorRef,
    private apiDataEmployeeService: ApiDataEmployeeService,
    private apiDataProjectService: ApiDataProjectService,
    private apiDataPermissionService: ApiDataPermissionService,
    private apiDataEmailService: ApiDataEmailService,
    private appDataService: AppDataService,
    private authService: AuthService,
  ) {

  }

  ngOnInit() {

    this.resizeProjectCardsContainer();

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
    this.getProjectRoles();

    // when the project modal is initialized, if we are in tutorial part2, launch the tutorial
    if (this.fteTutorialState === 2) {
      this.tutorialPart2();
    }
  }

  ngAfterViewInit() {

  }

  resizeProjectCardsContainer() {
    const newHeight = $('div.projects-modal-inner-cont').height() - 170;
    $('div.project-table-cont').height(newHeight);
  }

  // fte tutorial part 2, passed over from parent component onAddProjectClick()
  tutorialPart2() {
    const intro = introJs();
    intro.setOptions({
      steps: [
        {intro: 'This is the Add New Project menu'},
        {
          intro: `Use the search bar to find a project that you work on.  Misspellings are ok.`,
          element: '#intro-search-project',
        },
        {
          intro: `Find the project you've worked on, and press the "Select" button`,
          element: '#intro-select-project',
        }
      ],
      overlayOpacity: 0.4,
      exitOnOverlayClick: false,
      showStepNumbers: false,
      keyboardNavigation: false
    });
    window.setTimeout( () => {
      intro.start('.tutorial-part2');
    }, 500);
  }

  onSelectedProject(selProject: any) {
    this.clickOutsideException = 'div#projectRoleModal';
    this.selProject = selProject;
    // if user selects project when in the tutorial, end this part and increment the state counter
    if (this.fteTutorialState === 2) {
      this.fteTutorialState++;
      introJs().exit();
    }
  }

  selectProjectRole(event: any) {
    this.selProjectRole = event.target.value;
  }

  onProjectRoleConfirm() {

    // add project role fields to selProject object to pass back to fte-entry component
    this.selProject.ProjectRole = this.selProjectRole;
    for (let i = 0; i < this.projectRolesList.length; i++) {
      if (this.projectRolesList[i].projectRole === this.selProjectRole) {
        this.selProject.ProjectRoleID = this.projectRolesList[i].id;
      }
    }

    console.log('Selected Project Id:');
    console.log(this.selProject);

    console.log('Selected Project:');
    console.log(this.selProject.ProjectName);

    this.outerDivState = 'out';
    this.innerDivState = 'out';
    this.selectedProject.emit(this.selProject);
    this.outerDivState = 'out';
    this.innerDivState = 'out';

    // if user selects a project while we're in the tutorial, end step2 and send the parent component the current state
    if (this.fteTutorialState === 3) {
      window.setTimeout( () => {
        // setting timeout to allow parent component some time to render
        this.tutorialStateEmitter.emit(this.fteTutorialState);
      }, 500);
    }

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

    // TO-DO: don't show the modal until the roster data has been retreived

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

  onProjectPermissionClick(project: any, action: string) {

    let confirmButton: any;
    let firstRequest: boolean;
    let message: string;

    // this.clickOutsideException = 'div#confirm-modal';

    // create requestData object for passing into controller
    const requestData = {
      requestID: null,
      requestStatus: null,
      requestNotes: null
    };
    console.log('proj perm list', this.projectPermissionList);
    // find requestID and append it to requestData
    for (let i = 0; i < this.projectPermissionList.length; i++) {
      if (this.projectPermissionList[i].projectID === project.ProjectID) {
        requestData.requestID = this.projectPermissionList[i].id;
      }
    }
    if (requestData.requestID === null) {
      firstRequest = true;
      message = `Do you want to request access to the project "${project.projectName}"?`;
    } else {
      firstRequest = false;
      message = `Do you want to update the request status to ${requestData.requestStatus}?`;
    }

    // depending on action, update requestData elements
    if (action === 'Request') {
      requestData.requestStatus = 'Submitted';
      requestData.requestNotes = 'Requesting access';
      confirmButton = 'Request Access';
    } else if (action === 'Submitted') {
      requestData.requestStatus = 'Cancelled';
      requestData.requestNotes = 'Cancelling request access';
      confirmButton = 'Rescind Access';
    } else if (action === 'Denied') {
      requestData.requestStatus = 'Submitted';
      requestData.requestNotes = 'Resubmitting request access';
      confirmButton = 'Re-Request Access';
    }

    // emit confirmation modal after they click request button
    this.appDataService.confirmModalData.emit(
      {
        title: `Confirm ${action}`,
        message: message,
        iconClass: 'fa-exclamation-triangle',
        iconColor: 'rgb(193, 193, 27)',
        allowOutsideClickDismiss: false,
        allowEscKeyDismiss: false,
        buttons: [
          {
            text: confirmButton,
            bsClass: 'btn-success',
            emit: true
          },
          {
            text: 'Cancel',
            bsClass: 'btn-secondary',
            emit: false
          }
        ]
      }
    );

    const updateModalSubscription = this.appDataService.confirmModalResponse.subscribe( res => {
      if (res) {
        if (firstRequest) {
          const insertActionSubscription =
          this.apiDataPermissionService.insertProjectPermissionRequest(project, this.userID)
            .subscribe(
              apiRes => {
                console.log(apiRes);
                this.onRequestUpdateSuccess();
                insertActionSubscription.unsubscribe();
              },
              err => {
                console.log(err);
                insertActionSubscription.unsubscribe();
              }
            );
        } else {
          const updateActionSubscription =
          this.apiDataPermissionService.updateProjectPermissionRequest(requestData, this.userID)
            .subscribe(
              apiRes => {
                console.log(apiRes);
                this.onRequestUpdateSuccess();
                updateActionSubscription.unsubscribe();
              },
              err => {
                console.log(err);
                updateActionSubscription.unsubscribe();
              }
            );
          }
      } else {
        console.log('request confirm aborted');
      }
      updateModalSubscription.unsubscribe();
    });
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
    this.closeModal();
  }

  onClickOutside(clickedElement) {
    this.closeModal();
  }

  closeModal() {
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
    this.apiDataPermissionService.insertProjectPermissionRequest(project, this.userID)
    .subscribe(
      res => {

        // send email
        this.apiDataEmailService.sendRequestProjectEmail(this.userID, project.CreatedBy, project.ProjectName).subscribe(
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
    this.apiDataEmployeeService.getUserPLMData(userEmailAddress)
    .subscribe(
      res => {
        console.log('User PLM Data Retrieved');
        this.appDataService.userPLMData = res;
        this.getProjectPermissionTeamList();
        this.getProjectPermissionList();
      },
      err => {
        console.log(err);
      }
    );
  }

  getPublicProjectTypes() {
    this.apiDataPermissionService.getPublicProjectTypes(this.userID)
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

  getProjectPermissionTeamList() {
    const managerEmailAddress = this.appDataService.userPLMData[0].SUPERVISOR_EMAIL_ADDRESS;
    this.apiDataPermissionService.getProjectPermissionTeamList(this.userID, managerEmailAddress)
    .subscribe(
      res => {
        this.projectPermissionTeamList = Object.keys(res).map(i => res[i].id);
        console.log('Team List');
        console.log(this.projectPermissionTeamList);
      },
      err => {
        console.log(err);
      }
    );
  }

  getProjectPermissionList() {
    this.apiDataPermissionService.getProjectPermissionList(this.userID)
    .subscribe(
      res => {

        this.projectPermissionList = res;

        // Convert into an array of Approved ProjectIDs
        this.projectPermissionApprovedList = Object.keys(res)
          .filter(i => res[i].requestStatus === 'Approved')
          .reduce((obj, i) => {
              obj[i] = res[i]; return obj;
            }, {});
        this.projectPermissionApprovedList = Object.keys(this.projectPermissionApprovedList)
          .map(i => this.projectPermissionApprovedList[i].projectID);

        // Convert into an array of Submitted ProjectIDs
        this.projectPermissionSubmittedList = Object.keys(res)
          .filter(i => res[i].requestStatus === 'Submitted')
          .reduce((obj, i) => {
              obj[i] = res[i]; return obj;
            }, {});
        this.projectPermissionSubmittedList = Object.keys(this.projectPermissionSubmittedList)
          .map(i => this.projectPermissionSubmittedList[i].projectID);

        // Convert into an array of Denied ProjectIDs
        this.projectPermissionDeniedList = Object.keys(res)
          .filter(i => res[i].requestStatus === 'Denied')
          .reduce((obj, i) => {
              obj[i] = res[i]; return obj;
            }, {});
        this.projectPermissionDeniedList = Object.keys(this.projectPermissionDeniedList)
          .map(i => this.projectPermissionDeniedList[i].projectID);

        console.log('Access List');
        console.log(this.projectPermissionList);
        // console.log('Approved List');
        // console.log(this.projectPermissionApprovedList);
        // console.log('Submitted List');
        // console.log(this.projectPermissionSubmittedList);
        // console.log('Denied List');
        // console.log(this.projectPermissionDeniedList);
      },
      err => {
        console.log(err);
      }
    );
  }

  getProjectRoles() {
    this.apiDataProjectService.getProjectRoles()
    .subscribe(
      res => {
        console.log('Project Roles Retrieved');
        this.projectRolesList = res;
      },
      err => {
        console.log(err);
      }
    );
  }

  onRequestUpdateSuccess() {
    // refresh project access list to update the request buttons
    this.getProjectPermissionList();
  }


}

