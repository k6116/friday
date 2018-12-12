import { Injectable } from '@angular/core';
// import { ApiDataProjectService } from '../../../_shared/services/api-data/_index';
// import { ApiDataAdvancedFilterService } from '../../../_shared/services/api-data/_index';
// import { CacheService } from '../../../_shared/services/cache.service';

const moment = require('moment');

declare const require: any;

@Injectable()
export class AdvancedFiltersFTEService {

  constructor(
    // private apiDataProjectService: ApiDataProjectService,
    // private apiDataAdvancedFilterService: ApiDataAdvancedFilterService,
    // private cacheService: CacheService
  ) { }

  fteToggle(that: any, id: any) {

    const currentMonth = Number(moment().format('M'));

    switch (id) {
      case 'all':
        // this.filterObject.FTEDateFrom = '01/01/1900';
        that.filterObject.FTEDateFrom = 'NULL';
        that.filterObject.FTEDateTo = 'NULL';
        break;

      case 'month':
        const firstDayOfMonth0 = moment().format('MM/01/YYYY');   // First day of current month
        const firstDayOfMonth1 = moment(firstDayOfMonth0).add(1, 'month').format('MM/01/YYYY');   // First day of following month

        that.filterObject.FTEDateFrom = String(firstDayOfMonth0);
        that.filterObject.FTEDateTo = String(firstDayOfMonth1);
        break;

      case 'qtr':
        let qtr0; // Beginning of CURRENT quarter
        let qtr1; // Begiining of FOLLOWING quarter

        // Determining beginning of the quarter
        if (currentMonth === 11 || currentMonth === 12 || currentMonth === 1) {
          qtr0 = moment().format('11/01/YYYY');
        } else if (currentMonth === 2 || currentMonth === 3 || currentMonth === 4) {
          qtr0 = moment().format('01/01/YYYY');
        } else if (currentMonth === 5 || currentMonth === 6 || currentMonth === 7) {
          qtr0 = moment().format('05/01/YYYY');
        } else if (currentMonth === 8 || currentMonth === 9 || currentMonth === 10) {
          qtr0 = moment().format('08/01/YYYY');
        }

        qtr1 = moment(qtr0).add(3, 'month').format('MM/01/YYYY');

        that.filterObject.FTEDateFrom = String(qtr0);
        that.filterObject.FTEDateTo = String(qtr1);

        break;

      case 'year':
        let fiscalYear0;         // Beginning of fiscal year; 11/01/YYYY
        let fiscalYear1;         // End of fiscal Year; 11/01/YYYY + 1year

        if (currentMonth === 11 || currentMonth === 12) {

          fiscalYear0 = moment().format('11/01/YYYY'); // first day of CURRENT fiscal year
          fiscalYear1 = moment(fiscalYear0).add(1, 'year').format('11/01/YYYY'); // first day of FOLLOWING fiscal year

        } else {

          fiscalYear1 = moment().format('11/01/YYYY');  // first day of FOLLOWING fiscal year
          fiscalYear0 = moment(fiscalYear1).subtract(1, 'year').format('01/01/YYYY'); // first day of CURRENT fiscal year

        }

        that.filterObject.FTEDateFrom = String(fiscalYear0);
        that.filterObject.FTEDateTo = String(fiscalYear1);

        break;
    }

    that.fteDateFrom = moment(that.filterObject.FTEDateFrom).format('YYYY-MM-DD');
    that.fteDateTo = moment(that.filterObject.FTEDateTo).format('YYYY-MM-DD');
  }

  onInputFTEChange(that: any, event: any) {
    const date = event.target.value; // input date
    const id = event.target.id; // either fteFrom or fteTo
    switch (id) {
      case 'fteFrom':
        that.filterObject.FTEDateFrom = String(date);
        break;
       case 'fteTo':
        that.filterObject.FTEDateTo = String(date);
        break;
    }
  }

  // BUTTON IS HIDDEN
  // onFTETotalGoClick(minValue: any, maxValue: any) {

  //   if (minValue === '') {
  //     this.filterObject.FTEMin = String('NULL');
  //   } else {
  //     this.filterObject.FTEMin = String(minValue);
  //   }

  //   if (maxValue === '') {
  //   this.filterObject.FTEMax = String('NULL');
  //   } else {
  //     this.filterObject.FTEMax = String(maxValue);
  //   }

  //   // Make the db call
  //   this.advancedFiltersDataService.advancedFilter(this, this.filterObject);

  // }
}
