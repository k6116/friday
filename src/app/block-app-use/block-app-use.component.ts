import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CacheService } from '../_shared/services/cache.service';

import * as bowser from 'bowser';

@Component({
  selector: 'app-block-app-use',
  templateUrl: './block-app-use.component.html',
  styleUrls: ['./block-app-use.component.css']
})
export class BlockAppUseComponent implements OnInit, AfterViewInit {

  constructor(
    private cacheService: CacheService
  ) { }

  ngOnInit() {

    // open the notice modal
    // NOTE: using setTimeout here to avoid 'ExpressionChangedAfterItHasBeenCheckedError'
    setTimeout(() => {
      this.openNoticeModal();
    }, 0);

  }

  ngAfterViewInit() {

  }


  openNoticeModal() {

    // emit an object to be picked up by the notice modal via subscription
    this.cacheService.noticeModalData.emit(
      {
        title: 'Browser Not Supported',
        message: `Jarvis Resources will not work with ${bowser.name} version ${bowser.version}.  Please
         use Google Chrome v65.0+, Mozilla Firefox v60.0+, or Microsoft Edge v15.0+.`,
        iconClass: 'fa-exclamation-triangle',
        iconColor: 'rgb(197, 50, 76)',
        display: true
      }
    );

  }

}
