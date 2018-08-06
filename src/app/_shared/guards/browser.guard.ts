import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { AuthService } from '../services/auth.service';

import * as bowser from 'bowser';


@Injectable()
export class BrowserGuard implements CanActivate {

  constructor(
    private router: Router,
    private authService: AuthService
  ) { }


  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {

    // define a list of compatible browsers and minimum supported versions
    const compatibleBrowsers = [
      {
        name: 'Chrome',
        version: 65
      },
      {
        name: 'Firefox',
        version: 60
      },
      {
        name: 'Microsoft Edge',
        version: 13
      }
    ];

    // get the browser and browser version being used, using the bowser library
    const browserName = bowser.name;
    const browserVersion = +bowser.version;

    // check to see if the browser is in the list
    const foundBrowser = compatibleBrowsers.find(browser => {
      return browser.name === browserName;
    });

    // if the browser was found, make sure the version is compatible
    // if not compatible, return false to implement the guard and navigate to the block component/page
    if (foundBrowser) {
      if (browserVersion >= foundBrowser.version) {
        return true;  // browser and version are compatible
      } else {
        this.router.navigateByUrl('/block');
        return false; // broswer is compabible, but the versison is out of date
      }
    } else {
      this.router.navigateByUrl('/block');
      return false; // browser is not in the list of compatible browsers
    }



  }

}
