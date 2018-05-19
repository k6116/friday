import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

import { AuthService } from '../auth/auth.service';
import { AppDataService } from '../_shared/services/app-data.service';


@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css', '../_shared/styles/common.css']
})
export class MainComponent implements OnInit, OnDestroy {

  constructor(
    private authService: AuthService,
    private appDataService: AppDataService
  ) { }

  confirmModalResponseSubscription: Subscription;

  ngOnInit() {
    this.confirmModalResponseSubscription = this.appDataService.confirmModalResponse.subscribe( res => {
      if (res) {
        this.onConfirmYesClick();
      } else {
        this.onConfirmCancelClick();
      }
    });
  }

  ngOnDestroy() {
    this.confirmModalResponseSubscription.unsubscribe();
  }

  onConfirmYesClick() {
    // console.log('user clicked yes in the confirm modal');
    this.authService.modalIsDisplayed = undefined;
    this.authService.resetToken();
  }


  onConfirmCancelClick() {
    // console.log('user clicked cancel in the confirm modal');
    this.authService.modalIsDisplayed = undefined;
    this.authService.routeToLogin(false);
  }

}
