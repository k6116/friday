import { Injectable } from '@angular/core';
import { Http, Headers, Response, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/observable';
import { CacheService } from '../cache.service';
import 'rxjs/add/operator/timeout';
import 'rxjs/add/operator/map';

@Injectable()
export class ApiDataOrgService {

  constructor(
    private http: Http,
    private cacheService: CacheService
  ) {}

  getOrgData(emailAddress: string): Observable<any> {
    return this.http.get(`/api/org/${emailAddress}`)
      .timeout(this.cacheService.apiDataTimeout)
      .map((response: Response) => response.json());
  }

  getTeamList(emailAddress: string): Observable<any> {
    return this.http.get(`/api/org/getTeamList/${emailAddress}`)
      .timeout(this.cacheService.apiDataTimeout)
      .map((response: Response) => response.json());
  }

  getEmployeeList(emailAddress: string): Observable<any> {
    return this.http.get(`/api/org/getEmployeeList/${emailAddress}`)
      .timeout(this.cacheService.apiDataTimeout)
      .map((response: Response) => response.json());
  }

  getOrgFtes(emailAddress: string, startDate: string, endDate: string): Observable<any> {
    const headers = new Headers({'Content-Type': 'application/json', 'X-Token': this.cacheService.token.signedToken});
    const options = new RequestOptions({headers: headers});
    return this.http.get(`/api/org/reports-jarvisAdoption/show/getOrgFtes/${emailAddress}/${startDate}/${endDate}`, options)
      .timeout(this.cacheService.apiDataTimeout)
      .map((response: Response) => response.json());
  }

  getTeamFteList(emailAddress: string, startDate: string, endDate: string): Observable<any> {
    const headers = new Headers({'Content-Type': 'application/json', 'X-Token': this.cacheService.token.signedToken});
    const options = new RequestOptions({headers: headers});
    return this.http.get(`/api/org/reports-jarvisAdoption/show/getTeamFteList/${emailAddress}/${startDate}/${endDate}`, options)
      .timeout(this.cacheService.apiDataTimeout)
      .map((response: Response) => response.json());
  }

  getManagementOrgStructure(emailAddress: string): Observable<any> {
    const headers = new Headers({'Content-Type': 'application/json', 'X-Token': this.cacheService.token.signedToken});
    const options = new RequestOptions({headers: headers});
    return this.http.get(`/api/org/getManagementOrgStructure/${emailAddress}`, options)
      .timeout(this.cacheService.apiDataTimeout)
      .map((response: Response) => response.json());
  }

}
