import { Injectable } from '@angular/core';
import { Http, Headers, Response, RequestOptions, ResponseContentType } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { forkJoin } from 'rxjs/Observable/forkJoin';
import { CacheService } from '../cache.service';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/toPromise';


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
    return this.http.post('/api/auth/authenticate', JSON.stringify(user), options)
      .timeout(this.cacheService.apiDataTimeout)
      .map((response: Response) => response.json());
  }

  // attempt to authenticate the user credentials using windows login and ldap
  async authenticateSync(user: any): Promise<any> {
    const headers = new Headers({'Content-Type': 'application/json'});
    const options = new RequestOptions({headers: headers});
    return await this.http.post('/api/auth/authenticate', JSON.stringify(user), options)
      .timeout(this.cacheService.apiDataTimeout)
      .map((response: Response) => response.json()).toPromise();
  }

  // get a list of the background image file names and captions
  getLoginBackgroundImages(): Observable<any> {
    return this.http.get(`/api/auth/getLoginBackgroundImages`)
      .timeout(this.cacheService.apiDataTimeout)
      .map((response: Response) => response.json());
  }

  // get an image file
  getLoginBackgroundImage(fileName: string): Observable<any> {
    return this.http.get(`api/auth/getLoginImage/${fileName}`)
      .timeout(this.cacheService.apiDataTimeout)
      .map((response: Response) => response);
  }

  // decode the jwt token to get the user info, issued and expiration dates
  getInfoFromToken(token: string): Observable<any> {
    const headers = new Headers({'X-Token': token});
    const options = new RequestOptions({headers: headers});
    return this.http.get(`/api/auth/getInfoFromToken`, options)
      .timeout(this.cacheService.apiDataTimeout)
      .map((response: Response) => response.json());
  }

  // reset / get a new token with pushed out expiration date
  resetToken(token: string): Observable<any> {
    const headers = new Headers({'X-Token': token});
    const options = new RequestOptions({headers: headers});
    return this.http.post(`/api/auth/resetToken`, null, options)
      .timeout(this.cacheService.apiDataTimeout)
      .map((response: Response) => response.json());
  }

  // verify the token to ensure it hasn't been tampered with
  async verifyRoutePermissions(token: string, path: string) {
    const headers = new Headers({'X-Token': token, 'X-Path': path});
    const options = new RequestOptions({headers: headers});
    return await this.http.get(`/api/auth/verifyRoutePermissions`, options)
      .timeout(this.cacheService.apiDataTimeout)
      .map((response: Response) => response.json()).toPromise();
  }

  // TEMP CODE: for websockets testing
  getLoggedInUsers(token: string): Observable<any> {
    const headers = new Headers({'X-Token': token});
    const options = new RequestOptions({headers: headers});
    return this.http.get(`/api/auth/websockets/index/getLoggedInUsers`, options)
      .timeout(this.cacheService.apiDataTimeout)
      .map((response: Response) => response.json());
  }

  // TEMP CODE: for websockets testing
  logout(userName): Observable<any> {
    return this.http.get(`/api/auth/logout/${userName}`)
      .timeout(this.cacheService.apiDataTimeout)
      .map((response: Response) => response.json());
  }

}
