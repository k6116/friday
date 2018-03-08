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

    this.timeout = 7000;

  }



  authenticate(user: any) {

    return this.http.get(`/api/login/${user}`)
      .timeout(this.timeout)
      .map((response: Response) => response.json());

  }


  getUserData() {

    return this.http.get(`/api/users`)
      .timeout(this.timeout)
      .map((response: Response) => response.json());

  }



}
