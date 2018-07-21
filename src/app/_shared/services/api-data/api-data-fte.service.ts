import { Injectable } from '@angular/core';
import { Http, Headers, Response, RequestOptions, ResponseContentType } from '@angular/http';
import { CacheService } from '../cache.service';
import 'rxjs/add/operator/map';

@Injectable()
export class ApiDataFteService {

  constructor(
    private http: Http,
    private cacheService: CacheService
  ) { }

  // get FTE data from db
  indexUserData(userID: number) {
    return this.http.get(`/api/fte/indexUserData/${userID}`)
      .timeout(this.cacheService.apiDataTimeout)
      .map((response: Response) => response.json());
  }

  // delete an entire project from a user's FTE table
  destroyUserProject(projectID: any, userID: number) {
    const headers = new Headers({'Content-Type': 'application/json'});
    const options = new RequestOptions({headers: headers});
    return this.http.post(`/api/fte/destroyUserProject/${userID}`, JSON.stringify(projectID), options)
    .timeout(this.cacheService.apiDataTimeout)
    .map((response: Response) => response.json());
  }

  // update existing FTE records
  updateUserData(fteData: any, userID: number) {
    const headers = new Headers({'Content-Type': 'application/json'});
    const options = new RequestOptions({headers: headers});
    return this.http.post(`/api/fte/updateUserData/${userID}`, JSON.stringify(fteData), options)
      .timeout(this.cacheService.apiDataTimeout)
      .map((response: Response) => response.json());
  }

  // check it job title and subtitle has been set
  checkJobTitleUpdated(userID: number) {
    return this.http.get(`/api/dashboard/checkJobTitle/${userID}`)
      .timeout(this.cacheService.apiDataTimeout)
      .map((response: Response) => response.json());
  }

}
