import { Injectable } from '@angular/core';
import { Http, Headers, Response, RequestOptions, ResponseContentType } from '@angular/http';
import { AppDataService } from '../app-data.service';

@Injectable()
export class ApiDataReportService {

  constructor(
    private http: Http,
    private appDataService: AppDataService
  ) { }

  // Employees report
  getQuarterlyEmployeeFTETotals(employeeID: number, fiscalQuarter: number, fiscalYear: number) {
    return this.http.get(`/api/getQuarterlyEmployeeFTETotals/${employeeID}/${fiscalQuarter}/${fiscalYear}`)
      .timeout(this.appDataService.apiDataTimeout)
      .map((response: Response) => response.json());
  }

  // My FTE Summary report
  getMyFteSummary(employeeID: number, period: string) {
    return this.http.get(`/api/reports/myFteSummary/${employeeID}/${period}`)
      .timeout(this.appDataService.apiDataTimeout)
      .map((response: Response) => response.json());
  }

  // My Team Summary report
  getSubordinateProjectRoster(managerEmailAddress: string, period: string) {
    return this.http.get(`/api/reports/subordinateProjectRoster/${managerEmailAddress}/${period}`)
      .timeout(this.appDataService.apiDataTimeout)
      .map((response: Response) => response.json());
  }

  // Top Projects report
  getTopFTEProjectList() {
    return this.http.get(`/api/reports/getTopFTEProjectList/`)
      .timeout(this.appDataService.apiDataTimeout)
      .map((response: Response) => response.json());
  }

  getProjectFTEHistory(projectID: number) {
    return this.http.get(`/api/reports/getProjectFTEHistory/${projectID}`)
      .timeout(this.appDataService.apiDataTimeout)
      .map((response: Response) => response.json());
  }

  getProjectEmployeeFTEList(projectID: number, fiscalDate: string) {
    return this.http.get(`/api/reports/getProjectEmployeeFTEList/${projectID}/${fiscalDate}`)
      .timeout(this.appDataService.apiDataTimeout)
      .map((response: Response) => response.json());
  }

  // Top Projects Bubble report
  getAggregatedFteData() {
    return this.http.get(`/api/reports/aggregatedFteData/`)
      .timeout(this.appDataService.apiDataTimeout)
      .map((response: Response) => response.json());
  }
}
