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
    const headers = new Headers({'X-Token': this.cacheService.token.signedToken});
    const options = new RequestOptions({headers: headers});
    return this.http.get(`/api/jobTitle/admin/index/indexJobTitle`, options)
      .timeout(this.cacheService.apiDataTimeout)
      .map((response: Response) => response.json());
  }

  getJobSubTitleList() {
    const headers = new Headers({'X-Token': this.cacheService.token.signedToken});
    const options = new RequestOptions({headers: headers});
    return this.http.get(`/api/jobTitle/admin/index/indexJobSubTitle`, options)
      .timeout(this.cacheService.apiDataTimeout)
      .map((response: Response) => response.json());
  }

  updateEmployeeJobTitle(jobTitles: any) {
    const headers = new Headers({'Content-Type': 'application/json', 'X-Token': this.cacheService.token.signedToken});
    const options = new RequestOptions({headers: headers});
    return this.http.put(`/api/jobTitle/admin/update/updateEmployeeJobTitle`, JSON.stringify(jobTitles), options)
      .timeout(this.cacheService.apiDataTimeout)
      .map((response: Response) => response.json());
  }

  // Admin
  insertJobTitle(jobTitleData: any) {
    const headers = new Headers({'Content-Type': 'application/json', 'X-Token': this.cacheService.token.signedToken});
    const options = new RequestOptions({ headers: headers });
    return this.http.post(`/api/jobTitle/admin/insert/insertJobTitle`, JSON.stringify(jobTitleData), options)
      .timeout(this.cacheService.apiDataTimeout)
      .map((response: Response) => response.json());
  }

  insertJobSubTitle(jobSubTitleData: any) {
    const headers = new Headers({'Content-Type': 'application/json', 'X-Token': this.cacheService.token.signedToken});
    const options = new RequestOptions({ headers: headers });
    return this.http.post(`/api/jobTitle/admin/insert/insertJobSubTitle`, JSON.stringify(jobSubTitleData), options)
      .timeout(this.cacheService.apiDataTimeout)
      .map((response: Response) => response.json());
  }

  deleteJobTitle(jobTitleData: any) {
    const headers = new Headers({'Content-Type': 'application/json', 'X-Token': this.cacheService.token.signedToken});
    const options = new RequestOptions({ headers: headers });
    return this.http.post(`/api/jobTitle/admin/destroy/deleteJobTitle`, JSON.stringify(jobTitleData), options)
      .timeout(this.cacheService.apiDataTimeout)
      .map((response: Response) => response.json());
  }

  deleteJobSubTitle(jobSubTitleData: any) {
    const headers = new Headers({'Content-Type': 'application/json', 'X-Token': this.cacheService.token.signedToken});
    const options = new RequestOptions({ headers: headers });
    return this.http.post(`/api/jobTitle/admin/destroy/deleteJobSubTitle`, JSON.stringify(jobSubTitleData), options)
      .timeout(this.cacheService.apiDataTimeout)
      .map((response: Response) => response.json());
  }

  updateJobTitle(jobTitleData: any) {
    const headers = new Headers({'Content-Type': 'application/json', 'X-Token': this.cacheService.token.signedToken});
    const options = new RequestOptions({ headers: headers });
    return this.http.put(`/api/jobTitle/admin/update/updateJobTitle`, JSON.stringify(jobTitleData), options)
      .timeout(this.cacheService.apiDataTimeout)
      .map((response: Response) => response.json());
  }

  updateJobSubTitle(jobSubTitleData: any) {
    const headers = new Headers({'Content-Type': 'application/json', 'X-Token': this.cacheService.token.signedToken});
    const options = new RequestOptions({ headers: headers });
    return this.http.put(`/api/jobTitle/admin/update/updateJobSubTitle`, JSON.stringify(jobSubTitleData), options)
      .timeout(this.cacheService.apiDataTimeout)
      .map((response: Response) => response.json());
  }

  insertJobTitleMap(mapData: any) {
    const headers = new Headers({'Content-Type': 'application/json', 'X-Token': this.cacheService.token.signedToken});
    const options = new RequestOptions({ headers: headers });
    return this.http.post(`/api/jobTitle/admin/insert/insertJobTitleMap`, JSON.stringify(mapData), options)
      .timeout(this.cacheService.apiDataTimeout)
      .map((response: Response) => response.json());
  }

  deletejobTitleMap(mapData: any) {
    const headers = new Headers({'Content-Type': 'application/json', 'X-Token': this.cacheService.token.signedToken});
    const options = new RequestOptions({ headers: headers });
    return this.http.post(`/api/jobTitle/admin/destroy/deletejobTitleMap`, JSON.stringify(mapData), options)
      .timeout(this.cacheService.apiDataTimeout)
      .map((response: Response) => response.json());
  }

  // get employees and their jobtitles data from db
  indexEmployeesJobTitles(emailAddress: string) {
    return this.http.get(`/api/indexEmployeesJobTitles/${emailAddress}`)
      .timeout(this.cacheService.apiDataTimeout)
      .map((response: Response) => response.json());
  }

  // update existing Team FTE records
  updateEmployeesJobTitlesBulk(jobTitleData: any, userID: number) {
    const headers = new Headers({'Content-Type': 'application/json'});
    const options = new RequestOptions({headers: headers});
    return this.http.post(`/api/updateEmployeesJobTitlesBulk/${userID}/`, JSON.stringify(jobTitleData), options)
      .timeout(this.cacheService.apiDataTimeout)
      .map((response: Response) => response.json());
  }


}
