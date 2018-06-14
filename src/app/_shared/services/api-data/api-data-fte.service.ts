import { Injectable } from '@angular/core';
import { Http, Headers, Response, RequestOptions, ResponseContentType } from '@angular/http';
import { AppDataService } from '../app-data.service';

@Injectable()
export class ApiDataFteService {

  constructor(
    private http: Http,
    private appDataService: AppDataService
  ) { }

  // get FTE data from db
  getFteData(userID: number) {
    return this.http.get(`/api/ftedata/${userID}`)
      .timeout(this.appDataService.apiDataTimeout)
      .map((response: Response) => response.json());
  }

  // update existing FTE records
  updateFteData(fteData: any, userID: number) {
    const headers = new Headers({'Content-Type': 'application/json'});
    const options = new RequestOptions({headers: headers});
    return this.http.post(`/api/ftedata/${userID}`, JSON.stringify(fteData), options)
      .timeout(this.appDataService.apiDataTimeout)
      .map((response: Response) => response.json());
  }

  // delete an entire project from a user's FTE table
  deleteFteProject(projectID: any, userID: number) {
    const headers = new Headers({'Content-Type': 'application/json'});
    const options = new RequestOptions({headers: headers});
    return this.http.post(`/api/ftedata/deleteProject/${userID}`, JSON.stringify(projectID), options)
    .timeout(this.appDataService.apiDataTimeout)
    .map((response: Response) => response.json());
  }
}
