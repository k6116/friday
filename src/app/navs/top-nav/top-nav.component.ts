import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { trigger, state, style, transition, animate, keyframes, group } from '@angular/animations';
import { Subscription } from 'rxjs/Subscription';
import { User } from '../../_shared/models/user.model';
import { AuthService } from '../../auth/auth.service';
import { AppDataService } from '../../_shared/services/app-data.service';
import { ApiDataService } from '../../_shared/services/api-data.service';
import { ProfileModalComponent } from '../../modals/profile-modal/profile-modal';

declare var $: any;

@Component({
  selector: 'app-top-nav',
  templateUrl: './top-nav.component.html',
  styleUrls: ['./top-nav.component.css'],
  // TO-DO: figure out why the void to in transition doesn't seem to be working
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
  projectList: any; // array to hold list of all projects queried from DB
  jobTitle: string;
  value: number;

  constructor(
    private router: Router,
    private authService: AuthService,
    private appDataService: AppDataService,
    private apiDataService: ApiDataService
  ) {

    // TO-DO: try to find a simpler/cleaner way to hide the dropdown on click outside
    // NOTE: ng4 click outside will only work outside (but within) the navbar component
    this.showDropDown = false;

  }


  ngOnInit() {

    // get the logged in user object from the auth service
    // most of the time, this will be stored in the cache when navigating around the app
    this.authService.getLoggedInUser((user, err) => {
      if (err) {
        console.error(`error getting logged in user: ${err}`);
        return;
      }
      this.loggedInUser = user;
      // console.log('logged in user object received in top nav component on init:');
      // console.log(this.loggedInUser);
      // get the user's first name initial to create the google style 'avatar'
      this.firstInitial = this.loggedInUser.fullName.substring(0, 1).toUpperCase();
    });

    // subscribe to the clickedClass property, to determine if the dropdown container should be closed if it is open
    this.subscription1 = this.appDataService.clickedClass.subscribe(
      (clickedClass: string) => {
        this.hideDropDown(clickedClass);
    });

    // set state to in to enable the angular animations
    this.state = 'in';

  }


  ngOnDestroy() {
    this.subscription1.unsubscribe();
  }

  // when the identity area is clicked (logo and text), refresh the page directed to the main route
  onAppClick() {
    window.location.href = '/main';
  }

  // when the avatar icon is clicked, toggle the property which will either show or hide it using *ngIf
  onAvatarClick() {
    this.showDropDown = !this.showDropDown;
  }

  // hide the drop down container if the clicked class is not one inside the container
  // note: this is the current 'click outside' solution,
  // that will close it if the user clicks anywhere else other than in the container itself
  hideDropDown(clickedClass: string) {
    if (this.showDropDown) {
      if (clickedClass.split(' ')[0] !== 'topnav-menu') {
        this.showDropDown = false;
      }
    }
  }


  onProfileButtonClick() {
    // TEMP CODE: log the click to test the button
    console.log('profile button clicked');
    this.getJobTitle();
  }


  onLogoutButtonClick() {
    // clear any data in the app data service (cache) that should be cleared on logout
    this.clearCacheOnLogout();
    // log the user out and don't show auto-logout message by passing in false
    this.authService.routeToLogin(false);
  }

  clearCacheOnLogout() {
    this.appDataService.nestedOrgDataRequested = undefined;
  }

  getJobTitle() {

    this.apiDataService.getJobTitle().subscribe(
      res => {
        console.log('getJobTitle WORKS');
        this.jobTitle = res;
        this.value = this.jobTitle.length;
        console.log(this.jobTitle);
        console.log(this.value);
      },
      err => {
        console.log(err);
      }
    );
  }

}
