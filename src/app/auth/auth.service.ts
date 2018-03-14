import { Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';
import { Router } from '@angular/router';
import { User } from '../_shared/models/user.model';
import { ApiDataService } from '../_shared/services/api-data.service';
import { AppDataService } from '../_shared/services/app-data.service';

import * as moment from 'moment';


@Injectable()
export class AuthService {

  loggedIn: boolean;
  loggedInUser: User;
  token: any;
  lastActivity: number;   // epoch time indicating last time there was any mouse click or keypress

  constructor(
    private http: Http,
    private router: Router,
    private apiDataService: ApiDataService,
    private appDataService: AppDataService
  ) {}


  // method to check if user is logged in, used by the auth guard service
  isLoggedIn() {
    // if there is no token in local storage, the user is not logged in
    if (!localStorage.getItem('jarvisToken')) {
      return false;
    } else {
      // if the user is logged in and there is a token, make sure the token has not expired
      if (this.loggedIn && this.token) {
        // if the token is expired, the user is not logged in
        if (this.tokenIsExpired()) {
          return false;
        }
      } else {
        if (!this.loggedInUser) {
          // this means there is no data cached, so need to reach out to the server (page was refreshed)
          // TO-DO: make an call to the server to check the status of the token, and get the decoded user info, token expiration etc.
          // not sure if this is possible, or something we would need to do
        }
      }
    }
    // if didn't return false, user is logged in (using return early style)
    return true;
  }

  // setter method for the loggedIn property
  setLoggedIn(loggedIn: boolean) {
    this.loggedIn = loggedIn;
  }

  // method to compare the timestamps and check to see whether the token expiration date has passed
  // NOTE: this method just uses the cached token data, doesn't need to make a call to the server to decode
  tokenIsExpired(): boolean {
    if (this.token) {
      const expiringAt = moment.unix(this.token.expiringAt);
      const now = moment();
      if (expiringAt.isAfter(now)) {
        return false;
      }
    }
    return true;
  }

  // method to compare the timestamps to see if the token will expire in 2 minutes or less
  tokenIsAboutToExpire(): boolean {
    if (this.token) {
      const expiringAt = moment.unix(this.token.expiringAt);
      const now = moment();
      console.log(`time to expiration in minutes: ${expiringAt.diff(now, 'minutes')}`);
      console.log(`time to expiration in seconds: ${expiringAt.diff(now, 'seconds')}`);
      if (expiringAt.diff(now, 'minutes') < 2) {
        return true;
      }
      return false;
    }
    return false;
  }

  // get the token expiration datetime as a string (convert from unix epoch)
  tokenExpirationDate(): string {
    return moment.unix(this.token.expiringAt).format('dddd, MMMM Do YYYY, h:mm:ss a');
  }

  // get the token issued datetime as a string (convert from unix epoch)
  tokenIssuedDate(): string {
    return moment.unix(this.token.issuedAt).format('dddd, MMMM Do YYYY, h:mm:ss a');
  }

  // update the last activity property, which will be used to determine if the user should be auto-logged out after certain amount of time
  // NOTE: this is stored as unix epoch time (number) to be consistent with the expiringAt and issueAt times
  updateLastActivity() {
    this.lastActivity = moment().unix();
    console.log(`last activity has been updated to: ${moment.unix(this.lastActivity).format('dddd, MMMM Do YYYY, h:mm:ss a')}`);
  }

  // get information from the token like user, issued at, expiring at, by sending it to server to be decoded
  // so it can be cached for performance
  // NOTE: this should only be executed on refresh of pages, will be invoken on app component init (other than the login page?)
  getInfoFromToken() {
    // get the token from local storage
    const token = localStorage.getItem('jarvisToken');
    console.log('token:');
    console.log(token);
    // if the token exists (if is doesn't the token constant will be set to null)
    if (token) {
      this.apiDataService.getInfoFromToken(token)
        .subscribe(
          res => {
            console.log('get info from token response:');
            console.log(res);
            this.token = res.token;
            // if the token is expired, clear the user data/cache (properties in this service) and token, and re-route to the login page
            if (this.tokenIsExpired()) {
              this.clearUserCache();
              this.clearToken();
              this.routeToLogin();
            // if the token is not expired
            } else {
              // store the data in this service
              this.loggedInUser = new User().deserialize(res.jarvisUser);
              this.setLoggedIn(true);
              // emit the logged in user to the app data service, for other components to pick up with subscriptions
              this.appDataService.loggedInUser.emit(this.loggedInUser);
            }
            // TEMP CODE to log the token status
            this.logTokenStatus();
          },
          err => {
            console.log('get info from token error:');
            console.log(err);
            // parse the error _body into an error object to access the info
            const error = JSON.parse(err.text());
            console.log(error);
            // check for token has expired error, just for logging (for now)
            if (error.error.hasOwnProperty('name') && error.error.hasOwnProperty('message') && error.error.hasOwnProperty('expiredAt')) {
              if (error.error.message === 'jwt expired') {
                console.log(`jwt token expired at ${error.error.expiredAt}`);
              }
            }
            // regardless of the cause, clear the user data/cache (properties in this service) and token, and re-route to the login page
            this.clearUserCache();
            this.clearToken();
            this.routeToLogin();
          }
        );
    // if there is no 'jarvisToken' in local storage
    } else {
      console.log('there is no token');
      // clear the user data/cache (properties in this service) and token, and re-route to the login page
      this.clearUserCache();
      this.clearToken();
      this.routeToLogin();
    }


  }

  // clear the data that is used to check for valid login without sending token to server
  // NOTE: we should use this cached data to implement the auth guard with no performance degradation
  // when changing the route to render new component/page.  we only need to sent the token to the server
  // on browser refresh, or when we want to reset the expiration date
  clearUserCache() {
    this.loggedIn = undefined;
    this.loggedInUser = undefined;
    this.token = undefined;
  }

  // remove the token in local storage
  clearToken() {
    localStorage.removeItem('jarvisToken');
  }

  // store the token in local storage
  setToken(token: any) {
    localStorage.setItem('jarvisToken', token);
    sessionStorage.setItem('jarvisToken', token);
  }

  // route to the login component/page (for auto-logout)
  routeToLogin() {

    console.log(this.router.url);
    if (this.router.url !== '/login' && this.router.url !== '/') {

      console.log('routing to login form from auth service (auto logout)');
      this.router.navigate(['/login']);

      this.appDataService.autoLogout$ = {
        message: 'For security you have been logged out',
        iconClass: 'fa-info-circle',
        iconColor: 'rgb(239, 108, 0)'
      };

    }

  }

  // TEMP CODE: to log the token status
  logTokenStatus() {
    if (this.token) {
      console.log(`token was issued at: ${this.tokenIssuedDate()}`);
      console.log(`token is expiring at: ${this.tokenExpirationDate()}`);
      console.log(`token is expired: ${this.tokenIsExpired()}`);
    }
  }

  // this should be executed when the timer is fired
  // to either issue a new token with new expiration, auto log them out, ask them if they want to stay logged in w/ modal, or do nothing
  checkAuthStatus() {
    // don't execute this if the user is on the login page
    if (this.router.url === '/login') {
      return;
    }

    // get the number of minutes and seconds of inactivity (since the last mouse click or key press)
    const numInactivityMins = moment().diff(moment.unix(this.lastActivity), 'minutes');
    const numInactivitySeconds = moment().diff(moment.unix(this.lastActivity), 'seconds');

    // TEMP CODE: to test the timer is working properly
    console.log(`checked auth status at: ${moment().format('dddd, MMMM Do YYYY, h:mm:ss a')}`);
    console.log(`minutes since last user activity: ${numInactivityMins}`);
    if (this.tokenIsAboutToExpire()) {
      console.log('the token is about to expire');
    }

    // if the token is expired, log the user out and display a message on the login page
    if (this.tokenIsExpired()) {
      console.log('logging out due to expired token');
      this.clearUserCache();
      this.clearToken();
      this.routeToLogin();
      // TO-DO: emit a message for the login page to display
    // if there is a logged in user and there has been activity within the last 60 seconds
    // go the the server to get them a new token with pushed out expiration date
    // NOTE: the numInactivitySeconds or numInactivityMinutes should be synched with the timer interval in the app component
    } else if (this.loggedInUser && numInactivitySeconds < 60) {
      console.log('attempting to get a new token with a new expiration date');
      this.apiDataService.resetToken(this.loggedInUser)
        .subscribe(
          res => {
            console.log('reset token response:');
            console.log(res);
            // update the token info in memory
            this.token = res.token;
            // remove and reset the token in local storage
            this.clearToken();
            this.setToken(res.token.signedToken);
            // TEMP CODE to log the token status
            this.logTokenStatus();
          },
          err => {
            console.log('reset token error:');
            console.log(err);
          }
        );
    }

  }

}
