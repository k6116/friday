import { Injectable } from '@angular/core';
import { Http, Headers, Response, RequestOptions, ResponseContentType } from '@angular/http';
import { AppDataService } from '../app-data.service';

@Injectable()
export class ApiDataMetaDataService {

  timeout: number;

  constructor(
    private http: Http,
    private appDataService: AppDataService
  ) {
  }

  getPrimaryKeyRefs(pKeyName: string, pKeyValue: number, userID: number) {
    return this.http.get(`/api/indexPrimaryKeyRefs/${pKeyName}/${pKeyValue}/${userID}`)
    .timeout(this.appDataService.apiDataTimeout)
    .map((response: Response) => response.json());
  }

}
