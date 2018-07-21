import { Injectable } from '@angular/core';
import { Http, Headers, Response, RequestOptions, ResponseContentType } from '@angular/http';
import { CacheService } from '../cache.service';
import 'rxjs/add/operator/map';


@Injectable()
export class ApiDataPermissionService {

  timeout: number;

  constructor(
    private http: Http,
    private cacheService: CacheService
  ) { }


  getPublicProjectTypes(userID: number) {
    return this.http.get(`/api/indexPublicProjectTypes/${userID}`)
      .timeout(this.cacheService.apiDataTimeout)
      .map((response: Response) => response.json());
  }

  getProjectPermissionRequestsList(userID: number) {
    return this.http.get(`/api/indexProjectPermissionRequestsList/${userID}`)
      .timeout(this.cacheService.apiDataTimeout)
      .map((response: Response) => response.json());
  }

  getProjectPermissionTeamList(userID: number, managerEmailAddress: string) {
    return this.http.get(`/api/indexProjectPermissionTeamList/${userID}/${managerEmailAddress}`)
      .timeout(this.cacheService.apiDataTimeout)
      .map((response: Response) => response.json());
  }

  getProjectPermissionList(userID: number) {
    return this.http.get(`/api/indexProjectPermissionRequestedList/${userID}`)
      .timeout(this.cacheService.apiDataTimeout)
      .map((response: Response) => response.json());
  }

  insertProjectPermissionRequest(requestData: any, userID: number) {
    const headers = new Headers({'Content-Type': 'application/json'});
    const options = new RequestOptions({ headers: headers });
    return this.http.post(`/api/insertProjectPermissionRequest/${userID}`, JSON.stringify(requestData), options)
      .timeout(this.cacheService.apiDataTimeout)
      .map((response: Response) => response.json());
  }

  updateProjectPermissionResponse(requestData: any, reply: string, replyComment: string, userID: number) {
    const headers = new Headers({'Content-Type': 'application/json'});
    const options = new RequestOptions({ headers: headers });
    return this.http.post(`/api/updateProjectPermissionResponse/${userID}/${reply}/${replyComment}`, JSON.stringify(requestData), options)
      .timeout(this.cacheService.apiDataTimeout)
      .map((response: Response) => response.json());
  }

  updateProjectPermissionRequest(requestData: any, userID: number) {
    const headers = new Headers({'Content-Type': 'application/json'});
    const options = new RequestOptions({ headers: headers });
    return this.http.post(`/api/updateProjectPermissionRequest/${userID}`, JSON.stringify(requestData), options)
      .timeout(this.cacheService.apiDataTimeout)
      .map((response: Response) => response.json());
  }

}
