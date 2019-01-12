import { Injectable } from '@angular/core';
import { Http, Headers, Response, RequestOptions, ResponseContentType } from '@angular/http';
import { Observable } from 'rxjs/Observable';
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

  getProjectChildren(projectID: string): Observable<any> {
    return this.http.get(`api/indexProjectChildren/${projectID}`)
    .timeout(this.cacheService.apiDataTimeout)
    .map((response: Response) => response.json());
  }

  getProjectParents(projectID: string): Observable<any> {
    return this.http.get(`api/indexProjectParents/${projectID}`)
    .timeout(this.cacheService.apiDataTimeout)
    .map((response: Response) => response.json());
  }

  getProjectJobTitleAdvancedFilter(projectIDs: string, fromDate: string, toDate: string): Observable<any> {
    return this.http.get(`api/indexProjectJobTitleAdvancedFilter/${projectIDs}/${fromDate}/${toDate}`)
    .timeout(this.cacheService.apiDataTimeout)
    .map((response: Response) => response.json());
  }

  showSingleBom(parentID: number, parentEntity: string) {
    const headers = new Headers({'Content-Type': 'application/json', 'X-Token': this.cacheService.token.signedToken});
    const options = new RequestOptions({headers: headers});
    return this.http.get(`/api/bom/bom/show/showSingleBom/${parentID}/${parentEntity}`, options)
      .timeout(this.cacheService.apiDataTimeout)
      .map((response: Response) => response.json());
  }

}
