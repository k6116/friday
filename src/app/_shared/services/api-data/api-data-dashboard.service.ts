import { Injectable } from '@angular/core';
import { Http, Headers, Response, RequestOptions, ResponseContentType } from '@angular/http';
import { Observable } from 'rxjs/observable';
import { forkJoin } from 'rxjs/observable/forkJoin';
import { CacheService } from '../cache.service';
import { AuthService } from '../auth.service';
import 'rxjs/add/operator/map';

@Injectable()
export class ApiDataDashboardService {

  constructor(
    private http: Http,
    private cacheService: CacheService,
    private authService: AuthService
  ) { }


  // get all dashboard data at at once in parallel with forkjoin, for the current user (will pull the user's email from the token)
  getDashboardData(startDate: string, endDate: string): Observable<any> {

    const headers = new Headers({'X-Token': this.cacheService.token.signedToken});
    const options = new RequestOptions({headers: headers});

    const fteData = this.http.get(`/api/dashboard/dashboard/show/getFTEData/${startDate}/${endDate}`, options)
      .timeout(this.cacheService.apiDataTimeout)
      .map((response: Response) => response.json());

    const firstLogin = this.http.get(`/api/dashboard/checkFirstLogin`, options)
      .timeout(this.cacheService.apiDataTimeout)
      .map((response: Response) => response.json());

    const projectRequests = this.http.get(`/api/dashboard/checkProjectRequests`, options)
      .timeout(this.cacheService.apiDataTimeout)
      .map((response: Response) => response.json());

    const jobTitle = this.http.get(`/api/dashboard/checkJobTitle`, options)
      .timeout(this.cacheService.apiDataTimeout)
      .map((response: Response) => response.json());

    return forkJoin([fteData, firstLogin, projectRequests, jobTitle]);

  }

  // get FTE data only, for a specific user (if a different team/manager is selected)
  getFTEData(startDate: string, endDate: string, emailAddress: string): Observable<any> {

    const headers = new Headers({'X-Token': this.cacheService.token.signedToken});
    const options = new RequestOptions({headers: headers});

    return this.http.get(`/api/dashboard/dashboard/show/getFTEData/${startDate}/${endDate}/${emailAddress}`, options)
      .timeout(this.cacheService.apiDataTimeout)
      .map((response: Response) => response.json());

  }



}
