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


  getDashboardData(startDate: string, endDate: string): Observable<any> {

    // NOTE: email is passed here instead of id as the key since it gets data from the plm databridge as well as jarvis
    const headers = new Headers({'X-JWT': this.authService.token.signedToken});
    const options = new RequestOptions({headers: headers});

    // console.log('get dashboard data token:');
    // console.log(this.authService.token.signedToken);

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



}
