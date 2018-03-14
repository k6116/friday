import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { ApiDataService } from '../../_shared/services/api-data.service';
import { AuthService } from '../auth.service';
import { ToolsService } from '../../_shared/services/tools.service';
import { User } from '../../_shared/models/user.model';

import * as moment from 'moment';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  // view childs are set up for the user name and password inputs so the focus() method can be used
  // tied to #userNameVC and #passwordVC in the html
  @ViewChild('userNameVC') userNameVC: ElementRef;
  @ViewChild('passwordVC') passwordVC: ElementRef;

  // properties used for two way binding, with ngModel
  userName: string;
  password: string;

  // properties used for the error message display (invalid login etc.)
  loginMessage: string;
  loginSuccess: boolean;
  showMessage: boolean;
  iconClass: string;

  // temp code for testing user model
  loggedInUser: User;
  users: User;

  constructor(
    private router: Router,
    private apiDataService: ApiDataService,
    private authService: AuthService,
    private toolsService: ToolsService
  ) { }

  ngOnInit() {

    // TEMP CODE: testing the user model and object
    this.apiDataService.getUserData()
      .subscribe(
        res => {
          this.users = res.map(user => new User().deserialize(user));
          console.log('all users:');
          console.log(this.users);
          console.log(`minutes since last update of first user record (${this.users[0].fullName}):`);
          console.log(this.users[0].minutesSinceLastUpdate());
        },
        err => {
          console.log('error getting users data:');
          console.log(err);
        }
      );

  }


  onLoginClick() {

    // reset and hide the error message if any is already displayed
    this.resetErrorMessage();

    // check for form entry errors (missing user name or password)
    if (this.hasFormEntryErrors()) {
      this.displayFormEntryErrors();
      return;
    }

    // construct a user/login object that will be passed in the request body
    const user = {
      userName: this.userName,
      password: this.password
    };

    // start timer for authentication time
    const t0 = performance.now();

    // call the api data service to authenticate the user credentials
    this.apiDataService.authenticate(user)
      .subscribe(
        res => {

          // log the time it took to authenticate
          this.logAuthPerformance(t0);

          // TEMP CODE: to log the response
          console.log('successfull authentication response:');
          console.log(res);

          // store data in the auth service related to the logged in user
          this.authService.loggedInUser = new User().deserialize(res.jarvisUser);
          // this.authService.loggedInUser = new User(res.jarvisUser);
          this.authService.token = res.token;
          this.authService.setLoggedIn(true);

          // store the jwt token in local storage
          localStorage.setItem('jarvisToken', res.token.signedToken);

          // display the message (auth success or failure)
          // this.displayMessage(true, `Login successfull for ${this.authService.loggedInUser.fullName}`);

          // route to the main page
          this.router.navigateByUrl('/main');

        },
        err => {

          // log the time it took to authenticate
          this.logAuthPerformance(t0);

          // TEMP CODE to log the response (error)
          console.log('authentication response with errors:');
          console.log(err);

          // display the appropriate message depending on the type of error (timeout, invalid credentials, etc.)
          this.handleErrorMessage(err);
        }
      );
  }


  // reset and hide the error message
  resetErrorMessage() {
    this.loginMessage = undefined;
    this.showMessage = false;
  }

  // simple check for form entry error (missing either user name or password or both)
  hasFormEntryErrors(): boolean {
    if (!this.userName || !this.password) {
      return true;
    }
  }

  // display error message and icon for missing username or password, also set focus for the user for convenience
  displayFormEntryErrors() {
    if (!this.userName && !this.password) {
      this.displayMessage(false, 'Please enter your user name and password');
      this.userNameVC.nativeElement.focus();
    } else if (!this.userName) {
      this.displayMessage(false, 'Please enter your user name');
      this.userNameVC.nativeElement.focus();
    } else if (!this.password) {
      this.displayMessage(false, 'Please enter your password');
      this.passwordVC.nativeElement.focus();
    }
  }

  // TEMP CODE to log the total time it took to authenticate
  logAuthPerformance(t0: number) {
    const t1 = performance.now();
    console.log(`authentication took ${t1 - t0} milliseconds`);
  }

  // display authentication error or success message
  // TO-DO: change this to just displayLoginErrorMessage, since we will route to the main page on success
  displayMessage(success: boolean, message: string) {
    this.loginSuccess = success;
    this.loginMessage = message;
    this.iconClass = success ? 'fa-check-circle' : 'fa-exclamation-triangle';
    this.showMessage = true;
  }

  // for an error response, check for various types or errors and display the appropriate message
  handleErrorMessage(err: any) {
    // check for no response (net::ERR_CONNECTION_REFUSED etc.)
    if (err.status === 0) {
      this.displayMessage(false, 'Server is not responding');
    // check for timeout error
    } else if (err.hasOwnProperty('name')) {
      if (err.name === 'TimeoutError') {
        this.displayMessage(false, 'Server timed out');
      }
    // otherwise, this should be a failed login (invalid credentials)
    } else {
      this.displayMessage(false, 'Invalid user name or password');
    }
  }


}
