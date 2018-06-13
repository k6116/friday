import { Injectable } from '@angular/core';
import { Http, Headers, Response } from '@angular/http';
import { Observable } from 'rxjs/observable';
import 'rxjs/add/operator/timeout';

@Injectable()
export class ApiDataOrgService {

  timeout: number;

  constructor(
    private http: Http
  ) {
    // set the timeout to 15 seconds
    this.timeout = 15000;
  }

  getOrgData(emailAddress: string) {
    return this.http.get(`/api/org/${emailAddress}`)
      .timeout(this.timeout)
      .map((response: Response) => response.json());
  }

}
