import { Injectable } from '@angular/core';
import { Http, Headers, Response, RequestOptions, ResponseContentType } from '@angular/http';
import { AppDataService } from '../app-data.service';


@Injectable()
export class ApiDataEmployeeService {

  timeout: number;

  constructor(
    private http: Http,
    private appDataService: AppDataService
  ) { }

  getUserPLMData(userEmailAddress: string) {
    return this.http.get(`/api/getUserPLMData/${userEmailAddress}`)
      .timeout(this.timeout)
      .map((response: Response) => response.json());
  }

}
