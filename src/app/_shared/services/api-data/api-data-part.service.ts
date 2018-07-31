import { Injectable } from '@angular/core';
import { Http, Headers, Response, RequestOptions, ResponseContentType } from '@angular/http';
import { Observable } from 'rxjs/observable';
import { CacheService } from '../cache.service';

@Injectable()
export class ApiDataPartService {

  constructor(
    private http: Http,
    private cacheService: CacheService
  ) { }

  getParts(): Observable<any> {
    return this.http.get('api/getParts')
    .timeout(this.cacheService.apiDataTimeout)
    .map((response: Response) => response.json());
  }

  getPart(): Observable<any> {
    return this.http.get('api/getPart/:partID')
    .timeout(this.cacheService.apiDataTimeout)
    .map((response: Response) => response.json());
  }

  getPartTypes(): Observable<any> {
    return this.http.get('api/getPartTypes')
    .timeout(this.cacheService.apiDataTimeout)
    .map((response: Response) => response.json());
  }

  updatePart(partData: any, userID: number) {
    const headers = new Headers({'Content-Type': 'application/json'});
    const options = new RequestOptions({ headers: headers });
    return this.http.post(`/api/updatePart/${userID}`, JSON.stringify(partData), options)
      .timeout(this.cacheService.apiDataTimeout)
      .map((response: Response) => response.json());
  }

  createPart(partData: any, userID: number) {
    const headers = new Headers({'Content-Type': 'application/json'});
    const options = new RequestOptions({ headers: headers });
    return this.http.post(`/api/createPart/${userID}`, JSON.stringify(partData), options)
      .timeout(this.cacheService.apiDataTimeout)
      .map((response: Response) => response.json());
  }

  deletePart(partID: number, scheduleID: number, userID: number) {
    return this.http.delete(`/api/deletePart/${partID}/${scheduleID}/${userID}`)
      .timeout(this.cacheService.apiDataTimeout)
      .map((response: Response) => response.json());
  }
}
