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

  updateProjectSchedule(schedule: any, revisionNotes: string): Observable<any> {
    const headers = new Headers({'Content-Type': 'application/json', 'X-Token': this.cacheService.token.signedToken});
    const options = new RequestOptions({ headers: headers });

    if (!revisionNotes) { revisionNotes = ' '; }
    return this.http.post(`api/updateProjectSchedule/${revisionNotes}`, JSON.stringify(schedule), options)
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

  updatePartSchedule(schedule: any, revisionNotes: string): Observable<any> {
    const headers = new Headers({'Content-Type': 'application/json', 'X-Token': this.cacheService.token.signedToken});
    const options = new RequestOptions({ headers: headers });
    if (!revisionNotes) { revisionNotes = ' '; }

    return this.http.post(`api/updatePartSchedule/${revisionNotes}`, JSON.stringify(schedule), options)
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
