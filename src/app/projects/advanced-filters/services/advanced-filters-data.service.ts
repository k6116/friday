import { Injectable } from '@angular/core';
import { ApiDataProjectService } from '../../../_shared/services/api-data/_index';
import { ApiDataAdvancedFilterService } from '../../../_shared/services/api-data/_index';


@Injectable()
export class AdvancedFiltersDataService {

  constructor(
    private apiDataProjectService: ApiDataProjectService,
    private apiDataAdvancedFilterService: ApiDataAdvancedFilterService
  ) { }


  // get a list of all the projects (index) from the database for the dropdown/typeahead input control
  getTypeaheadData(): Promise<any> {

    return this.apiDataProjectService.getProjectsList().toPromise();

  }

  getProjectChildren(projectID: string): Promise<any> {

    return this.apiDataAdvancedFilterService.getProjectChildren(projectID).toPromise();

  }

  getProjectParents(projectID: string): Promise<any> {

    return this.apiDataAdvancedFilterService.getProjectParents(projectID).toPromise();

  }

}
