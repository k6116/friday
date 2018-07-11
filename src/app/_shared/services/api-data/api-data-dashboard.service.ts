import { Injectable } from '@angular/core';
import { Http, Headers, Response, RequestOptions, ResponseContentType } from '@angular/http';
import { Observable } from 'rxjs/observable';
import { forkJoin } from 'rxjs/observable/forkJoin';
import { AppDataService } from '../app-data.service';

@Injectable()
export class ApiDataDashboardService {

  constructor(
    private http: Http,
    private appDataService: AppDataService
  ) { }


  getDashboardData(emailAddress: string, startDate: string, endDate: string, userName: string, employeeID: number): Observable<any> {

    const fteData = this.http.get(`/api/dashboard/getFTEData/${emailAddress}/${startDate}/${endDate}`)
      .timeout(this.appDataService.apiDataTimeout)
      .map((response: Response) => response.json());

    const firstLogin = this.http.get(`/api/dashboard/checkFirstLogin/${userName}`)
      .timeout(this.appDataService.apiDataTimeout)
      .map((response: Response) => response.json());

    const projectRequests = this.http.get(`/api/dashboard/checkProjectRequests/${employeeID}`)
      .timeout(this.appDataService.apiDataTimeout)
      .map((response: Response) => response.json());

    return forkJoin([fteData, firstLogin, projectRequests]);

  }

}
