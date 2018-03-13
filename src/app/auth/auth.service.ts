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

    // TEMP CODE: to check if the user is logged on page refresh, on a route other than login
    // TO-DO: check the expriation date and validity of the token (need to send to server), not just whether the token is there
    // this.loggedIn = !!localStorage.getItem('jarvisToken');

  }

  // method to check if user is logged in, used by the auth guard service
  isLoggedIn() {
    // if there is no token in local storage, the user is not logged in
    if (!localStorage.getItem('jarvisToken')) {
      return false;
    } else {
      // if the loggedIn property is true, make sure the token has not expired
      if (this.loggedIn && this.token) {
        if (this.tokenIsExpired()) {
          return false;
        }
      } else {
        if (!this.loggedInUser) {
          // this means there is no data cached, so need to reach out to the server (page was refreshed)
          // make an call to the server to check the status of the token, and get the decoded user info, token expiration etc.
        }
      }
    }
    // if didn't return false, user is logged in (using return early)
    return true;
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
