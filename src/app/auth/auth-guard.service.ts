import { Injectable } from '@angular/core';
import { Router, CanActivate } from '@angular/router';
import { AuthService } from './auth.service';


@Injectable()
export class AuthGuardService implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  // method used by the app routing file to protect certain routes if the user is not logged in
  canActivate() {
    if (this.authService.isLoggedIn()) {
      return true;
    }
    // if the user is not logged in, re-route them to the login page
    this.router.navigate(['/login']);
    // return false to implement the guard
    return false;
  }

}
