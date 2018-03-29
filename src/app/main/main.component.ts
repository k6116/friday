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

    this.authService.getLoggedInUser((user, err) => {
      if (err) {
        console.log(`error getting logged in user: ${err}`);
        return;
      }
      console.log('logged in user data received in main component:');
      console.log(user);
      this.loggedInUser = user;
    });

  }

  ngOnDestroy() {
  }

  onLogoutClick() {
    // log the user out, don't show auto-logout message
    this.authService.routeToLogin(false);
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
