import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from './auth.service';
import { AppDataService } from '../_shared/services/app-data.service';


@Injectable()
export class AuthGuardService implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router,
    private appDataService: AppDataService
  ) { }

  // method used by the app routing file to protect certain component routes if the user is not logged in
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {

    // store the url/path that the user was attempting to go to
    // in the case that they need to log in, it will be used to navigate to that page (for deep linking)
    this.appDataService.appLoadPath = state.url;

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
