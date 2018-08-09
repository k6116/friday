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

  // check it job title and subtitle has been set
  checkJobTitleUpdated() {
    const headers = new Headers({'X-Token': this.cacheService.token.signedToken});
    const options = new RequestOptions({headers: headers});
    return this.http.get('api/dashboard/checkJobTitle', options)
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
