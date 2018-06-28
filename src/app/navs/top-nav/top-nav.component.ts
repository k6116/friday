import { Component, OnInit, ViewChild, Output } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { trigger, state, style, transition, animate, keyframes, group } from '@angular/animations';
import { Subscription } from 'rxjs/Subscription';
import { User } from '../../_shared/models/user.model';
import { AuthService } from '../../_shared/services/auth.service';
import { AppDataService } from '../../_shared/services/app-data.service';
import { ApiDataService } from '../../_shared/services/api-data.service';
import { ProfileModalComponent } from '../../modals/profile-modal/profile-modal.component';

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
export class TopNavComponent implements OnInit {

  loggedInUser: User;
  firstInitial: string;
  dropDownClasses: string[];
  subscription1: Subscription;
  showDropDown: boolean;
  state: string;
  projectList: any; // array to hold list of all projects queried from DB
  showProfileModal: boolean;

  @ViewChild(ProfileModalComponent) profileModal: ProfileModalComponent;

  constructor(
    private router: Router,
    private authService: AuthService,
    private appDataService: AppDataService,
    private apiDataService: ApiDataService,
    private route: ActivatedRoute
  ) {

    this.showDropDown = false;

  }


  ngOnInit() {

    console.log(`top nav component has been initialized`);

    this.loggedInUser = this.authService.loggedInUser;

    this.firstInitial = this.loggedInUser.fullName.substring(0, 1).toUpperCase();

    // get the logged in user object from the auth service
    // most of the time, this will be stored in the cache when navigating around the app
    // this.authService.getLoggedInUser((user, err) => {
    //   if (err) {
    //     console.error(`error getting logged in user: ${err}`);
    //     return;
    //   }
    //   this.loggedInUser = user;
    //   // console.log('logged in user object received in top nav component on init:');
    //   // console.log(this.loggedInUser);
    //   // get the user's first name initial to create the google style 'avatar'
    //   this.firstInitial = this.loggedInUser.fullName.substring(0, 1).toUpperCase();
    // });

    // set state to in to enable the angular animations
    this.state = 'in';

  }

  // when the identity area is clicked (logo and text), refresh the page directed to the main route
  onAppClick() {
    window.location.href = '/main';
  }

  // when the avatar icon is clicked, toggle the property which will either show or hide it using *ngIf
  onAvatarClick() {
    this.showDropDown = !this.showDropDown;
  }

  onClickOutside(targetElement) {
    this.showDropDown = false;
  }

  onProfileButtonClick() {
    this.showDropDown = false;
    this.showProfileModal = true;
    this.profileModal.getJobTitleList();
  }


  onLogoutButtonClick() {
    // clear any data in the app data service (cache) that should be cleared on logout
    this.clearCacheOnLogout();
    // log the user out and don't show auto-logout message by passing in false
    this.authService.logout(false);
  }

  clearCacheOnLogout() {
    this.appDataService.nestedOrgDataRequested = undefined;
  }

}
