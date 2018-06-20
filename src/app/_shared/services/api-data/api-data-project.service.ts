import { Injectable } from '@angular/core';
import { Http, Headers, Response, RequestOptions, ResponseContentType } from '@angular/http';
import { AppDataService } from '../app-data.service';

@Injectable()
export class ApiDataProjectService {

  timeout: number;

  constructor(
    private http: Http,
    private appDataService: AppDataService
  ) { }

  getProjects() {
    return this.http.get('api/indexProjects')
    .timeout(this.appDataService.apiDataTimeout)
    .map((response: Response) => response.json());
  }

  getProjectRoster(projectID: number) {
    return this.http.get(`/api/indexProjectRoster/${projectID}`)
      .timeout(this.appDataService.apiDataTimeout)
      .map((response: Response) => response.json());
  }

  getUserProjectList(userID: number) {
    return this.http.get(`/api/indexUserProjectList/${userID}`)
    .timeout(this.appDataService.apiDataTimeout)
    .map((response: Response) => response.json());
  }

  createProject(project: any, userID: number) {
    const headers = new Headers({'Content-Type': 'application/json'});
    const options = new RequestOptions({ headers: headers });
    return this.http.post(`/api/insertProject/${userID}`, JSON.stringify(project), options)
      .timeout(this.appDataService.apiDataTimeout)
      .map((response: Response) => response.json());
  }

  updateProject(project: any, userID: number) {
    const headers = new Headers({'Content-Type': 'application/json'});
    const options = new RequestOptions({ headers: headers });
    return this.http.post(`/api/updateProject/${userID}`, JSON.stringify(project), options)
      .timeout(this.appDataService.apiDataTimeout)
      .map((response: Response) => response.json());
  }

  deleteProject(project: any, userID: number) {
    const headers = new Headers({'Content-Type': 'application/json'});
    const options = new RequestOptions({ headers: headers });
    return this.http.post(`/api/destroyProject/${userID}`, JSON.stringify(project), options)
      .timeout(this.appDataService.apiDataTimeout)
      .map((response: Response) => response.json());
  }

  getProjectTypesList() {
    return this.http.get(`/api/indexProjectTypesList/`)
    .timeout(this.appDataService.apiDataTimeout)
    .map((response: Response) => response.json());
  }

  getProjectSchedule(projectName: string) {
    return this.http.get(`/api/indexProjectSchedule/${projectName}`)
      .timeout(this.appDataService.apiDataTimeout)
      .map((response: Response) => response.json());
  }

  getProjectTypeDisplayFields() {
    return this.http.get(`/api/indexProjectTypeDisplayFields/`)
      .timeout(this.appDataService.apiDataTimeout)
      .map((response: Response) => response.json());
  }

  getProjectRoles() {
    return this.http.get(`/api/indexProjectRoles/`)
      .timeout(this.appDataService.apiDataTimeout)
      .map((response: Response) => response.json());
  }

  getUserProjectRoles(userID: number) {
    return this.http.get(`/api/indexUserProjectRoles/${userID}`)
      .timeout(this.appDataService.apiDataTimeout)
      .map((response: Response) => response.json());
  }

  insertProjectEmployeeRole(employeeProjectRoleData: any, userID: number) {
    const headers = new Headers({'Content-Type': 'application/json'});
    const options = new RequestOptions({ headers: headers });
    return this.http.post(`/api/insertProjectEmployeeRole/${userID}`, JSON.stringify(employeeProjectRoleData), options)
      .timeout(this.appDataService.apiDataTimeout)
      .map((response: Response) => response.json());
  }

  updateProjectEmployeeRole(projectEmployeeRoleData: any, userID: number) {
    const headers = new Headers({'Content-Type': 'application/json'});
    const options = new RequestOptions({ headers: headers });
    return this.http.post(`/api/updateProjectEmployeeRole/${userID}`, JSON.stringify(projectEmployeeRoleData), options)
      .timeout(this.appDataService.apiDataTimeout)
      .map((response: Response) => response.json());
  }

}
