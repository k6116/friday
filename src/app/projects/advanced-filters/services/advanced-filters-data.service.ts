import { Injectable } from '@angular/core';
import { ApiDataProjectService } from '../../../_shared/services/api-data/_index';
import { ApiDataAdvancedFilterService } from '../../../_shared/services/api-data/_index';
import { CacheService } from '../../../_shared/services/cache.service';

@Injectable()
export class AdvancedFiltersDataService {

  constructor(
    private apiDataProjectService: ApiDataProjectService,
    private apiDataAdvancedFilterService: ApiDataAdvancedFilterService,
    private cacheService: CacheService
  ) { }

  // MAIN DATABASE CALL
  async advancedFilter(that, filterOptions: any) {

    // Show spinner until all data is ready
    that.showSpinner = true;

    // Call api data service
    const advancedFilteredResultsObj = await this.apiDataAdvancedFilterService.getAdvancedFilteredResults(filterOptions).toPromise();

    // Save filterOptions in Cache
    this.cacheService.advancedSearchFilterOption = filterOptions;

    // nest Schedules in results object
    advancedFilteredResultsObj.nested.forEach( project => {
      const schedules = [];
      if ('Schedules' in project) {

        Object.keys(project.Schedules).forEach(function(key) {
          schedules.push({
            PLCStatusName: key,
            PLCDate: project.Schedules[key]
          });
        });
        project.Schedules = schedules;
      }
    });

    that.advancedFilteredResultsFlat = advancedFilteredResultsObj.flat;       // Flat file is needed for excel download
    that.advancedFilteredResults = advancedFilteredResultsObj.nested;         // Nested files is the MAIN RESULTS files

    // For PLC status headers:
    if (that.advancedFilteredResults.length !== 0) {
      // save only checked statuses to be displayed in results table header
      that.plcSchedules = that.advancedFilteredResults[0].Schedules;
    } else {
      that.plcSchedules = [];
    }

    // Hide spinner and show table
    that.showSpinner = false;
    // this.showResults = true;

    // store the number of projects, to display in the page 'showing x of y projects'
    that.filteredProjectsCount = that.advancedFilteredResults.length;

    // set/update the record count string (Showing X of Y Projects) -> happening in advanced filter?
    that.setNumProjectsDisplayString();

  }

  // get a list of all the projects (index) from the database for the dropdown/typeahead input control
  getTypeaheadData(): Promise<any> {

    return this.apiDataProjectService.getProjectsList().toPromise();

  }

  async getCheckboxData(that: any) {

    // get ALL FILTERS for the page using forkjoin
    const advancedFilterData = await this.getAdvancedFilterData()
    .catch(err => {
      // console.log(err);
    });
    // seperate out for html
    // TO-DO CHAI: Remove [0] since that's been called seperatly
    // this.projects = advancedFilterData[0];
    that.projectTypes = advancedFilterData[1];
    that.projectStatuses = advancedFilterData[2];
    that.projectPriorities = advancedFilterData[3];
    that.plcStatuses = advancedFilterData[4];

    // this.advancedFiltersTypeaheadService.getProjectsTypeahead(this, this.projects);

  }

  getAdvancedFilterData(): Promise<any> {
    return this.apiDataAdvancedFilterService.getAdvancedFilterData().toPromise();
  }

  getProjectChildren(projectID: string): Promise<any> {

    return this.apiDataAdvancedFilterService.getProjectChildren(projectID).toPromise();

  }

  getProjectParents(projectID: string): Promise<any> {

    return this.apiDataAdvancedFilterService.getProjectParents(projectID).toPromise();

  }

}
