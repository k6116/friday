import { Injectable } from '@angular/core';
import { ApiDataProjectService } from '../../../_shared/services/api-data/_index';

@Injectable()
export class AdvancedFiltersDataService {

  constructor(
    private apiDataProjectService: ApiDataProjectService
  ) { }


  // get a list of all the projects (index) from the database for the dropdown/typeahead input control
  getTypeaheadData(): Promise<any> {

    return this.apiDataProjectService.getProjectsList().toPromise();

  }

}
