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
    return this.http.get(`api/getProjectSchedule/${projectID}`)
    .timeout(this.cacheService.apiDataTimeout)
    .map((response: Response) => response.json());
  }

  updateProjectSchedule(schedule: any, revisionNotes: string, userID: number): Observable<any> {
    const headers = new Headers({'Content-Type': 'application/json'});
    const options = new RequestOptions({ headers: headers });

    return this.http.post(`api/updateProjectSchedule/${userID}/${revisionNotes}`, JSON.stringify(schedule), options)
    .timeout(this.cacheService.apiDataTimeout)
    .map((response: Response) => response.json());
  }

  getPartSchedule(partID: number): Observable<any> {
    return this.http.get(`api/getPartSchedule/${partID}`)
    .timeout(this.cacheService.apiDataTimeout)
    .map((response: Response) => response.json());
  }

  updatePartSchedule(schedule: any, revisionNotes: string, userID: number): Observable<any> {
    const headers = new Headers({'Content-Type': 'application/json'});
    const options = new RequestOptions({ headers: headers });

    return this.http.post(`api/updatePartSchedule/${userID}/${revisionNotes}`, JSON.stringify(schedule), options)
    .timeout(this.cacheService.apiDataTimeout)
    .map((response: Response) => response.json());
  }

  destroySchedule(scheduleID: number, userID: number): Observable<any> {
    return this.http.get(`api/destroySchedule/${scheduleID}/${userID}`)
    .timeout(this.cacheService.apiDataTimeout)
    .map((response: Response) => response.json());
  }

}
