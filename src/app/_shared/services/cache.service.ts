import { Injectable, EventEmitter } from '@angular/core';

import { ConfirmModalOptions } from '../../modals/confirm-modal/confirm-modal.model';
import { CarouselModalOptions } from '../../modals/carousel-modal/carousel-modal.model';

@Injectable()
export class CacheService {

  // app data service serves as a central data store (global variables, constants, emitters)

  // jwt token object with signedToken property (encoded string), issuedAt, and expiringAt (unix/epoch time)
  // userData object will be encoded in the signedToken string
  token: any;

  apiDataTimeout = 15000; // set the api data service timeout to 15 seconds
  loggedInUser = new EventEmitter<any>();
  loggedInUser$: any;

  userPLMData: any;

  autoLogout = new EventEmitter<any>(); // send an object to the login component with message, icon class and color
  autoLogout$: any;

  noticeModalData = new EventEmitter<any>();

  // CONFIRM MODAL
  confirmModalData = new EventEmitter<ConfirmModalOptions>();
  confirmModalResponse = new EventEmitter<any>();
  confirmModalClose = new EventEmitter<boolean>();

  // CAROUSEL MODAL
  carouselModalData = new EventEmitter<CarouselModalOptions>();
  carouselModalResponse = new EventEmitter<any>();
  carouselModalClose = new EventEmitter<boolean>();

  toast = new EventEmitter<any>();

  resetTimer = new EventEmitter<boolean>();

  clickedClass = new EventEmitter<string>();

  nestedOrgData = new EventEmitter<any>();
  $nestedOrgData: any;
  nestedOrgDataRequested: boolean;
  nestedOrgDataCached: boolean;

  appLoadPath: string;  // the url that was hit on app load/refresh, stored for deep linking if user is not authenticated

  // emit data to the dashboard component telling it to remove the message telling user to update their job title
  profileHasBeenUpdated = new EventEmitter<boolean>();

  // standard red color for alert icon
  alertIconColor = 'rgb(193, 27, 27)';

  // emit data from the permissions guard to the sidenav component, with the path, so that it can be hightlighted
  // this is needed since the permissions guard makes a request from the server so takes some time
  navigatedPath = new EventEmitter<string>();

  // used to store the background image object (path, caption) in the event they can't be retrived from the server
  // (user is offline), the cached version will be used
  backgroundImage: any;

  // used for caching projects list (index) and selected project (show)
  // for data transfer between search projects and display project
  projectsBrowseData: any;

  // used to re-populate the project search input with previous search term
  projectSearchTerm: string;
  projectSelectedFilter: any;
  projectSelectedValue: string;

  // new browser location detected after clicking browser back or forward button
  browserLocation = new EventEmitter<any>();

  // used to trigger the display of the profile modal (subscription in top nav)
  showProfileModal = new EventEmitter<boolean>();

  // used to trigger the downloading icon (animated svg)
  showDownloadingIcon = new EventEmitter<boolean>();

  constructor() { }

  // TO-DO BRYAN: create a toast service and move
  raiseToast( toastType: 'success' | 'warning' | 'error' | 'info', toastText: string) {
    this.toast.emit({
      type: toastType,
      text: toastText
    });
  }

}
