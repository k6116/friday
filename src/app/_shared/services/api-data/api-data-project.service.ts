import { Injectable } from '@angular/core';
import { Http, Headers, Response, RequestOptions, ResponseContentType } from '@angular/http';
import { Observable } from 'rxjs/observable';
import { CacheService } from '../cache.service';

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

  getProjectSchedule(projectName: string) {
    return this.http.get(`/api/indexProjectSchedule/${projectName}`)
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

}
