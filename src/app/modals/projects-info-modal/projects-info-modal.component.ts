import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

declare var $: any;

@Component({
  selector: 'app-projects-info-modal',
  templateUrl: './projects-info-modal.component.html',
  styleUrls: ['./projects-info-modal.component.css']
})
export class ProjectsInfoModalComponent implements OnInit {

  @Input() project: any;
  @Output() close = new EventEmitter<boolean>();

  projectID: number;

  constructor() { }

  ngOnInit() {
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
    const $el = $('app-projects-info-modal');
    if ($el.css('display') === 'none') {
      return false;
    } else {
      return true;
    }
  }

  // provides the ability to only close if the same card button is clicked,
  // otherwise keep it open (and get project data and move position)
  shouldBeClosed(event): boolean {

    // detect if the element clicked was an info card button
    const $el = $(event.target).closest('div.card-button');
    if ($el.hasClass('card-button') && $el.hasClass('info')) {
      // get the project id from the data attribute
      const projectID = $el.data('id');
      // if this is the same project id (same button), it should be closed
      if (projectID === this.projectID) {
        this.projectID = projectID;   // store the new project id
        return true;
      // if this is a different info card button, it should remain open
      } else {
        this.projectID = projectID;   // store the new project id
        return false;
      }
    // if this is not an info card button element, it should be closed
    } else {
      return true;
    }

  }

}
