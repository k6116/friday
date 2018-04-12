import { Injectable } from '@angular/core';
import { Http, Headers, Response, RequestOptions, ResponseContentType } from '@angular/http';
import { Observable } from 'rxjs/observable';
import { forkJoin } from 'rxjs/observable/forkJoin';
import 'rxjs/add/operator/timeout';
import 'rxjs/add/operator/map';


@Injectable()
export class ApiDataService {

  timeout: number;

  constructor(
    private http: Http
  ) {
    // set the timeout to 15 seconds
    this.timeout = 15000;
  }


  // attempt to authenticate the user credentials using windows login and ldap
  authenticate(user: any) {
    const headers = new Headers({'Content-Type': 'application/json'});
    const options = new RequestOptions({headers: headers});
    return this.http.post('/api/login', JSON.stringify(user), options)
      .timeout(this.timeout)
      .map((response: Response) => response.json());
  }

  // decode the jwt token to get the user info, issued and expiration dates
  getInfoFromToken(token) {
    const queryString = '?token=' + token;
    return this.http.get(`/api/getInfoFromToken${queryString}`)
      .timeout(this.timeout)
      .map((response: Response) => response.json());
  }

  // reset / get a new token with pushed out expiration date
  resetToken(user: any) {
    const headers = new Headers({'Content-Type': 'application/json'});
    const options = new RequestOptions({headers: headers});
    return this.http.post(`/api/resetToken`, JSON.stringify(user), options)
      .timeout(this.timeout)
      .map((response: Response) => response.json());
  }

  // get all users (index)
  getUserData() {
    const token = localStorage.getItem('jarvisToken') ? '?token=' + localStorage.getItem('jarvisToken') : '';
    // console.log('token query string is:');
    // console.log(token);
    return this.http.get(`/api/users${token}`)
      .timeout(this.timeout)
      .map((response: Response) => response.json());
  }

  // get FTE data
  getFteData(userID: number) {
    return this.http.get(`/api/ftedata/${userID}`)
      .timeout(this.timeout)
      .map((response: Response) => response.json());
  }

  getOrgData(managerEmailAddress: string) {
    const employeeListData = this.getEmployeeList(managerEmailAddress);

    return forkJoin([
      employeeListData
    ]);

  }

  getEmployeeList(managerEmailAddress) {
    return this.http.get(`/api/employeeList/${managerEmailAddress}`)
      .map((response: Response) => response.json());
  }

}
