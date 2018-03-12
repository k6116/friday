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


  // get a response indicating auth success or failure, with ldap object, user object, token on success
  authenticate(user: any) {

    const headers = new Headers({ 'Content-Type': 'application/json'});
    const options = new RequestOptions({ headers: headers });
    return this.http.post('/api/login', JSON.stringify(user), options)
      .map((response: Response) => response.json());

  }

  // get all users (index function)
  getUserData() {

    return this.http.get(`/api/users`)
      .timeout(this.timeout)
      .map((response: Response) => response.json());

  }



}
