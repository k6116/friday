import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { CacheService } from '..//services/cache.service';


@Injectable()
export class AuthGuardService implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router,
    private cacheService: CacheService
  ) { }

  // method used by the app routing file to protect certain component routes if the user is not logged in
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {

    // store the url/path that the user was attempting to go to
    // in the case that they need to log in, it will be used to navigate to that page (for deep linking)
    this.cacheService.appLoadPath = state.url;

    // call the authservice method to check if the user is logged in (return early approach, no else here)
    if (this.authService.isLoggedIn()) {
      // console.log(`auth guard returning true, allowing navigation to ${state.url}`);
      return true;
    }

    // console.log(`auth guard returning false, blocking navigation to ${state.url} and kicking out to login page`);

    // if the user is not logged in, re-route them to the login page
    this.router.navigate(['/login']);

    // return false to implement the auth guard
    return false;

  }

}
