import { Injectable } from '@angular/core';
import { Http, Headers, Response, RequestOptions, ResponseContentType } from '@angular/http';
import { Observable } from 'rxjs/observable';
import { forkJoin } from 'rxjs/observable/forkJoin';
import { CacheService } from '../cache.service';
import 'rxjs/add/operator/map';


@Injectable()
export class ApiDataProjectService {

  // TO-DO PAUL: in all api-data services, remove timeout declaration, and declare the return type
  // to think about, can we just say 'getRoster' instead of 'getProjectRoster'
  timeout: number;

  constructor(
    private http: Http,
    private cacheService: CacheService
  ) { }

  getProjects(): Observable<any> {
    return this.http.get('api/indexProjects')
    .timeout(this.cacheService.apiDataTimeout)
    .map((response: Response) => response.json());
  }

  getProject(projectID: number): Observable<any> {
    const headers = new Headers({'X-Token': this.cacheService.token.signedToken});
    const options = new RequestOptions({headers: headers});
    return this.http.get(`api/project/displayProject/show/getProject/${projectID}`, options)
      .timeout(this.cacheService.apiDataTimeout)
      .map((response: Response) => response.json());
  }

  getProjectsFilterProjectType(): Observable<any> {
    return this.http.get('api/indexProjectsFilterProjectType')
    .timeout(this.cacheService.apiDataTimeout)
    .map((response: Response) => response.json());
  }

  getProjectRoster(projectID: number) {
    return this.http.get(`/api/indexProjectRoster/${projectID}`)
      .timeout(this.cacheService.apiDataTimeout)
      .map((response: Response) => response.json());
  }

  getUserProjectList(userID: number) {
    return this.http.get(`/api/indexUserProjectList/${userID}`)
    .timeout(this.cacheService.apiDataTimeout)
    .map((response: Response) => response.json());
  }

  createProject(project: any, userID: number) {
    const headers = new Headers({'Content-Type': 'application/json'});
    const options = new RequestOptions({ headers: headers });
    return this.http.post(`/api/insertProject/${userID}`, JSON.stringify(project), options)
      .timeout(this.cacheService.apiDataTimeout)
      .map((response: Response) => response.json());
  }

  updateProject(project: any, userID: number) {
    const headers = new Headers({'Content-Type': 'application/json'});
    const options = new RequestOptions({ headers: headers });
    return this.http.post(`/api/updateProject/${userID}`, JSON.stringify(project), options)
      .timeout(this.cacheService.apiDataTimeout)
      .map((response: Response) => response.json());
  }

  // TO-DO BILL: change this from post to delete
  deleteProject(project: any, userID: number) {
    const headers = new Headers({'Content-Type': 'application/json'});
    const options = new RequestOptions({ headers: headers });
    return this.http.post(`/api/destroyProject/${userID}`, JSON.stringify(project), options)
      .timeout(this.cacheService.apiDataTimeout)
      .map((response: Response) => response.json());
  }

  getProjectTypesList() {
    return this.http.get(`/api/indexProjectTypesList/`)
    .timeout(this.cacheService.apiDataTimeout)
    .map((response: Response) => response.json());
  }

  getProjectSchedule(projectID: number) {
    return this.http.get(`/api/indexProjectSchedule/${projectID}`)
      .timeout(this.cacheService.apiDataTimeout)
      .map((response: Response) => response.json());
  }

  getProjectTypeDisplayFields() {
    return this.http.get(`/api/indexProjectTypeDisplayFields/`)
      .timeout(this.cacheService.apiDataTimeout)
      .map((response: Response) => response.json());
  }

  insertProjectEmployeeRole(employeeProjectRoleData: any, userID: number) {
    const headers = new Headers({'Content-Type': 'application/json'});
    const options = new RequestOptions({ headers: headers });
    return this.http.post(`/api/insertProjectEmployeeRole/${userID}`, JSON.stringify(employeeProjectRoleData), options)
      .timeout(this.cacheService.apiDataTimeout)
      .map((response: Response) => response.json());
  }

  updateProjectEmployeeRole(projectEmployeeRoleData: any, userID: number) {
    const headers = new Headers({'Content-Type': 'application/json'});
    const options = new RequestOptions({ headers: headers });
    return this.http.post(`/api/updateProjectEmployeeRole/${userID}`, JSON.stringify(projectEmployeeRoleData), options)
      .timeout(this.cacheService.apiDataTimeout)
      .map((response: Response) => response.json());
  }

  deleteProjectEmployeeRole(projectEmployeeRoleData: any, userID: number) {
    const headers = new Headers({'Content-Type': 'application/json'});
    const options = new RequestOptions({ headers: headers });
    return this.http.post(`/api/destroyProjectEmployeeRole/${userID}`, JSON.stringify(projectEmployeeRoleData), options)
      .timeout(this.cacheService.apiDataTimeout)
      .map((response: Response) => response.json());
  }

  insertBulkProjectEmployeeRole(projectEmployeeRoleData: any, userID: number) {
    const headers = new Headers({'Content-Type': 'application/json'});
    const options = new RequestOptions({ headers: headers });
    return this.http.post(`/api/insertBulkProjectEmployeeRole/${userID}`, JSON.stringify(projectEmployeeRoleData), options)
      .timeout(this.cacheService.apiDataTimeout)
      .map((response: Response) => response.json());
  }

  getBuildStatus(): Observable<any> {
    return this.http.get('api/indexBuildStatus')
    .timeout(this.cacheService.apiDataTimeout)
    .map((response: Response) => response.json());
  }

  getProjectPLCStatus(): Observable<any> {
    return this.http.get('api/indexPLCStatus')
    .timeout(this.cacheService.apiDataTimeout)
    .map((response: Response) => response.json());
  }

  getProjectDepartments(): Observable<any> {
    return this.http.get('api/indexProjectDepartments')
    .timeout(this.cacheService.apiDataTimeout)
    .map((response: Response) => response.json());
  }

  getProjectGroups(): Observable<any> {
    return this.http.get('api/indexProjectGroups')
    .timeout(this.cacheService.apiDataTimeout)
    .map((response: Response) => response.json());
  }

  getProjectPriorities(): Observable<any> {
    return this.http.get('api/indexProjectPriorities')
    .timeout(this.cacheService.apiDataTimeout)
    .map((response: Response) => response.json());
  }

  updateProjectSetup(project: any, userID: number) {
    const headers = new Headers({'Content-Type': 'application/json', 'X-Token': this.cacheService.token.signedToken});
    const options = new RequestOptions({ headers: headers });

    return this.http.post(`/api/updateProjectSetup/${userID}`, JSON.stringify(project), options)
      .timeout(this.cacheService.apiDataTimeout)
      .map((response: Response) => response.json());
  }

  createProjectSetup(project: any, userID: number) {
    const headers = new Headers({'Content-Type': 'application/json'});
    const options = new RequestOptions({ headers: headers });
    return this.http.post(`/api/insertProjectSetup/${userID}`, JSON.stringify(project), options)
      .timeout(this.cacheService.apiDataTimeout)
      .map((response: Response) => response.json());
  }

  deleteProjectSetup(projectID: number, scheduleID: number, userID: number) {
    return this.http.delete(`/api/destroyProjectSetup/${projectID}/${scheduleID}/${userID}`)
      .timeout(this.cacheService.apiDataTimeout)
      .map((response: Response) => response.json());
  }

  getExcelExport(payload: any) {
    const headers = new Headers({'Content-Type': 'application/json', 'X-Token': this.cacheService.token.signedToken});
    const options = new RequestOptions({ headers: headers, responseType: ResponseContentType.Blob });
    return this.http.post('/api/export/generateExcelFile', JSON.stringify(payload), options)
      .timeout(this.cacheService.apiDataTimeout)
      .map((response: Response) => response.blob());
  }

  getProjectsBrowseData(): Observable<any> {

    const headers = new Headers({'X-Token': this.cacheService.token.signedToken});
    const options = new RequestOptions({headers: headers});

    const projects = this.http.get('api/indexProjects', options)
      .timeout(this.cacheService.apiDataTimeout)
      .map((response: Response) => response.json());

    const projectTypes = this.http.get(`/api/indexProjectTypesList`, options)
      .timeout(this.cacheService.apiDataTimeout)
      .map((response: Response) => response.json());

    const projectStatuses = this.http.get(`/api/indexProjectStatusesList`, options)
      .timeout(this.cacheService.apiDataTimeout)
      .map((response: Response) => response.json());

    const projectPriorities = this.http.get(`/api/indexProjectPrioritiesList`, options)
      .timeout(this.cacheService.apiDataTimeout)
      .map((response: Response) => response.json());

    return forkJoin([projects, projectTypes, projectStatuses, projectPriorities]);

  }


  // using forkjoin to get data for the display project component for better performance
  getProjectDisplayData(projectID: number): Observable<any> {

    const headers = new Headers({'X-Token': this.cacheService.token.signedToken});
    const options = new RequestOptions({headers: headers});

    const projectData = this.http.get(`api/project/displayProject/show/getProject/${projectID}`, options)
      .timeout(this.cacheService.apiDataTimeout)
      .map((response: Response) => response.json());

    const scheduleData = this.http.get(`api/getProjectSchedule2/${projectID}`, options)
      .timeout(this.cacheService.apiDataTimeout)
      .map((response: Response) => response.json());

    const rosterData = this.http.get(`/api/indexProjectRoster/${projectID}`)
      .timeout(this.cacheService.apiDataTimeout)
      .map((response: Response) => response.json());

    return forkJoin([projectData, scheduleData, rosterData]);

  }



}
