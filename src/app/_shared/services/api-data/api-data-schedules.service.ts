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

  updateProjectScheduleXML(schedule: any, revisionNotes: string): Observable<any> {
    const headers = new Headers({'Content-Type': 'application/json', 'X-Token': this.cacheService.token.signedToken});
    const options = new RequestOptions({ headers: headers });

    return this.http.post(`api/updateProjectScheduleXML/${revisionNotes}`, JSON.stringify(schedule), options)
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

  updatePartScheduleXML(schedule: any, revisionNotes: string): Observable<any> {
    const headers = new Headers({'Content-Type': 'application/json', 'X-Token': this.cacheService.token.signedToken});
    const options = new RequestOptions({ headers: headers });

    return this.http.post(`api/updatePartScheduleXML/${revisionNotes}`, JSON.stringify(schedule), options)
    .timeout(this.cacheService.apiDataTimeout)
    .map((response: Response) => response.json());
  }

  destroyScheduleSP(scheduleID: number): Observable<any> {
    const headers = new Headers({'Content-Type': 'application/json', 'X-Token': this.cacheService.token.signedToken});
    const options = new RequestOptions({ headers: headers });

    return this.http.get(`api/destroyScheduleSP/${scheduleID}`, options)
    .timeout(this.cacheService.apiDataTimeout)
    .map((response: Response) => response.json());
  }

  insertSchedule(scheduleData: any, userID: number) {
    const headers = new Headers({'Content-Type': 'application/json'});
    const options = new RequestOptions({ headers: headers });
    return this.http.post(`/api/insertSchedule/${userID}`, JSON.stringify(scheduleData), options)
      .timeout(this.cacheService.apiDataTimeout)
      .map((response: Response) => response.json());
  }

  updateSchedule(scheduleData: any, userID: number) {
    const headers = new Headers({'Content-Type': 'application/json'});
    const options = new RequestOptions({ headers: headers });
    return this.http.post(`/api/updateSchedule/${userID}`, JSON.stringify(scheduleData), options)
      .timeout(this.cacheService.apiDataTimeout)
      .map((response: Response) => response.json());
  }

  destroySchedule(scheduleData: any, userID: number) {
    const headers = new Headers({'Content-Type': 'application/json'});
    const options = new RequestOptions({ headers: headers });
    return this.http.post(`/api/destroySchedule/${userID}`, JSON.stringify(scheduleData), options)
      .timeout(this.cacheService.apiDataTimeout)
      .map((response: Response) => response.json());
  }

  insertScheduleDetailBulk(scheduleData: any, userID: number) {
    const headers = new Headers({'Content-Type': 'application/json'});
    const options = new RequestOptions({ headers: headers });
    return this.http.post(`/api/insertScheduleDetailBulk/${userID}`, JSON.stringify(scheduleData), options)
      .timeout(this.cacheService.apiDataTimeout)
      .map((response: Response) => response.json());
  }

  updateScheduleDetailBulk(scheduleData: any, userID: number, scheduleID: number) {
    const headers = new Headers({'Content-Type': 'application/json'});
    const options = new RequestOptions({ headers: headers });
    return this.http.post(`/api/updateScheduleDetailBulk/${userID}/${scheduleID}`, JSON.stringify(scheduleData), options)
      .timeout(this.cacheService.apiDataTimeout)
      .map((response: Response) => response.json());
  }

}
