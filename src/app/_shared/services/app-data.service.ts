import { Injectable, EventEmitter } from '@angular/core';

@Injectable()
export class AppDataService {

  loggedInUser = new EventEmitter<any>();
  loggedInUser$: any;

  autoLogout = new EventEmitter<any>(); // send an object to the login component with message, icon class and color
  autoLogout$: any;

  noticeModalData = new EventEmitter<any>();
  confirmModalData = new EventEmitter<any>();

  resetTimer = new EventEmitter<boolean>();

  // recursion testing
  employeeIcon = new EventEmitter<any>();
  employee = new EventEmitter<any>();

  constructor() { }

}
