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

  getNCIProjectsWithDemandList(): Observable<any> {
    return this.http.get('api/getNCIProjectsWithDemandList')
    .timeout(this.cacheService.apiDataTimeout)
    .map((response: Response) => response.json());
  }


  createProject(project: any, userID: number) {
    const headers = new Headers({'Content-Type': 'application/json'});
    const options = new RequestOptions({ headers: headers });
    return this.http.post(`/api/insertProject/${userID}`, JSON.stringify(project), options)
      .timeout(this.cacheService.apiDataTimeout)
      .map((response: Response) => response.json());
  }

}
