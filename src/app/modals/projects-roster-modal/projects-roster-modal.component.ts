import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ApiDataService } from '../../_shared/services/api-data.service';

declare var $: any;

@Component({
  selector: 'app-projects-roster-modal',
  templateUrl: './projects-roster-modal.component.html',
  styleUrls: ['./projects-roster-modal.component.css']
})
export class ProjectsRosterModalComponent implements OnInit {

  @Input() set selectedProject(value: any) {
    console.log('input received in projects roster modal');
    this.project = value;
    console.log(this.project);
    if (this.project) {
      this.getProjectRoster();
    }
  }
  @Output() close = new EventEmitter<boolean>();

  project: any;
  projectRoster: any;
  projectID: number;


  constructor(
    private apiDataService: ApiDataService
  ) { }

  ngOnInit() {
  }

  getProjectRoster() {
    console.log('getting project roster');
    this.apiDataService.getProjectRoster(this.project.ProjectID)
    .subscribe(
      res => {
        console.log('project roster:');
        console.log(res);
        if (res.length) {
          this.projectRoster = res[0];
        }
      },
      err => {
        console.log(err);
      }
    );
  }

  onCloseClick() {
    // emit true to the projects modal to close the modal
    this.close.emit(true);
  }

  onClickedOutside(event: Event) {

    // if the modal is displayed, and should be closed (exception for same button), close the modal
    const modalIsDisplayed = this.modalIsDisplayed();
    const shouldBeClosed = this.shouldBeClosed(event);
    if (modalIsDisplayed && shouldBeClosed) {
      // emit true to the projects modal to close the modal
      this.close.emit(true);
    }
  }

  // check the css display property to determine if the modal is displayed or not
  // NOTE: requires the use of setTimeout 0 before toggling the property used with the style binding
  modalIsDisplayed(): boolean {
    const $el = $('app-projects-roster-modal');
    if ($el.css('display') === 'none') {
      return false;
    } else {
      return true;
    }
  }

  // provides the ability to only close if the same card button is clicked,
  // otherwise keep it open (and get project data and move position)
  shouldBeClosed(event): boolean {

    // detect if the element clicked was an roster card button
    const $el = $(event.target).closest('div.card-button');
    if ($el.hasClass('card-button') && $el.hasClass('roster')) {
      // get the project id from the data attribute
      const projectID = $el.data('id');
      // if this is the same project id (same button), it should be closed
      if (projectID === this.projectID) {
        this.projectID = projectID;   // store the new project id
        return true;
      // if this is a different roster card button, it should remain open
      } else {
        this.projectID = projectID;   // store the new project id
        return false;
      }
    // if this is not an roster card button element, it should be closed
    } else {
      return true;
    }

  }

}
