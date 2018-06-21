import { Injectable } from '@angular/core';
import { Http, Headers, Response, RequestOptions, ResponseContentType } from '@angular/http';
import { AppDataService } from '../app-data.service';

@Injectable()
export class ApiDataEmailService {

  timeout: number;

  constructor(
    private http: Http,
    private appDataService: AppDataService
  ) { }

  sendRequestProjectEmail(userID: number, ownerID: number, projectName: string) {
    return this.http.post(`/api/sendRequestProjectEmail/${userID}/${ownerID}/${projectName}`, null)
    .timeout(this.appDataService.apiDataTimeout)
    .map((response: Response) => response.json());
  }

  sendProjectApprovalEmail(userID: number, ownerID: number, projectName: string, approved: boolean, comment: string) {
      return this.http.post(`/api/sendProjectApprovalEmail/${userID}/${ownerID}/${projectName}/${approved}/${comment}`, null)
      .timeout(this.appDataService.apiDataTimeout)
      .map((response: Response) => response.json());
  }


}
