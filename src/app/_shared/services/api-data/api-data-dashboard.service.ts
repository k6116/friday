import { Injectable } from '@angular/core';
import { Http, Headers, Response, RequestOptions, ResponseContentType } from '@angular/http';
import { Observable } from 'rxjs/observable';
import { forkJoin } from 'rxjs/observable/forkJoin';
import { AppDataService } from '../app-data.service';

@Injectable()
export class ApiDataDashboardService {

  constructor(
    private http: Http,
    private appDataService: AppDataService
  ) { }

}
