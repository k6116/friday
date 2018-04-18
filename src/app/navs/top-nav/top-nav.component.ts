import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { trigger, state, style, transition, animate, keyframes, group } from '@angular/animations';
import { Subscription } from 'rxjs/Subscription';
import { User } from '../../_shared/models/user.model';
import { AuthService } from '../../auth/auth.service';
import { AppDataService } from '../../_shared/services/app-data.service';

declare var $: any;

@Component({
  selector: 'app-top-nav',
  templateUrl: './top-nav.component.html',
  styleUrls: ['./top-nav.component.css'],
  animations: [
    trigger('conditionState', [
      state('in', style({
        opacity: 1
      })),
      transition('in => void', [
        animate(100, style({
          opacity: 0
        }))
      ]),
      transition('void => in', [
        animate(350, style({
          opacity: 1
        }))
      ])
    ])
  ]
})
export class TopNavComponent implements OnInit, OnDestroy {

  loggedInUser: User;
  firstInitial: string;
  dropDownClasses: string[];
  subscription1: Subscription;
  showDropDown: boolean;
  state: string;

  constructor(
    private router: Router,
    private authService: AuthService,
    private appDataService: AppDataService
  ) {

    // TO-DO: try to find a simpler/cleaner way to hide the dropdown on click outside
    // NOTE: ng4 click outside will only work outside (but within) the navbar component

    this.showDropDown = false;

  }


  ngOnInit() {

    this.authService.getLoggedInUser((user, err) => {
      if (err) {
        console.log(`error getting logged in user: ${err}`);
        return;
      }
      this.loggedInUser = user;
      this.firstInitial = this.loggedInUser.fullName.substring(0, 1).toUpperCase();
    });

    this.subscription1 = this.appDataService.clickedClass.subscribe(
      (clickedClass: string) => {
        this.hideDropDown(clickedClass);
    });

    this.state = 'in';
  }


  ngOnDestroy() {
    this.subscription1.unsubscribe();
  }


  onAppClick() {
    window.location.href = '/main';
  }


  onAvatarClick() {
    this.showDropDown = !this.showDropDown;
  }


  hideDropDown(clickedClass: string) {
    if (this.showDropDown) {
      if (clickedClass.split(' ')[0] !== 'topnav-menu') {
        this.showDropDown = false;
      }
    }
  }


  onProfileButtonClick() {
    console.log('profile button clicked');
  }


  onLogoutButtonClick() {
    // log the user out, don't show auto-logout message
    this.authService.routeToLogin(false);
  }


}
