import { Injectable } from '@angular/core';
import { Http, Headers, Response, RequestOptions, ResponseContentType } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { forkJoin } from 'rxjs/observable/forkJoin';
import { CacheService } from '../cache.service';
import 'rxjs/add/operator/map';

@Injectable()
export class ApiDataClickTrackingService {

  constructor(
    private http: Http,
    private cacheService: CacheService
  ) { }


  // insert the click tracking record
  logClick(clickData: any): Observable<any> {
    const headers = new Headers({'Content-Type': 'application/json'});
    const options = new RequestOptions({headers: headers});
    return this.http.post(`/api/clickTracking`, JSON.stringify(clickData), options)
      .timeout(this.cacheService.apiDataTimeout)
      .map((response: Response) => response.json());
  }

}
