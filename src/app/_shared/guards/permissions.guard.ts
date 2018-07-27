import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { AuthService } from '../services/auth.service';
import { CacheService } from '../services/cache.service';
import { ApiDataAuthService } from '../services/api-data/api-data-auth.service';
// import 'rxjs/add/operator/toPromise';

import * as decode from 'jwt-decode';

@Injectable()
export class PermissionsGuard implements CanActivate {

  constructor(
    private router: Router,
    private authService: AuthService,
    private cacheService: CacheService,
    private apiDataAuthService: ApiDataAuthService
  ) { }

  async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {

    // get the token from local storage
    // NOTE: we can count on the token being there; if it is not, the user would have been logged out already
    // with the AuthGuardService on the main route
    const token = localStorage.getItem('jarvisToken');

    // send the token and route path (e.g. /main/admin) to the server to verify the user has the permissions to navigate
    // NOTE: this must be done synchronously using async / await
    if (await this.apiDataAuthService.verifyRoutePermissions(token, state.url)
      .catch(err => {
        return false;
      })
    ) {
      this.cacheService.navigatedPath.emit(state.url);
      return true;
    }


  }


}
