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
    this.timeout = 90000;
  }


  // attempt to authenticate the user credentials using windows login and ldap
  authenticate(user: any) {
    const headers = new Headers({'Content-Type': 'application/json'});
    const options = new RequestOptions({headers: headers});
    return this.http.post('/api/login', JSON.stringify(user), options)
      .timeout(this.timeout)
      .map((response: Response) => response.json());
  }

  // decode the jwt token to get the user info, issued and expiration dates
  getInfoFromToken(token) {
    const queryString = '?token=' + token;
    return this.http.get(`/api/getInfoFromToken${queryString}`)
      .timeout(this.timeout)
      .map((response: Response) => response.json());
  }

  // reset / get a new token with pushed out expiration date
  resetToken(user: any) {
    const headers = new Headers({'Content-Type': 'application/json'});
    const options = new RequestOptions({headers: headers});
    return this.http.post(`/api/resetToken`, JSON.stringify(user), options)
      .timeout(this.timeout)
      .map((response: Response) => response.json());
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

  // get FTE data
  getFteData(userID: number) {
    return this.http.get(`/api/ftedata/${userID}`)
      .timeout(this.timeout)
      .map((response: Response) => response.json());
  }

  getEmployeeData(managerEmailAddress: string) {
    return this.http.get(`/api/employeeList/${managerEmailAddress}`)
    .timeout(this.timeout)
    .map((response: Response) => response.json());
  }

  // update FTE data
  updateFteData(fteData: any, userID: number) {
    const headers = new Headers({'Content-Type': 'application/json'});
    const options = new RequestOptions({headers: headers});
    return this.http.post(`/api/ftedata/${userID}`, JSON.stringify(fteData), options)
      .timeout(this.timeout)
      .map((response: Response) => response.json());
  }

  deleteFteProject(projectID: any, userID: number) {
    const headers = new Headers({'Content-Type': 'application/json'});
    const options = new RequestOptions({headers: headers});
    return this.http.post(`/api/ftedata/deleteProject/${userID}`, JSON.stringify(projectID), options)
    .timeout(this.timeout)
    .map((response: Response) => response.json());
  }

  getOrgData(emailAddress: string) {
    return this.http.get(`/api/org/${emailAddress}`)
      .timeout(this.timeout)
      .map((response: Response) => response.json());
  }

  getProjects() {
    return this.http.get('api/projects')
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

  getProjectRoster(projectID: number) {
    return this.http.get(`/api/getProjectRoster/${projectID}`)
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

  responseProjectAccessRequest(request: any, reply: string, userID: number) {
    const headers = new Headers({'Content-Type': 'application/json'});
    const options = new RequestOptions({ headers: headers });
    return this.http.post(`/api/responseProjectAccessRequest/${userID}/${reply}`, JSON.stringify(request), options)
      .timeout(this.timeout)
      .map((response: Response) => response.json());
  }

  getProjectFTEHistory(projectID: number) {
    return this.http.get(`/api/getProjectFTEHistory/${projectID}`)
      .timeout(this.timeout)
      .map((response: Response) => response.json());
  }

  getTopFTEProjectList() {
    return this.http.get(`/api/getTopFTEProjectList/`)
      .timeout(this.timeout)
      .map((response: Response) => response.json());
  }

  getProjectEmployeeFTEList(projectID: number, fiscalDate: string) {
    return this.http.get(`/api/getProjectEmployeeFTEList/${projectID}/${fiscalDate}`)
      .timeout(this.timeout)
      .map((response: Response) => response.json());
  }

  getQuarterlyEmployeeFTETotals(employeeID: number, fiscalQuarter: number, fiscalYear: number) {
    return this.http.get(`/api/getQuarterlyEmployeeFTETotals/${employeeID}/${fiscalQuarter}/${fiscalYear}`)
      .timeout(this.timeout)
      .map((response: Response) => response.json());
  }


}
