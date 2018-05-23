import { Injectable } from '@angular/core';
import { Router, Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/delay';
import 'rxjs/add/observable/empty';

import { AuthService } from '../../auth/auth.service';
import { ApiDataService } from '../services/api-data.service';
import { User } from '../models/user.model';


@Injectable()
export class UserResolverService implements Resolve<Observable<string>> {

  constructor(
    private router: Router,
    private authService: AuthService,
    private apiDataService: ApiDataService
  ) { }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
    // return Observable.of('Hello Alligator!');
    if (this.authService.loggedInUser) {
      console.log('returning logged in user data from memory');
      console.log(this.authService.loggedInUser);
      return Observable.of({jarvisUser: this.authService.loggedInUser});
    } else {
      const token = localStorage.getItem('jarvisToken');
      if (token) {
        console.log('logged in user does not exist in memory, getting from token instead');
        return this.apiDataService.getInfoFromToken(token);
        // .subscribe(
        //   res => {
        //     console.log(res);
        //     this.authService.loggedInUser = new User().deserialize(res.jarvisUser);
        //     return Observable.of(this.authService.loggedInUser);
        //   },
        //   err => {
        //     // use router to reroute to login page or error page?
        //     console.error('error getting logged in user data from the token');
        //     return Observable.empty<any>();
        //   }
        // );
      } else {
        // use router to reroute to login page or error page?
        console.error('returning empty observable due to no token');
        return Observable.empty();
      }
    }
  }

}
