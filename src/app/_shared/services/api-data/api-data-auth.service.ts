import { Injectable } from '@angular/core';
import { Http, Headers, Response, RequestOptions, ResponseContentType } from '@angular/http';
import { Observable } from 'rxjs/observable';
import { forkJoin } from 'rxjs/observable/forkJoin';
import { CacheService } from '../cache.service';
import 'rxjs/add/operator/map';


@Injectable()
export class ApiDataAuthService {

  constructor(
    private http: Http,
    private cacheService: CacheService
  ) { }

  // attempt to authenticate the user credentials using windows login and ldap
  authenticate(user: any): Observable<any> {
    const headers = new Headers({'Content-Type': 'application/json'});
    const options = new RequestOptions({headers: headers});
    return this.http.post('/api/login', JSON.stringify(user), options)
      .timeout(this.cacheService.apiDataTimeout)
      .map((response: Response) => response.json());
  }

  // decode the jwt token to get the user info, issued and expiration dates
  getInfoFromToken(token): Observable<any> {
    const queryString = '?token=' + token;
    return this.http.get(`/api/getInfoFromToken${queryString}`)
      .timeout(this.cacheService.apiDataTimeout)
      .map((response: Response) => response.json());
  }

  // reset / get a new token with pushed out expiration date
  resetToken(user: any): Observable<any> {
    const headers = new Headers({'Content-Type': 'application/json'});
    const options = new RequestOptions({headers: headers});
    return this.http.post(`/api/resetToken`, JSON.stringify(user), options)
      .timeout(this.cacheService.apiDataTimeout)
      .map((response: Response) => response.json());
  }

  // get a list of the background image file names and captions
  getLoginBackgroundImages(): Observable<any> {
    return this.http.get(`/api/getLoginBackgroundImages`)
      .timeout(this.cacheService.apiDataTimeout)
      .map((response: Response) => response.json());
  }

  // TEMP CODE: for websockets testing
  getLoggedInUsers(): Observable<any> {
    return this.http.get(`/api/getLoggedInUsers`)
      .timeout(this.cacheService.apiDataTimeout)
      .map((response: Response) => response.json());
  }

  // TEMP CODE: for websockets testing
  logout(userName): Observable<any> {
    return this.http.get(`/api/logout/${userName}`)
      .timeout(this.cacheService.apiDataTimeout)
      .map((response: Response) => response.json());
  }

}
