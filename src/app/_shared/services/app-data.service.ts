import { Injectable, EventEmitter } from '@angular/core';

@Injectable()
export class AppDataService {

  loggedInUser = new EventEmitter<any>();
  loggedInUser$: any;

  userPLMData: any;

  autoLogout = new EventEmitter<any>(); // send an object to the login component with message, icon class and color
  autoLogout$: any;

  noticeModalData = new EventEmitter<any>();
  confirmModalData = new EventEmitter<any>();
  confirmModalResponse = new EventEmitter<any>();

  toast = new EventEmitter<any>();

  resetTimer = new EventEmitter<boolean>();

  clickedClass = new EventEmitter<string>();

  nestedOrgData = new EventEmitter<any>();
  $nestedOrgData: any;
  nestedOrgDataRequested: boolean;
  nestedOrgDataCached: boolean;

  constructor() { }

  raiseToast( toastType: 'success' | 'warn' | 'error', toastText: string) {
    this.toast.emit({
      type: toastType,
      text: toastText
    });
  }
}
