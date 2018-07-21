import { Injectable } from '@angular/core';
import { Http, Headers, Response, RequestOptions, ResponseContentType } from '@angular/http';
import { CacheService } from '../cache.service';
import 'rxjs/add/operator/map';


@Injectable()
export class ApiDataMetaDataService {

  timeout: number;

  constructor(
    private http: Http,
    private cacheService: CacheService
  ) {
  }

  getPrimaryKeyRefs(pKeyName: string, pKeyValue: number, userID: number) {
    return this.http.get(`/api/indexPrimaryKeyRefs/${pKeyName}/${pKeyValue}/${userID}`)
    .timeout(this.cacheService.apiDataTimeout)
    .map((response: Response) => response.json());
  }

}
