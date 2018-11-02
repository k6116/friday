import { Injectable } from '@angular/core';

import { CacheService } from './cache.service';

import * as Highcharts from 'highcharts';


@Injectable()
export class HighchartsExtensionsService {


  constructor(
    private cacheService: CacheService
  ) {

    console.log('highcharts extension service constructed');

  }



  // unsetDrillUpFunction() {

  //   (function(H: any) {
  //     console.log('JUST BEFORE DRILLUP FUNCTION UNINIT');
  //     H.unwrap(H.seriesTypes.treemap.prototype, 'drillUp', function(proceed) {
  //       console.log('drillup extension has been uninitialized');
  //       proceed.apply(this);
  //     });
  //   })(Highcharts);

  // }




  setDrillUpFunction(func: any) {


    (function(H: any) {
      console.log('JUST BEFORE DRILLUP FUNCTION');
      H.wrap(H.seriesTypes.treemap.prototype, 'drillUp', func);
    })(Highcharts);


    this.cacheService.setDrillUpFunctionAdded = true;


  }


}
