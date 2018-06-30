import { Injectable } from '@angular/core';
import { Http, Headers, Response, RequestOptions, ResponseContentType } from '@angular/http';
import { Observable } from 'rxjs/observable';
import { forkJoin } from 'rxjs/observable/forkJoin';
import 'rxjs/add/operator/timeout';
import 'rxjs/add/operator/map';
import { AnonymousSubscription } from 'rxjs/Subscription';


@Injectable()
export class ApiDataService {

  timeout: number;

  constructor(
    private http: Http
  ) {
    // set the timeout to 15 seconds
    this.timeout = 100 * 60 * 30;
  }

  // TO-DO ALL: move remaining to appropriate api data service file

  // get all users (index)
  getUserData() {
    const token = localStorage.getItem('jarvisToken') ? '?token=' + localStorage.getItem('jarvisToken') : '';
    // console.log('token query string is:');
    // console.log(token);
    return this.http.get(`/api/users${token}`)
      .timeout(this.timeout)
      .map((response: Response) => response.json());
  }


  // for click tracking
  logClick(clickData: any, userID: number) {
    const headers = new Headers({'Content-Type': 'application/json'});
    const options = new RequestOptions({headers: headers});
    return this.http.post(`/api/clickTracking/${userID}`, JSON.stringify(clickData), options)
      .timeout(this.timeout)
      .map((response: Response) => response.json());
  }

  getProjectList() {
    return this.http.get(`/api/projects/projectlist`)
      .timeout(this.timeout)
      .map((response: Response) => response.json());
  }


  // ORG API ROUTES
  getSubordinatesFlat(emailAddress: string) {
    return this.http.get(`/api/org/subordinatesFlat/${emailAddress}`)
      .timeout(this.timeout)
      .map((response: Response) => response.json());
  }


}
