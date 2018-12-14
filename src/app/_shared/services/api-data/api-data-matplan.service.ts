import { Injectable } from '@angular/core';
import { Http, Headers, Response, RequestOptions, ResponseContentType } from '@angular/http';
import { CacheService } from '../cache.service';

@Injectable()
export class ApiDataMatplanService {

  constructor(
    private http: Http,
    private cacheService: CacheService
  ) { }

  show(matplanID: number) {
    const headers = new Headers({'Content-Type': 'application/json', 'X-Token': this.cacheService.token.signedToken});
    const options = new RequestOptions({headers: headers});
    return this.http.get(`/api/matplan/matplan/show/${matplanID}`, options)
      .timeout(this.cacheService.apiDataTimeout)
      .map((response: Response) => response.json());
  }

  indexSuppliers() {
    const headers = new Headers({'Content-Type': 'application/json', 'X-Token': this.cacheService.token.signedToken});
    const options = new RequestOptions({headers: headers});
    return this.http.get(`/api/matplan/matplan/index/indexSuppliers`, options)
      .timeout(this.cacheService.apiDataTimeout)
      .map((response: Response) => response.json());
  }

  indexPurchaseMethod() {
    const headers = new Headers({'Content-Type': 'application/json', 'X-Token': this.cacheService.token.signedToken});
    const options = new RequestOptions({headers: headers});
    return this.http.get(`/api/matplan/matplan/index/indexPurchaseMethod`, options)
      .timeout(this.cacheService.apiDataTimeout)
      .map((response: Response) => response.json());
  }

  indexProjects() {
    const headers = new Headers({'Content-Type': 'application/json', 'X-Token': this.cacheService.token.signedToken});
    const options = new RequestOptions({headers: headers});
    return this.http.get(`/api/matplan/matplan/index/indexProjects`, options)
      .timeout(this.cacheService.apiDataTimeout)
      .map((response: Response) => response.json());
  }

  showMatplans(projectID: number) {
    const headers = new Headers({'Content-Type': 'application/json', 'X-Token': this.cacheService.token.signedToken});
    const options = new RequestOptions({headers: headers});
    return this.http.get(`/api/matplan/matplan/show/showMatplans/${projectID}`, options)
      .timeout(this.cacheService.apiDataTimeout)
      .map((response: Response) => response.json());
  }

  showMatplanBom(projectID: number) {
    const headers = new Headers({'Content-Type': 'application/json', 'X-Token': this.cacheService.token.signedToken});
    const options = new RequestOptions({headers: headers});
    return this.http.get(`/api/matplan/matplan/show/showMatplanBom/${projectID}`, options)
      .timeout(this.cacheService.apiDataTimeout)
      .map((response: Response) => response.json());
  }

  showQuotesForPart(partID: number) {
    const headers = new Headers({'Content-Type': 'application/json', 'X-Token': this.cacheService.token.signedToken});
    const options = new RequestOptions({headers: headers});
    return this.http.get(`/api/matplan/matplan/show/showQuotesForPart/${partID}`, options)
      .timeout(this.cacheService.apiDataTimeout)
      .map((response: Response) => response.json());
  }

  showSpecificQuote(partID: number, supplierID: number) {
    const headers = new Headers({'Content-Type': 'application/json', 'X-Token': this.cacheService.token.signedToken});
    const options = new RequestOptions({headers: headers});
    return this.http.get(`/api/matplan/matplan/show/showSpecificQuote/${partID}/${supplierID}`, options)
      .timeout(this.cacheService.apiDataTimeout)
      .map((response: Response) => response.json());
  }

  createMatplan(projectID: number, buildStatusID: number) {
    const headers = new Headers({'Content-Type': 'application/json', 'X-Token': this.cacheService.token.signedToken});
    const options = new RequestOptions({headers: headers});
    return this.http.get(`/api/matplan/matplan/insert/createMatplan/${projectID}/${buildStatusID}`, options)
      .timeout(this.cacheService.apiDataTimeout)
      .map((response: Response) => response.json());
  }

  destroyQuoteForPart(quoteData: any) {
    const headers = new Headers({'Content-Type': 'application/json', 'X-Token': this.cacheService.token.signedToken});
    const options = new RequestOptions({headers: headers});
    return this.http.put(`/api/matplan/matplan/destroy/destroyQuoteForPart`, JSON.stringify(quoteData), options)
      .timeout(this.cacheService.apiDataTimeout)
      .map((response: Response) => response.json());
  }

  // update quote records for a part
  updateQuoteForPart(quoteData: any) {
    const headers = new Headers({'Content-Type': 'application/json', 'X-Token': this.cacheService.token.signedToken});
    const options = new RequestOptions({headers: headers});
    return this.http.put(`/api/matplan/matplan/update/updateQuoteForPart`, JSON.stringify(quoteData), options)
      .timeout(this.cacheService.apiDataTimeout)
      .map((response: Response) => response.json());
  }

  updateMaterialOrder(matOrderData: any) {
    const headers = new Headers({'Content-Type': 'application/json', 'X-Token': this.cacheService.token.signedToken});
    const options = new RequestOptions({headers: headers});
    return this.http.put(`/api/matplan/matplan/update/updateMaterialOrder`, JSON.stringify(matOrderData), options)
      .timeout(this.cacheService.apiDataTimeout)
      .map((response: Response) => response.json());
  }

  showMatplanOrders(projectID: number, matplanID: number) {
    const headers = new Headers({'Content-Type': 'application/json', 'X-Token': this.cacheService.token.signedToken});
    const options = new RequestOptions({headers: headers});
    return this.http.get(`/api/matplan/matplan/show/showMatplanOrders/${projectID}/${matplanID}`, options)
      .timeout(this.cacheService.apiDataTimeout)
      .map((response: Response) => response.json());
  }

}
