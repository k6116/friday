import { Component, HostListener, OnInit } from '@angular/core';
import { Location, PlatformLocation } from '@angular/common';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import { CacheService } from './_shared/services/cache.service';
import { AuthService } from './_shared/services/auth.service';
import { ClickTrackingService } from './_shared/services/click-tracking.service';
import { WebsocketService } from './_shared/services/websocket.service';
import { RoutingHistoryService } from './_shared/services/routing-history.service';

// import * as bowser from 'bowser';
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
  subscription2: Subscription;

  // NOTE: this is the 'new' way to do it but not working
  // @HostListener('click') onDocumentClicked() {
  //   // console.log('document was clicked');
  // }

  @HostListener('window:popstate', ['$event'])
  onPopState(event) {
    console.log('browser button pressed');
    console.log(event);
  }

  constructor(
    private router: Router,
    private cacheService: CacheService,
    private authService: AuthService,
    private clickTrackingService: ClickTrackingService,
    private websocketService: WebsocketService,
    private routingHistoryService: RoutingHistoryService,
    private location: Location
  ) {

    // set the timer interval in minutes, used to check for user activity like a click and keypress
    // to reset the token expiration
    this.timerInterval = 1;

    this.routingHistoryService.loadRouting();

  }

  ngOnInit() {

    // console.log(`app component has been initialized`);

    // connect to the websocket
    this.websocketService.connect();

    // insert a record into the click tracking table as a page load; to capture the browser
    this.clickTrackingService.logClickWithEvent(`page: App Load, clickedOn: null`);

    // start a timer to fire every x minutes to check the login status
    // console.log('starting timer for auth service');
    this.startTimer();

    // update the last activity property with a new timestamp
    this.authService.updateLastActivity();

    // attempt to get user info, expiration date etc. from the token if one exists
    this.authService.getInfoFromToken();

    // subscibe to the resetTimer, can be used to synch up the clock
    this.subscription1 = this.cacheService.resetTimer.subscribe(
      (resetTimer: boolean) => {
        // console.log('subscription to resetTimer receivevd in the app component');
        this.resetTimer();
    });

    this.location.subscribe(x => {
      console.log(x);
    });

  }

  onDocumentEvent() {
    // update the last activity property with a new timestamp
    this.authService.updateLastActivity();
  }

  onDocumentClick(event) {
    // update the last activity property with a new timestamp
    this.authService.updateLastActivity();
    // emit the clicked class to the data service for a click outside type solution
    // this.cacheService.clickedClass.emit(event.target.className);
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
