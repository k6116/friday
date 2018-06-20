import { Injectable } from '@angular/core';
import { Http, Headers, Response } from '@angular/http';
import { Observable } from 'rxjs/observable';
import 'rxjs/add/operator/timeout';

@Injectable()
export class ApiDataMetaDataService {

  timeout: number;

  constructor(
    private http: Http
  ) {
  }

  getPrimaryKeyRefs(pKeyName: string, pKeyValue: number, userID: number) {
    return this.http.get(`/api/indexPrimaryKeyRefs/${pKeyName}/${pKeyValue}/${userID}`)
    .timeout(this.timeout)
    .map((response: Response) => response.json());
  }

}
