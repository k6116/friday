import { Injectable } from '@angular/core';
import { ToolsService } from '../../../_shared/services/tools.service';
import { ApiDataReportService, ApiDataProjectService } from '../../../_shared/services/api-data/_index';

import * as moment from 'moment';


@Injectable()
export class ProjectFteRollupDataService {

  constructor(
    private toolsService: ToolsService,
    private apiDataReportService: ApiDataReportService,
    private apiDataProjectService: ApiDataProjectService
  ) { }


  // get a list of all the projects (index) from the database for the dropdown/typeahead input control
  getTypeaheadData(): Promise<any> {

    return this.apiDataProjectService.getProjectsList().toPromise();

  }

  // get the raw chart data from the database, in a flat BOM format
  getBOMData(projectID: number): Promise<any> {

    // get the current fiscal quarter range as an array of two strings, to pass to the api
    const fiscalQuarterRange = this.toolsService.fiscalQuarterRange(moment(), 'MM-DD-YYYY');

    // return the data
    return this.apiDataReportService.getProjectFTERollupData(projectID, fiscalQuarterRange[0], fiscalQuarterRange[1]).toPromise();

  }

}
