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
    this.dropDownClasses = [
      'app-menu-dropdown',
      'app-menu-text',
      'app-menu-dropdown-cont',
      'app-menu-dropdown-name',
      'app-menu-dropdown-email',
      'app-menu-dropdown-button',
      'app-menu-dropdown-button',
      'dropdown-triangle',
      'dropdown-triangle-bottom'
    ];

    this.showDropDown = false;

  }

  ngOnInit() {

    this.authService.getLoggedInUser((user, err) => {
      if (err) {
        console.log(`error getting logged in user: ${err}`);
        return;
      }
      console.log('logged in user data received in top navbar component:');
      console.log(user);
      this.loggedInUser = user;
      this.firstInitial = this.loggedInUser.fullName.substring(0, 1).toUpperCase();
    });

    this.subscription1 = this.appDataService.clickedClass.subscribe(
      (clickedClass: string) => {
        console.log('clickedClass received in navbar component: ' + clickedClass);
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
    console.log('avatar clicked');
    console.log(this.showDropDown);
    // const dropdownClass = 'div.app-menu-dropdown-cont';
    // const visible = $(dropdownClass).css('visibility');
    // if (visible === 'visible') {
    //   $(dropdownClass).css('opacity', '0');
    //   setTimeout(() => {
    //     $(dropdownClass).css('visibility', 'hidden');
    //   }, 100);
    // } else {
    //   $(dropdownClass).css('visibility', 'visible');
    //   $(dropdownClass).css('opacity', '1');
    // }
  }

  hideDropDown(clickedClass: string) {
    // const dropdownClass = 'div.app-menu-dropdown-cont';
    // const visible = $(dropdownClass).css('visibility');
    if (this.showDropDown) {
      if (!this.dropDownClasses.includes(clickedClass.split(' ')[0])) {
        this.showDropDown = false;
        // $(dropdownClass).css('opacity', '0');
        // setTimeout(() => {
        //   $(dropdownClass).css('visibility', 'hidden');
        // }, 100);
      }
    }
  }

  onProfileButtonClick() {
    console.log('profile button clicked');
  }

  onLogoutButtonClick() {
    console.log('logout button clicked');
    // log the user out, don't show auto-logout message
    this.authService.routeToLogin(false);
  }

}
