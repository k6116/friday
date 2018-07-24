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
    return this.http.get(`/api/report/getSubordinateProjectRoster/${managerEmailAddress}/${period}`)
      .timeout(this.cacheService.apiDataTimeout)
      .map((response: Response) => response.json());
  }

  getSubordinateFtes(managerEmailAddress: string, period: string) {
    return this.http.get(`/api/report/getSubordinateFtes/${managerEmailAddress}/${period}`)
      .timeout(this.cacheService.apiDataTimeout)
      .map((response: Response) => response.json());
  }

  // Top Projects report
  getTopFTEProjectList() {
    return this.http.get(`/api/report/reports-topProjects/show/getTopFTEProjectList/`)
      .timeout(this.cacheService.apiDataTimeout)
      .map((response: Response) => response.json());
  }

  getProjectFTEHistory(projectID: number) {
    return this.http.get(`/api/report/getProjectFTEHistory/${projectID}`)
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
    const headers = new Headers({'X-JWT': this.authService.token.signedToken});
    const options = new RequestOptions({headers: headers});
    return this.http.get(`/api/report/reports-topProjectsBubble/show/getAggregatedFteData/`, options)
      .timeout(this.cacheService.apiDataTimeout)
      .map((response: Response) => response.json());
  }


}
