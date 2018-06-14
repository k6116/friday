import { Injectable } from '@angular/core';
import { Http, Headers, Response, RequestOptions, ResponseContentType } from '@angular/http';
import { AppDataService } from '../app-data.service';

@Injectable()
export class ApiDataProjectService {

  constructor(
    private http: Http,
    private appDataService: AppDataService
  ) { }

  getProjects() {
    return this.http.get('api/projects')
    .timeout(this.appDataService.apiDataTimeout)
    .map((response: Response) => response.json());
  }

  getProjectRoster(projectID: number) {
    return this.http.get(`/api/getProjectRoster/${projectID}`)
      .timeout(this.appDataService.apiDataTimeout)
      .map((response: Response) => response.json());
  }

}
