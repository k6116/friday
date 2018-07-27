import { Injectable } from '@angular/core';
import { Http, Headers, Response, RequestOptions, ResponseContentType } from '@angular/http';
import { Observable } from 'rxjs/observable';
import { CacheService } from '../cache.service';

@Injectable()
export class ApiDataAnalyticsService {

  // TO-DO PAUL: in all api-data services, remove timeout declaration, and declare the return type
  // to think about, can we just say 'getRoster' instead of 'getProjectRoster'
  timeout: number;

  constructor(
    private http: Http,
    private cacheService: CacheService
  ) { }

  getNCIProjectsParentChildList(): Observable<any> {
    return this.http.get(`api/getNCIProjectsParentChildList`)
    .timeout(this.cacheService.apiDataTimeout)
    .map((response: Response) => response.json());
  }

  getNCISupplyDemand(projectName: any): Observable<any> {
    return this.http.get(`api/getNCISupplyDemand/${projectName}`)
    .timeout(this.cacheService.apiDataTimeout)
    .map((response: Response) => response.json());
  }

  getNCISupplyDemandDatesList(): Observable<any> {
    return this.http.get(`api/getNCISupplyDemandDatesList`)
    .timeout(this.cacheService.apiDataTimeout)
    .map((response: Response) => response.json());
  }

  getNCISupplyDemandProjectList(): Observable<any> {
    return this.http.get(`api/getNCISupplyDemandProjectList`)
    .timeout(this.cacheService.apiDataTimeout)
    .map((response: Response) => response.json());
  }

}
