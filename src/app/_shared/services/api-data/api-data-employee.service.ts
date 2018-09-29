import { Injectable } from '@angular/core';
import { Http, Headers, Response, RequestOptions, ResponseContentType } from '@angular/http';
import { CacheService } from '../cache.service';
import 'rxjs/add/operator/map';


@Injectable()
export class ApiDataEmployeeService {

  timeout: number;

  constructor(
    private http: Http,
    private cacheService: CacheService
  ) { }

  getUserPLMData(userEmailAddress: string) {
    return this.http.get(`/api/showUserPLMData/${userEmailAddress}`)
      .timeout(this.cacheService.apiDataTimeout)
      .map((response: Response) => response.json());
  }

  getDesigners() {
    return this.http.get(`/api/getDesigners`)
      .timeout(this.cacheService.apiDataTimeout)
      .map((response: Response) => response.json());
  }

  getPlanners() {
    return this.http.get(`/api/getPlanners`)
      .timeout(this.cacheService.apiDataTimeout)
      .map((response: Response) => response.json());
  }

  getEmployeeData(emailAddress: string) {
    return this.http.get(`/api/getEmployeeData/${emailAddress}`)
      .timeout(this.cacheService.apiDataTimeout)
      .map((response: Response) => response.json());
  }
}
