import { Injectable, EventEmitter } from '@angular/core';

import { ConfirmModalOptions } from '../../modals/confirm-modal/confirm-modal.model';

@Injectable()
export class AppDataService {


  // TO-DO MIKE: rename app-data service to cache service EVERYWHERE!!
  // app data service serves as a central data store (global variables, constants, emitters)

  apiDataTimeout = 100 * 60 * 15; // set the api data service timeout to 15 seconds
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

  toast = new EventEmitter<any>();

  resetTimer = new EventEmitter<boolean>();

  clickedClass = new EventEmitter<string>();

  nestedOrgData = new EventEmitter<any>();
  $nestedOrgData: any;
  nestedOrgDataRequested: boolean;
  nestedOrgDataCached: boolean;

  appLoadPath: string;  // the url that was hit on app load/refresh, stored for deep linking if user is not authenticated

  constructor() { }

  // TO-DO BRYAN: create a toast service and move
  raiseToast( toastType: 'success' | 'warn' | 'error', toastText: string) {
    this.toast.emit({
      type: toastType,
      text: toastText
    });
  }

}
