import { Injectable } from '@angular/core';
import { Http, Headers, Response, RequestOptions, ResponseContentType } from '@angular/http';
import { Observable } from 'rxjs/observable';
import { forkJoin } from 'rxjs/observable/forkJoin';
import { CacheService } from '../cache.service';

@Injectable()
export class ApiDataDashboardService {

  constructor(
    private http: Http,
    private cacheService: CacheService
  ) { }


  getDashboardData(emailAddress: string, startDate: string, endDate: string, userName: string, employeeID: number): Observable<any> {

    const fteData = this.http.get(`/api/dashboard/getFTEData/${emailAddress}/${startDate}/${endDate}`)
      .timeout(this.cacheService.apiDataTimeout)
      .map((response: Response) => response.json());

    const firstLogin = this.http.get(`/api/dashboard/checkFirstLogin/${userName}`)
      .timeout(this.cacheService.apiDataTimeout)
      .map((response: Response) => response.json());

    const projectRequests = this.http.get(`/api/dashboard/checkProjectRequests/${employeeID}`)
      .timeout(this.cacheService.apiDataTimeout)
      .map((response: Response) => response.json());

    const jobTitle = this.http.get(`/api/dashboard/checkJobTitle/${employeeID}`)
      .timeout(this.cacheService.apiDataTimeout)
      .map((response: Response) => response.json());

    return forkJoin([fteData, firstLogin, projectRequests, jobTitle]);

  }



}
