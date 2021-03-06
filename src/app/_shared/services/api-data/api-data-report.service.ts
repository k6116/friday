import { Injectable } from '@angular/core';
import { Http, Headers, Response, RequestOptions, ResponseContentType } from '@angular/http';
import { CacheService } from '../cache.service';
import { AuthService } from '../auth.service';
import 'rxjs/add/operator/map';


@Injectable()
export class ApiDataReportService {

  constructor(
    private http: Http,
    private cacheService: CacheService,
    private authService: AuthService
  ) { }

  // Employees report
  getQuarterlyEmployeeFTETotals(employeeID: number, fiscalQuarter: number, fiscalYear: number) {
    return this.http.get(`/api/getQuarterlyEmployeeFTETotals/${employeeID}/${fiscalQuarter}/${fiscalYear}`)
      .timeout(this.cacheService.apiDataTimeout)
      .map((response: Response) => response.json());
  }

  // My FTE Summary report
  getMyFteSummary(employeeID: number, period: string) {
    return this.http.get(`/api/report/getMyFteSummary/${employeeID}/${period}`)
      .timeout(this.cacheService.apiDataTimeout)
      .map((response: Response) => response.json());
  }

  // My Team Summary report
  getSubordinateProjectRoster(managerEmailAddress: string, period: string) {
    const headers = new Headers({'X-Token': this.cacheService.token.signedToken});
    const options = new RequestOptions({headers: headers});
    return this.http.get(`/api/report/getSubordinateProjectRoster/${managerEmailAddress}/${period}`, options)
      .timeout(this.cacheService.apiDataTimeout)
      .map((response: Response) => response.json());
  }

  getSubordinateDrillDownProjectRoster(excludeParentType: string, managerEmailAddress: string, period: string) {
    const headers = new Headers({'X-Token': this.cacheService.token.signedToken});
    const options = new RequestOptions({headers: headers});
    return this.http.get(`/api/report/getSubordinateDrillDownProjectRoster/${excludeParentType}/${managerEmailAddress}/${period}`, options)
      .timeout(this.cacheService.apiDataTimeout)
      .map((response: Response) => response.json());
  }

  getSubordinateFtes(managerEmailAddress: string, period: string) {
    return this.http.get(`/api/report/getSubordinateFtes/${managerEmailAddress}/${period}`)
      .timeout(this.cacheService.apiDataTimeout)
      .map((response: Response) => response.json());
  }

  getSubordinateDrillDownFtes(managerEmailAddress: string, period: string) {
    return this.http.get(`/api/report/getSubordinateDrillDownFtes/${managerEmailAddress}/${period}`)
      .timeout(this.cacheService.apiDataTimeout)
      .map((response: Response) => response.json());
  }

  // Top Projects report
  getTopFTEProjectList() {
    const headers = new Headers({'X-Token': this.cacheService.token.signedToken});
    const options = new RequestOptions({headers: headers});
    return this.http.get(`/api/report/reports-topProjects/show/getTopFTEProjectList`, options)
      .timeout(this.cacheService.apiDataTimeout)
      .map((response: Response) => response.json());
  }

  getProjectFTEHistory(projectID: number, dateFrom: string, dateTo: string) {
    return this.http.get(`/api/report/getProjectFTEHistory/${projectID}/${dateFrom}/${dateTo}`)
      .timeout(this.cacheService.apiDataTimeout)
      .map((response: Response) => response.json());
  }

  getProjectEmployeeFTEList(projectID: number, fiscalDate: string) {
    return this.http.get(`/api/report/getProjectEmployeeFTEList/${projectID}/${fiscalDate}`)
      .timeout(this.cacheService.apiDataTimeout)
      .map((response: Response) => response.json());
  }

  // Top Projects Bubble report
  getAggregatedFteData() {
    const headers = new Headers({'X-Token': this.cacheService.token.signedToken});
    const options = new RequestOptions({headers: headers});
    return this.http.get(`/api/report/reports-topProjectsBubble/show/getAggregatedFteData/`, options)
      .timeout(this.cacheService.apiDataTimeout)
      .map((response: Response) => response.json());
  }

  getProjectFTERollupData(projectID: number, startDate: string, endDate: string) {
    const headers = new Headers({'X-Token': this.cacheService.token.signedToken});
    const options = new RequestOptions({headers: headers});
    return this.http.get(`/api/report/reports-project-fte-rollup/show/getProjectFTERollupData/
      ${projectID}/${startDate}/${endDate}/`, options)
      .timeout(this.cacheService.apiDataTimeout)
      .map((response: Response) => response.json());
  }


}
