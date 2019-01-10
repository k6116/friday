import { Injectable } from '@angular/core';
import { Router, Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/delay';
import 'rxjs/add/observable/empty';

import { AuthService } from './auth.service';
import { ApiDataAuthService } from './api-data/_index';
import { User } from '../models/user.model';


@Injectable()
export class UserResolverService implements Resolve<Observable<string>> {

  constructor(
    private router: Router,
    private authService: AuthService,
    private apiDataAuthService: ApiDataAuthService
  ) { }

  // TO-DO BILL: comment!!!

  // NOTE: the resolver will guarantee the data will be there before any of the components are initialized,
  // but not for any of the guards

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
    if (this.authService.loggedInUser) {
      // console.log('returning logged in user data from memory');
      // console.log(this.authService.loggedInUser);
      return Observable.of({user: this.authService.loggedInUser});
    } else {
      const token = localStorage.getItem('jarvisToken');
      if (token) {
        // console.log('logged in user does not exist in memory, getting from token instead');
        return this.apiDataAuthService.getInfoFromToken(token);
      } else {
        // use router to reroute to login page or error page?
        // console.error('returning empty observable due to no token');
        return Observable.empty();
      }
    }
  }

}
