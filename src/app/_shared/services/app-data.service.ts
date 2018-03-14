import { Injectable, EventEmitter } from '@angular/core';

@Injectable()
export class AppDataService {

  loggedInUser = new EventEmitter<any>();
  loggedInUser$: any;


  constructor() { }

}
