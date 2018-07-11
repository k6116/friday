import { Injectable } from '@angular/core';
import { Http, Headers, Response, RequestOptions, ResponseContentType } from '@angular/http';
import { AppDataService } from '../app-data.service';


@Injectable()
export class ApiDataJobTitleService {

  timeout: number;

  constructor(
    private http: Http,
    private appDataService: AppDataService
  ) { }

  getJobTitleList() {
    return this.http.get(`/api/indexJobTitle/`)
    .timeout(this.appDataService.apiDataTimeout)
    .map((response: Response) => response.json());
  }

  getJobSubTitleList() {
    return this.http.get(`/api/indexJobSubTitle/`)
    .timeout(this.appDataService.apiDataTimeout)
    .map((response: Response) => response.json());
  }

  updateJobTitle(userID: number, jobTitles: any) {
    const headers = new Headers({'Content-Type': 'application/json'});
    const options = new RequestOptions({headers: headers});
    return this.http.post(`/api/updateJobTitle/${userID}`, JSON.stringify(jobTitles), options)
      .timeout(this.appDataService.apiDataTimeout)
      .map((response: Response) => response.json());
  }

  // Admin
  insertJobTitle(jobTitleData: any) {
    const headers = new Headers({'Content-Type': 'application/json'});
    const options = new RequestOptions({ headers: headers });
    return this.http.post(`/api/insertJobTitle`, JSON.stringify(jobTitleData), options)
      .timeout(this.appDataService.apiDataTimeout)
      .map((response: Response) => response.json());
  }

  insertJobSubTitle(jobSubTitleData: any) {
    const headers = new Headers({'Content-Type': 'application/json'});
    const options = new RequestOptions({ headers: headers });
    return this.http.post(`/api/insertJobSubTitle`, JSON.stringify(jobSubTitleData), options)
      .timeout(this.appDataService.apiDataTimeout)
      .map((response: Response) => response.json());
  }

  deleteJobTitle(jobTitleData: any) {
    const headers = new Headers({'Content-Type': 'application/json'});
    const options = new RequestOptions({ headers: headers });
    return this.http.post(`/api/deleteJobTitle`, JSON.stringify(jobTitleData), options)
      .timeout(this.appDataService.apiDataTimeout)
      .map((response: Response) => response.json());
  }

  deleteJobSubTitle(jobSubTitleData: any) {
    const headers = new Headers({'Content-Type': 'application/json'});
    const options = new RequestOptions({ headers: headers });
    return this.http.post(`/api/deleteJobSubTitle`, JSON.stringify(jobSubTitleData), options)
      .timeout(this.appDataService.apiDataTimeout)
      .map((response: Response) => response.json());
  }

  insertJobTitleMap(mapData: any) {
    const headers = new Headers({'Content-Type': 'application/json'});
    const options = new RequestOptions({ headers: headers });
    return this.http.post(`/api/insertJobTitleMap`, JSON.stringify(mapData), options)
      .timeout(this.appDataService.apiDataTimeout)
      .map((response: Response) => response.json());
  }

  deletejobTitleMap(mapData: any) {
    const headers = new Headers({'Content-Type': 'application/json'});
    const options = new RequestOptions({ headers: headers });
    return this.http.post(`/api/deletejobTitleMap`, JSON.stringify(mapData), options)
      .timeout(this.appDataService.apiDataTimeout)
      .map((response: Response) => response.json());
  }


}
