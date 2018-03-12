import { Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';
import { Router } from '@angular/router';
import { User } from '../_shared/models/user.model';

import * as moment from 'moment';


@Injectable()
export class AuthService {

  loggedIn: boolean;
  loggedInUser: User;
  token: any;

  constructor(
    private http: Http,
    private router: Router
  ) {

    // TEMP CODE to check if the user is logged on page refresh, on a route other than login
    // TO-DO: check the expriation date and validity of the token (need to send to server), not just whether the token is there
    this.loggedIn = !!localStorage.getItem('jarvisToken');

  }

  // simple method to check if user is logged in, used by the auth guard service
  isLoggedIn() {
    return this.loggedIn;
  }

  // setter for the loggedIn property
  setLoggedIn(loggedIn: boolean) {
    this.loggedIn = loggedIn;
  }

  // check to see whether the token expiration date has passed
  tokenIsExpired(): boolean {
    const expiringAt = moment.unix(this.token.expiringAt);
    const now = moment();
    if (expiringAt.isAfter(now)) {
      return false;
    } else {
      return true;
    }
  }

  // get token expiration date (timestamp)
  tokenExpirationDate(): string {
    return moment.unix(this.token.expiringAt).format('dddd, MMMM Do YYYY, h:mm:ss a');
  }

  // get token issued date (timestamp)
  tokenIssuedDate(): string {
    return moment.unix(this.token.issuedAt).format('dddd, MMMM Do YYYY, h:mm:ss a');
  }


}
