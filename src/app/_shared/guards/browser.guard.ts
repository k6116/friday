import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs/Observable';

import * as bowser from 'bowser';


@Injectable()
export class BrowserGuard implements CanActivate {

  constructor(
    private router: Router
  ) { }


  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {

    if (bowser.name === 'Chrome' && +bowser.version >= 65) {
      return true;
    } else {
      this.router.navigateByUrl('/block');
      return false;
    }

  }

}
