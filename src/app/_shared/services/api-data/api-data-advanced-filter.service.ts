import { Injectable } from '@angular/core';
import { Http, Headers, Response, RequestOptions, ResponseContentType } from '@angular/http';
import { Observable } from 'rxjs/observable';
import { CacheService } from '../cache.service';
import { forkJoin } from 'rxjs/observable/forkJoin';



@Injectable()
export class ApiDataAdvancedFilterService {

  constructor(
    private http: Http,
    private cacheService: CacheService
  ) { }

  // CHAI: Do I need this?
  getProjects(): Observable<any> {
    return this.http.get('api/indexProjectsAdvancedFilter')
    .timeout(this.cacheService.apiDataTimeout)
    .map((response: Response) => response.json());
  }

  getAdvancedFilterData(): Observable<any> {

    const headers = new Headers({'X-Token': this.cacheService.token.signedToken});
    const options = new RequestOptions({headers: headers});

    const projects = this.http.get('api/indexProjectsAdvancedFilter', options)
      .timeout(this.cacheService.apiDataTimeout)
      .map((response: Response) => response.json());

    const projectTypes = this.http.get(`/api/indexProjectTypesList`, options)
      .timeout(this.cacheService.apiDataTimeout)
      .map((response: Response) => response.json());

    const projectStatuses = this.http.get(`/api/indexProjectStatusesList`, options)
      .timeout(this.cacheService.apiDataTimeout)
      .map((response: Response) => response.json());

    const projectPriorities = this.http.get(`/api/indexProjectPrioritiesList`, options)
      .timeout(this.cacheService.apiDataTimeout)
      .map((response: Response) => response.json());

    const plcStatuses = this.http.get(`/api/indexPLCStatus`, options)
    .timeout(this.cacheService.apiDataTimeout)
    .map((response: Response) => response.json());

    return forkJoin([projects, projectTypes, projectStatuses, projectPriorities, plcStatuses]);

  }

  getAdvancedFilteredResults(filterOptions: any) {
    const headers = new Headers({'Content-Type': 'application/json'});
    const options = new RequestOptions({headers: headers});
    return this.http.post(`/api/indexAdvancedFilteredResults`, JSON.stringify(filterOptions), options)
      .timeout(this.cacheService.apiDataTimeout)
      .map((response: Response) => response.json());
  }

}
