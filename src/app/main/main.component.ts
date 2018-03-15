import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { AuthService } from '../auth/auth.service';
import { User } from '../_shared/models/user.model';
import { AppDataService } from '../_shared/services/app-data.service';


@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit, OnDestroy {

  loggedInUser: User;
  subscription1: Subscription;

  constructor(
    private authService: AuthService,
    private appDataService: AppDataService
  ) { }

  ngOnInit() {

    // if coming from the login page or any other page, this should be picked up instantly
    this.loggedInUser = this.authService.loggedInUser;
    console.log('logged in user on init from authService:');
    console.log(this.loggedInUser);

    // NOTE: this is really only needed when they refresh this page
    // there will be a small delay to decode the token and get the user data to display
    this.subscription1 = this.appDataService.loggedInUser.subscribe(
      (loggedInUser: any) => {
        console.log('subscription to loggedInUser receivevd in the main component');
        this.loggedInUser = loggedInUser;
    });

  }

  ngOnDestroy() {
    this.subscription1.unsubscribe();
  }

  onConfirmYesClick() {
    console.log('user clicked yes in the confirm modal');
    this.authService.modalIsDisplayed = undefined;
    this.authService.resetToken();
  }

  onConfirmCancelClick() {
    console.log('user clicked cancel in the confirm modal');
    this.authService.modalIsDisplayed = undefined;
    this.authService.routeToLogin(false);
  }

}
