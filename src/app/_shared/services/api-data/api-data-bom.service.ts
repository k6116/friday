import { Injectable } from '@angular/core';
import { Http, Headers, Response, RequestOptions, ResponseContentType } from '@angular/http';
import { CacheService } from '../cache.service';

@Injectable()
export class ApiDataBomService {

  constructor(
    private http: Http,
    private cacheService: CacheService
  ) { }

  // get FTE data from db
  index() {
    return this.http.get(`/api/bom/index`)
      .timeout(this.cacheService.apiDataTimeout)
      .map((response: Response) => response.json());
  }

  showSingleBom(parentID: number) {
    return this.http.get(`/api/bom/showSingleBom/${parentID}`)
      .timeout(this.cacheService.apiDataTimeout)
      .map((response: Response) => response.json());
  }

  showPartInfo(partID: number) {
    return this.http.get(`/api/bom/showPartInfo/${partID}`)
      .timeout(this.cacheService.apiDataTimeout)
      .map((response: Response) => response.json());
  }

  showProjectInfo(projectID: number) {
    return this.http.get(`/api/bom/showProjectInfo/${projectID}`)
      .timeout(this.cacheService.apiDataTimeout)
      .map((response: Response) => response.json());
  }

}
