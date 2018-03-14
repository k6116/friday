import { Injectable } from '@angular/core';
import { Router, CanActivate } from '@angular/router';
import { AuthService } from './auth.service';


@Injectable()
export class AuthGuardService implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  // method used by the app routing file to protect certain component routes if the user is not logged in
  canActivate(): boolean {
    // call the authservice method to check if the user is logged in
    if (this.authService.isLoggedIn()) {
      return true;
    }
    // if the user is not logged in, re-route them to the login page
    this.router.navigate(['/login']);
    // return false to implement the auth guard
    return false;
  }

}
