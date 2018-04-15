import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { User } from '../../_shared/models/user.model';
import { AuthService } from '../../auth/auth.service';

declare var $: any;

@Component({
  selector: 'app-top-nav',
  templateUrl: './top-nav.component.html',
  styleUrls: ['./top-nav.component.css']
})
export class TopNavComponent implements OnInit {

  loggedInUser: User;
  firstInitial: string;

  constructor(
    private router: Router,
    private authService: AuthService
  ) { }

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

  }

  onAppClick() {
    window.location.href = '/main';
  }


  onAvatarClick() {
    const dropdownClass = 'div.app-menu-dropdown-cont';
    const visible = $(dropdownClass).css('visibility');
    if (visible === 'visible') {
      $(dropdownClass).css('opacity', '0');
      setTimeout(() => {
        $(dropdownClass).css('visibility', 'hidden');
      }, 100);
    } else {
      $(dropdownClass).css('visibility', 'visible');
      $(dropdownClass).css('opacity', '1');
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
