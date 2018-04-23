import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

import { AuthService } from '../auth/auth.service';


@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css', '../_shared/styles/common.css']
})
export class MainComponent implements OnInit {

  constructor(
    private authService: AuthService
  ) { }

  ngOnInit() {

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
