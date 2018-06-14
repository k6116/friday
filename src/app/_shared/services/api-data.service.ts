import { Injectable } from '@angular/core';
import { Http, Headers, Response, RequestOptions, ResponseContentType } from '@angular/http';
import { Observable } from 'rxjs/observable';
import { forkJoin } from 'rxjs/observable/forkJoin';
import 'rxjs/add/operator/timeout';
import 'rxjs/add/operator/map';
import { AnonymousSubscription } from 'rxjs/Subscription';


@Injectable()
export class ApiDataService {

  timeout: number;

  constructor(
    private http: Http
  ) {
    // set the timeout to 15 seconds
    this.timeout = 100 * 60 * 30;
  }


  // get all users (index)
  getUserData() {
    const token = localStorage.getItem('jarvisToken') ? '?token=' + localStorage.getItem('jarvisToken') : '';
    // console.log('token query string is:');
    // console.log(token);
    return this.http.get(`/api/users${token}`)
      .timeout(this.timeout)
      .map((response: Response) => response.json());
  }




  // for click tracking
  logClick(clickData: any, userID: number) {
    const headers = new Headers({'Content-Type': 'application/json'});
    const options = new RequestOptions({headers: headers});
    return this.http.post(`/api/clickTracking/${userID}`, JSON.stringify(clickData), options)
      .timeout(this.timeout)
      .map((response: Response) => response.json());
  }

  getUserPLMData(userEmailAddress: string) {
    return this.http.get(`/api/getUserPLMData/${userEmailAddress}`)
      .timeout(this.timeout)
      .map((response: Response) => response.json());
  }
  getProjectList() {
    return this.http.get(`/api/projects/projectlist`)
      .timeout(this.timeout)
      .map((response: Response) => response.json());
  }

  getJobTitleList() {
    return this.http.get(`/api/getJobTitleList/`)
    .timeout(this.timeout)
    .map((response: Response) => response.json());
  }

  updateProfile(userID: number, jobTitles: any) {
    const headers = new Headers({'Content-Type': 'application/json'});
    const options = new RequestOptions({headers: headers});
    return this.http.post(`/api/updateProfile/${userID}`, JSON.stringify(jobTitles), options)
      .timeout(this.timeout)
      .map((response: Response) => response.json());
  }

  getUserProjectList(userID: number) {
    return this.http.get(`/api/getUserProjectList/${userID}`)
    .timeout(this.timeout)
    .map((response: Response) => response.json());
  }

  getProjectTypesList() {
    return this.http.get(`/api/getProjectTypesList/`)
    .timeout(this.timeout)
    .map((response: Response) => response.json());
  }

  createProject(project: any, userID: number) {
    const headers = new Headers({'Content-Type': 'application/json'});
    const options = new RequestOptions({ headers: headers });
    return this.http.post(`/api/createProject/${userID}`, JSON.stringify(project), options)
      .timeout(this.timeout)
      .map((response: Response) => response.json());
  }

  updateProject(project: any, userID: number) {
    const headers = new Headers({'Content-Type': 'application/json'});
    const options = new RequestOptions({ headers: headers });
    return this.http.post(`/api/updateProject/${userID}`, JSON.stringify(project), options)
      .timeout(this.timeout)
      .map((response: Response) => response.json());
  }

  deleteProject(project: any, userID: number) {
    const headers = new Headers({'Content-Type': 'application/json'});
    const options = new RequestOptions({ headers: headers });
    return this.http.post(`/api/deleteProject/${userID}`, JSON.stringify(project), options)
      .timeout(this.timeout)
      .map((response: Response) => response.json());
  }

  getPrimaryKeyRefs(pKeyName: string, pKeyValue: number, userID: number) {
    return this.http.get(`/api/getPrimaryKeyRefs/${pKeyName}/${pKeyValue}/${userID}`)
    .timeout(this.timeout)
    .map((response: Response) => response.json());
  }


  submitProjectAccessRequest(project: number, userID: number) {
    const headers = new Headers({'Content-Type': 'application/json'});
    const options = new RequestOptions({ headers: headers });
    return this.http.post(`/api/submitProjectAccessRequest/${userID}`, JSON.stringify(project), options)
      .timeout(this.timeout)
      .map((response: Response) => response.json());
  }

  getProjectAccessRequestsList(userID: number) {
    return this.http.get(`/api/getProjectAccessRequestsList/${userID}`)
      .timeout(this.timeout)
      .map((response: Response) => response.json());
  }

  getPublicProjectTypes(userID: number) {
    return this.http.get(`/api/getPublicProjectTypes/${userID}`)
      .timeout(this.timeout)
      .map((response: Response) => response.json());
  }

  getProjectAccessTeamList(userID: number, managerEmailAddress: string) {
    return this.http.get(`/api/getProjectAccessTeamList/${userID}/${managerEmailAddress}`)
      .timeout(this.timeout)
      .map((response: Response) => response.json());
  }

  getProjectAccessList(userID: number) {
    return this.http.get(`/api/getProjectAccessList/${userID}`)
      .timeout(this.timeout)
      .map((response: Response) => response.json());
  }

  responseProjectAccessRequest(request: any, reply: string, replyComment: string, userID: number) {
    const headers = new Headers({'Content-Type': 'application/json'});
    const options = new RequestOptions({ headers: headers });
    return this.http.post(`/api/responseProjectAccessRequest/${userID}/${reply}/${replyComment}`, JSON.stringify(request), options)
      .timeout(this.timeout)
      .map((response: Response) => response.json());
  }

  sendRequestProjectEmail(userID: number, ownerID: number, projectName: string) {
    return this.http.post(`/api/sendRequestProjectEmail/${userID}/${ownerID}/${projectName}`, null)
    .timeout(this.timeout)
    .map((response: Response) => response.json());
  }

  sendProjectApprovalEmail(userID: number, ownerID: number, projectName: string, approved: boolean, comment: string) {
      return this.http.post(`/api/sendProjectApprovalEmail/${userID}/${ownerID}/${projectName}/${approved}/${comment}`, null)
      .timeout(this.timeout)
      .map((response: Response) => response.json());
  }


  // ORG API ROUTES
  getSubordinatesFlat(emailAddress: string) {
    return this.http.get(`/api/org/subordinatesFlat/${emailAddress}`)
      .timeout(this.timeout)
      .map((response: Response) => response.json());
  }


}
