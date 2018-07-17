import { Injectable } from '@angular/core';
import { Http, Headers, Response, RequestOptions, ResponseContentType } from '@angular/http';
import { Observable } from 'rxjs/observable';
import { CacheService } from '../cache.service';

@Injectable()
export class ApiDataSchedulesService {

  constructor(
    private http: Http,
    private cacheService: CacheService
  ) { }

  getSchedules(): Observable<any> {
    return this.http.get('api/indexSchedules')
    .timeout(this.cacheService.apiDataTimeout)
    .map((response: Response) => response.json());
  }

}
