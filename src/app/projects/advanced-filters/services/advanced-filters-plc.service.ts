import { Injectable } from '@angular/core';
import { ApiDataProjectService } from '../../../_shared/services/api-data/_index';
import { ApiDataAdvancedFilterService } from '../../../_shared/services/api-data/_index';
import { CacheService } from '../../../_shared/services/cache.service';

@Injectable()
export class AdvancedFiltersPLCService {

  constructor(
    private apiDataProjectService: ApiDataProjectService,
    private apiDataAdvancedFilterService: ApiDataAdvancedFilterService,
    private cacheService: CacheService
  ) { }


  async onClick(that, checked: boolean) {
    // add or remove to local array depending on the checkbox state
    if (checked === true) {

      // Add checked PLC Status
      that.objPLC.push(that.newPLC);

    } else {

      // find the right object to delete by comparing their index
      for (let i = 0; i < that.objPLC.length; i++) {
        if (that.objPLC[i].index === that.newPLC.index) {

          // remove from array
          that.objPLC.splice(i, 1);

          break;
        }
      }

    }

    await this.getScheduleString(that);

    // Make db call
    that.advancedFiltersDataService.advancedFilter(that, that.filterObject);
  }

  onInputChange(that: any, event: any, index: number) {
    const date = event.target.value; // input date
    const id = event.target.id; // either plcFrom or plcTo

    // loop through objPLC to save input value
    for (let i = 0; i < that.objPLC.length; i++) {

      if (that.objPLC[i].index === index && id === 'plcFrom') {

        if (date !== '') {
          that.objPLC[i].PLCDateFrom = date;
        } else { // on clear input click
          that.objPLC[i].PLCDateFrom = 'NULL';
        }

      }

      if (that.objPLC[i].index === index && id === 'plcTo') {

        if (date !== '') {
          that.objPLC[i].PLCDateTo = date;
        } else { // on clear input click
          that.objPLC[i].PLCDateTo = 'NULL';
        }

      }

    }

    this.getScheduleString(that);

  }

  getScheduleString(that: any) {
    const arrID = [];
    const arrFromDate = [];

    // organize the data in buckets in order to convert each array into strings
    for (let i = 0; i < that.objPLC.length; i++) {
      arrID.splice(0, 0, that.objPLC[i].PLCStatusID);
      arrFromDate.splice(0, 0, that.objPLC[i].PLCDateFrom + '|' + that.objPLC[i].PLCDateTo);
    }

    // save strings into the db object
    that.filterObject.PLCStatusIDs = String(arrID);
    that.filterObject.PLCDateRanges = String(arrFromDate);
  }

}
