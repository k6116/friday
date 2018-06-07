import { Component, HostListener, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import { AppDataService } from './_shared/services/app-data.service';
import { AuthService } from './auth/auth.service';
import { ClickTrackingService } from './_shared/services/click-tracking.service';
import { WebsocketService } from './_shared/services/websocket.service';

import * as bowser from 'bowser';
declare var $: any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  // tslint:disable-next-line:use-host-property-decorator
  host: {
    '(document:click)': 'onDocumentClick($event)',
    '(document:keydown)': 'onDocumentKeyDown()'
  }
})
export class AppComponent implements OnInit {

  timer: any;
  timerInterval: number;  // interval in minutes
  subscription1: Subscription;

  // NOTE: this is the 'new' way to do it but not working
  // @HostListener('click') onDocumentClicked() {
  //   console.log('document was clicked');
  // }

  constructor(
    private router: Router,
    private appDataService: AppDataService,
    private authService: AuthService,
    private clickTrackingService: ClickTrackingService,
    private websocketService: WebsocketService
  ) {

    // set the timer interval in minutes, used to check for user activity
    this.timerInterval = 1;

  }

  ngOnInit() {

    console.log(`app component has been initialized`);

    // connect to the websocket
    this.websocketService.connect();

    // check for browser compatibility
    const browserCheck = this.browserIsCompatible();

    // if the browser is not compatible, navigate (redirect) to the block page
    if (!browserCheck) {
      this.router.navigateByUrl('/block');
    // continue otherwise if the browser is compatible
    } else {
      // start a timer to fire every x minutes to check the login status
      console.log('starting timer for auth service');
      this.startTimer();
      // update the last activity property with a new timestamp
      this.authService.updateLastActivity();
      // attempt to get user info, expiration date etc. from the token if one exists
      this.authService.getInfoFromToken();

    }

    this.subscription1 = this.appDataService.resetTimer.subscribe(
      (resetTimer: boolean) => {
        // console.log('subscription to resetTimer receivevd in the app component');
        this.resetTimer();
    });

    // TEMP CODE: log the init and current path
    // NOTE: this could be used to redirect to main or login if they go directly to a different path
    // the setTimeout with zero is needed here (could try to put it in afterViewInit though)
    setTimeout(() => {
      console.log(`app component has been initialized; current route is: ${this.router.url}`);
    }, 0);

  }

  // returns true or false depending on whether they are using Chrome version 65.0 or later
  browserIsCompatible(): boolean {
    return bowser.name === 'Chrome' && +bowser.version >= 65;
  }


  onDocumentEvent() {
    // update the last activity property with a new timestamp
    this.authService.updateLastActivity();
  }

  onDocumentClick(event) {
    // update the last activity property with a new timestamp
    this.authService.updateLastActivity();
    // emit the clicked class to the data service for a click outside type solution
    // this.appDataService.clickedClass.emit(event.target.className);
    // send the event to the click tracking service to log in the database if appropriate
    this.clickTrackingService.logClickWithAttribute(event);
  }

  onDocumentKeyDown() {
    // update the last activity property with a new timestamp
    this.authService.updateLastActivity();
  }

  startTimer() {
    // re-check the login status every x minutes
    this.timer = setInterval(() => {
      this.authService.checkAuthStatus();
    }, 1000 * 60 * this.timerInterval);
  }

  resetTimer() {
    // clear (stop) the existing timer
    clearInterval(this.timer);
    // re-start the timer to check the login status
    this.timer = setInterval(() => {
      this.authService.checkAuthStatus();
    }, 1000 * 60 * this.timerInterval);
  }


}
