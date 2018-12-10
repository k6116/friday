import { Injectable } from '@angular/core';
import { ApiDataProjectService } from '../../../_shared/services/api-data/_index';
import { ApiDataAdvancedFilterService } from '../../../_shared/services/api-data/_index';
import { CacheService } from '../../../_shared/services/cache.service';

declare var $: any;
@Injectable()
export class AdvancedFiltersProjectSearchService {

  constructor(
    private apiDataProjectService: ApiDataProjectService,
    private apiDataAdvancedFilterService: ApiDataAdvancedFilterService,
    private cacheService: CacheService
  ) { }

  onSearch(that: any, fuzzyFilterList: any) {

    // extract the chipIds to put them into filterObject.ProjectID
    const fuzzyFilterString = [];
    for (let i = 0; i < fuzzyFilterList.length; i++) {
      fuzzyFilterString.push(fuzzyFilterList[i].ProjectID);
    }

    // save fuzzy-search string into filterObject
    that.filterObject.ProjectID = String(fuzzyFilterString);

  }

  onClear(that: any) {

    // clear the filter string
    that.filterString = undefined;

    // clear parent-child
    that.parents = [];
    that.children = [];
    $('#parentProjects').removeClass('show');
    $('#childProjects').removeClass('show');

    // reset the focus on the filter input
    that.filterStringVC.nativeElement.focus();

    // save search term into filterObject
    that.filterObject.ProjectName = '';
    that.filterObject.ProjectID = '';

    // Make the db call
    that.advancedFiltersDataService.advancedFilter(that, that.filterObject);
  }

}
