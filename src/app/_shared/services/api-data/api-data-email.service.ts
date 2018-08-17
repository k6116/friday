import { Injectable } from '@angular/core';
import { Http, Headers, Response, RequestOptions, ResponseContentType } from '@angular/http';
import { CacheService } from '../cache.service';
import 'rxjs/add/operator/map';

@Injectable()
export class ApiDataEmailService {

  timeout: number;

  constructor(
    private http: Http,
    private cacheService: CacheService
  ) { }

  sendRequestProjectEmail(userID: number, ownerID: number, projectName: string, requestStatus: string) {
    return this.http.post(`/api/sendRequestProjectEmail/${userID}/${ownerID}/${projectName}/${requestStatus}`, null)
    .timeout(this.cacheService.apiDataTimeout)
    .map((response: Response) => response.json());
  }

  sendProjectApprovalEmail(userID: number, ownerID: number, projectName: string, approved: boolean, comment: string) {
      return this.http.post(`/api/sendProjectApprovalEmail/${userID}/${ownerID}/${projectName}/${approved}/${comment}`, null)
      .timeout(this.cacheService.apiDataTimeout)
      .map((response: Response) => response.json());
  }


}
