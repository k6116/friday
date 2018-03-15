import { Component, HostListener, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import { AppDataService } from './_shared/services/app-data.service';
import { AuthService } from './auth/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  // tslint:disable-next-line:use-host-property-decorator
  host: {
    '(document:click)': 'onDocumentEvent()',
    '(document:keydown)': 'onDocumentEvent()'
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
    private authService: AuthService
  ) {

    this.timerInterval = 1;

  }

  ngOnInit() {
    // start a timer to fire every x minutes to check the login status
    this.startTimer();
    // update the last activity property with a new timestamp
    this.authService.updateLastActivity();
    // attempt to get user info, expiration date etc. from the token if one exists
    this.authService.getInfoFromToken();

    this.subscription1 = this.appDataService.resetTimer.subscribe(
      (resetTimer: boolean) => {
        // console.log('subscription to resetTimer receivevd in the app component');
        this.resetTimer();
    });

    // log the init and current path
    // NOTE: this could be used to redirect to main or login if they go directly to a different path
    // the setTimeout with zero is needed here (could try to put it in afterViewInit though)
    setTimeout(() => {
      // console.log('app component has been initialized');
      // console.log(`current route is: ${this.router.url}`);
    }, 0);


  }

  onDocumentEvent() {
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
