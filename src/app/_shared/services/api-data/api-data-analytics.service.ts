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

  getNCISupplyDemandPartList(projectName: any): Observable<any> {
    return this.http.get(`api/getNCISupplyDemandPartList/${projectName}`)
    .timeout(this.cacheService.apiDataTimeout)
    .map((response: Response) => response.json());
  }

  getNCISupplyLotList(partName: any): Observable<any> {
    return this.http.get(`api/getNCISupplyLotList/${partName}`)
    .timeout(this.cacheService.apiDataTimeout)
    .map((response: Response) => response.json());
  }

  getNCISupplyLotExclusionList(partName: any): Observable<any> {
    return this.http.get(`api/getNCISupplyLotExclusionList/${partName}`)
    .timeout(this.cacheService.apiDataTimeout)
    .map((response: Response) => response.json());
  }

  execUpdateSupplyDemand(): Observable<any> {
    return this.http.get(`api/execUpdateSupplyDemand/`)
    .timeout(this.cacheService.apiDataTimeout)
    .map((response: Response) => response.json());
  }

  insertLotExclusion(partData: any, userID: number): Observable<any>  {
    const headers = new Headers({'Content-Type': 'application/json'});
    const options = new RequestOptions({ headers: headers });
    return this.http.post(`api/insertLotExclusion/${userID}`, JSON.stringify(partData), options)
      .timeout(this.cacheService.apiDataTimeout)
      .map((response: Response) => response.json());
  }

  deleteLotExclusion(partData: any, userID: number): Observable<any>  {
    const headers = new Headers({'Content-Type': 'application/json'});
    const options = new RequestOptions({ headers: headers });
    return this.http.post(`api/destroyLotExclusion/${userID}`, JSON.stringify(partData), options)
      .timeout(this.cacheService.apiDataTimeout)
      .map((response: Response) => response.json());
  }


}
