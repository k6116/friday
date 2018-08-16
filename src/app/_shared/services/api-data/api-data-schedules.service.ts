import { Injectable } from '@angular/core';
import { Http, Headers, Response, RequestOptions, ResponseContentType } from '@angular/http';
import { Observable } from 'rxjs/observable';
import { CacheService } from '../cache.service';

@Injectable()
export class ApiDataSchedulesService {

  constructor(
    private http: Http,
    private cacheService: CacheService
  ) { }

  getProjectSchedule(projectID: number): Observable<any> {
    const headers = new Headers({'Content-Type': 'application/json', 'X-Token': this.cacheService.token.signedToken});
    const options = new RequestOptions({ headers: headers });

    return this.http.get(`api/getProjectSchedule/${projectID}`, options)
    .timeout(this.cacheService.apiDataTimeout)
    .map((response: Response) => response.json());
  }

  updateProjectSchedule(schedule: any, revisionNotes: string, userID: number): Observable<any> {
    const headers = new Headers({'Content-Type': 'application/json', 'X-Token': this.cacheService.token.signedToken});
    const options = new RequestOptions({ headers: headers });
  // TO-DO Fix Decode Token Issue in Controller to hide userID
    return this.http.post(`api/updateProjectSchedule/${userID}/${revisionNotes}`, JSON.stringify(schedule), options)
    .timeout(this.cacheService.apiDataTimeout)
    .map((response: Response) => response.json());
  }

  getPartSchedule(partID: number): Observable<any> {
    const headers = new Headers({'Content-Type': 'application/json', 'X-Token': this.cacheService.token.signedToken});
    const options = new RequestOptions({ headers: headers });

    return this.http.get(`api/getPartSchedule/${partID}`, options)
    .timeout(this.cacheService.apiDataTimeout)
    .map((response: Response) => response.json());
  }

  updatePartSchedule(schedule: any, revisionNotes: string, userID: number): Observable<any> {
    const headers = new Headers({'Content-Type': 'application/json', 'X-Token': this.cacheService.token.signedToken});
    const options = new RequestOptions({ headers: headers });
   // MG: Putting userID back in as a parameter until decode token works. Put breakpoint in controller to see error.
    return this.http.post(`api/updatePartSchedule/${userID}/${revisionNotes}`, JSON.stringify(schedule), options)
    .timeout(this.cacheService.apiDataTimeout)
    .map((response: Response) => response.json());
  }

  destroySchedule(scheduleID: number): Observable<any> {
    const headers = new Headers({'Content-Type': 'application/json', 'X-Token': this.cacheService.token.signedToken});
    const options = new RequestOptions({ headers: headers });

    return this.http.get(`api/destroySchedule/${scheduleID}`, options)
    .timeout(this.cacheService.apiDataTimeout)
    .map((response: Response) => response.json());
  }

}
