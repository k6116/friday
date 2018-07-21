import { Injectable } from '@angular/core';
import { Http, Headers, Response, RequestOptions, ResponseContentType } from '@angular/http';
import { CacheService } from '../cache.service';
import 'rxjs/add/operator/map';


@Injectable()
export class ApiDataJobTitleService {

  timeout: number;

  constructor(
    private http: Http,
    private cacheService: CacheService
  ) { }

  getJobTitleList() {
    return this.http.get(`/api/indexJobTitle/`)
    .timeout(this.cacheService.apiDataTimeout)
    .map((response: Response) => response.json());
  }

  getJobSubTitleList() {
    return this.http.get(`/api/indexJobSubTitle/`)
    .timeout(this.cacheService.apiDataTimeout)
    .map((response: Response) => response.json());
  }

  updateEmployeeJobTitle(userID: number, jobTitles: any) {
    const headers = new Headers({'Content-Type': 'application/json'});
    const options = new RequestOptions({headers: headers});
    return this.http.post(`/api/updateEmployeeJobTitle/${userID}`, JSON.stringify(jobTitles), options)
      .timeout(this.cacheService.apiDataTimeout)
      .map((response: Response) => response.json());
  }

  // Admin
  insertJobTitle(jobTitleData: any) {
    const headers = new Headers({'Content-Type': 'application/json'});
    const options = new RequestOptions({ headers: headers });
    return this.http.post(`/api/insertJobTitle`, JSON.stringify(jobTitleData), options)
      .timeout(this.cacheService.apiDataTimeout)
      .map((response: Response) => response.json());
  }

  insertJobSubTitle(jobSubTitleData: any) {
    const headers = new Headers({'Content-Type': 'application/json'});
    const options = new RequestOptions({ headers: headers });
    return this.http.post(`/api/insertJobSubTitle`, JSON.stringify(jobSubTitleData), options)
      .timeout(this.cacheService.apiDataTimeout)
      .map((response: Response) => response.json());
  }

  deleteJobTitle(jobTitleData: any) {
    const headers = new Headers({'Content-Type': 'application/json'});
    const options = new RequestOptions({ headers: headers });
    return this.http.post(`/api/deleteJobTitle`, JSON.stringify(jobTitleData), options)
      .timeout(this.cacheService.apiDataTimeout)
      .map((response: Response) => response.json());
  }

  deleteJobSubTitle(jobSubTitleData: any) {
    const headers = new Headers({'Content-Type': 'application/json'});
    const options = new RequestOptions({ headers: headers });
    return this.http.post(`/api/deleteJobSubTitle`, JSON.stringify(jobSubTitleData), options)
      .timeout(this.cacheService.apiDataTimeout)
      .map((response: Response) => response.json());
  }

  updateJobTitle(jobTitleData: any) {
    const headers = new Headers({'Content-Type': 'application/json'});
    const options = new RequestOptions({ headers: headers });
    return this.http.post(`/api/updateJobTitle`, JSON.stringify(jobTitleData), options)
      .timeout(this.cacheService.apiDataTimeout)
      .map((response: Response) => response.json());
  }

  updateJobSubTitle(jobSubTitleData: any) {
    const headers = new Headers({'Content-Type': 'application/json'});
    const options = new RequestOptions({ headers: headers });
    return this.http.post(`/api/updateJobSubTitle`, JSON.stringify(jobSubTitleData), options)
      .timeout(this.cacheService.apiDataTimeout)
      .map((response: Response) => response.json());
  }

  insertJobTitleMap(mapData: any) {
    const headers = new Headers({'Content-Type': 'application/json'});
    const options = new RequestOptions({ headers: headers });
    return this.http.post(`/api/insertJobTitleMap`, JSON.stringify(mapData), options)
      .timeout(this.cacheService.apiDataTimeout)
      .map((response: Response) => response.json());
  }

  deletejobTitleMap(mapData: any) {
    const headers = new Headers({'Content-Type': 'application/json'});
    const options = new RequestOptions({ headers: headers });
    return this.http.post(`/api/deletejobTitleMap`, JSON.stringify(mapData), options)
      .timeout(this.cacheService.apiDataTimeout)
      .map((response: Response) => response.json());
  }


}
