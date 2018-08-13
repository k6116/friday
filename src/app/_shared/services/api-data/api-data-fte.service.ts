import { Injectable } from '@angular/core';
import { Http, Headers, Response, RequestOptions, ResponseContentType } from '@angular/http';
import { CacheService } from '../cache.service';
import { AuthService } from '../auth.service';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/toPromise';

@Injectable()
export class ApiDataFteService {

  constructor(
    private http: Http,
    private cacheService: CacheService,
    private authService: AuthService
  ) { }

  // get FTE data from db
  indexUserData() {
    const headers = new Headers({'Content-Type': 'application/json', 'X-Token': this.cacheService.token.signedToken});
    const options = new RequestOptions({headers: headers});
    return this.http.get(`/api/fte/fte/index/indexUserData`, options)
      .timeout(this.cacheService.apiDataTimeout)
      .map((response: Response) => response.json());
  }

  // get Team FTE data from db
  indexTeamData(emailAddress: string, startDate: string) {
    return this.http.get(`/api/fte/indexTeamData/${emailAddress}/${startDate}`)
      .timeout(this.cacheService.apiDataTimeout)
      .map((response: Response) => response.json());
  }

  // delete an entire project from a user's FTE table
  destroyUserProject(projectID: number) {
    const headers = new Headers({'Content-Type': 'application/json', 'X-Token': this.cacheService.token.signedToken});
    const options = new RequestOptions({headers: headers});
    return this.http.delete(`/api/fte/fte/destroy/destroyUserProject/${projectID}`, options)
    .timeout(this.cacheService.apiDataTimeout)
    .map((response: Response) => response.json());
  }

  // update existing FTE records
  updateUserData(fteData: any) {
    const headers = new Headers({'Content-Type': 'application/json', 'X-Token': this.cacheService.token.signedToken});
    const options = new RequestOptions({headers: headers});
    return this.http.put(`/api/fte/fte/update/updateUserData`, JSON.stringify(fteData), options)
      .timeout(this.cacheService.apiDataTimeout)
      .map((response: Response) => response.json());
  }

  // update existing Team FTE records
  updateTeamData(fteData: any, userID: number, planName: string) {
    const headers = new Headers({'Content-Type': 'application/json'});
    const options = new RequestOptions({headers: headers});
    return this.http.post(`/api/fte/updateTeamData/${userID}/${planName}`, JSON.stringify(fteData), options)
      .timeout(this.cacheService.apiDataTimeout)
      .map((response: Response) => response.json());
  }

  // delete an entire project from team's planning FTE table
  destroyTeamProject(projectID: any) {
    const headers = new Headers({'Content-Type': 'application/json'});
    const options = new RequestOptions({headers: headers});
    return this.http.post(`/api/fte/destroyTeamProject/`, JSON.stringify(projectID), options)
    .timeout(this.cacheService.apiDataTimeout)
    .map((response: Response) => response.json());
  }

  // create a new FTE Plan and return it
  indexNewPlan(emailAddress: string, userID: number, planName: string) {
    return this.http.get(`/api/fte/indexNewPlan/${emailAddress}/${userID}/${planName}`)
      .timeout(this.cacheService.apiDataTimeout)
      .map((response: Response) => response.json());
  }

  // return a specific Plan
  indexPlan(userID: number, planName: string) {
    return this.http.get(`/api/fte/indexPlan/${userID}/${planName}`)
      .timeout(this.cacheService.apiDataTimeout)
      .map((response: Response) => response.json());
  }

  // create a new FTE Plan and return it
  indexPlanList(userID: number) {
    return this.http.get(`/api/fte/indexPlanList/${userID}`)
      .timeout(this.cacheService.apiDataTimeout)
      .map((response: Response) => response.json());
  }

  // update existing Team FTE records
  deletePlan(planData: any) {
    const headers = new Headers({'Content-Type': 'application/json'});
    const options = new RequestOptions({headers: headers});
    return this.http.post(`/api/fte/destroyPlan/`, JSON.stringify(planData), options)
      .timeout(this.cacheService.apiDataTimeout)
      .map((response: Response) => response.json());
  }

  // check it job title and subtitle has been set (synchronous version)
  async checkJobTitleUpdatedSync(token: string) {
    const headers = new Headers({'X-Token': token});
    const options = new RequestOptions({headers: headers});
    return await this.http.get('api/dashboard/checkJobTitle', options)
      .timeout(this.cacheService.apiDataTimeout)
      .map((response: Response) => response.json()).toPromise();
  }


}
