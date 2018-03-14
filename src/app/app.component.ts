import { Component, HostListener, OnInit } from '@angular/core';
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

  // @HostListener('click') onDocumentClicked() {
  //   console.log('document was clicked');
  // }

  constructor(
    private authService: AuthService,
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


}
