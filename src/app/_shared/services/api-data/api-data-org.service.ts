import { Injectable } from '@angular/core';
import { Http, Headers, Response } from '@angular/http';
import { Observable } from 'rxjs/observable';
import { CacheService } from '../cache.service';
import 'rxjs/add/operator/timeout';
import 'rxjs/add/operator/map';

@Injectable()
export class ApiDataOrgService {

  timeout: number;

  constructor(
    private http: Http
  ) {
    // set the timeout to 15 seconds
    this.timeout = 15000;
  }

  getOrgData(emailAddress: string): Observable<any> {
    return this.http.get(`/api/org/${emailAddress}`)
      .timeout(this.timeout)
      .map((response: Response) => response.json());
  }

  getTeamList(emailAddress: string): Observable<any> {
    return this.http.get(`/api/org/getTeamList/${emailAddress}`)
      .timeout(this.timeout)
      .map((response: Response) => response.json());
  }

  getEmployeeList(emailAddress: string): Observable<any> {
    return this.http.get(`/api/org/getEmployeeList/${emailAddress}`)
      .timeout(this.timeout)
      .map((response: Response) => response.json());
  }


}
