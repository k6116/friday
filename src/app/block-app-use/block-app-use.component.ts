import { Component, OnInit, AfterViewInit } from '@angular/core';
import { AppDataService } from '../_shared/services/app-data.service';

import * as bowser from 'bowser';

@Component({
  selector: 'app-block-app-use',
  templateUrl: './block-app-use.component.html',
  styleUrls: ['./block-app-use.component.css']
})
export class BlockAppUseComponent implements OnInit, AfterViewInit {

  constructor(
    private appDataService: AppDataService
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
    this.appDataService.noticeModalData.emit(
      {
        title: 'Browser Not Supported',
        message: `Jarvis Resoruces will not work with ${bowser.name} version ${bowser.version}.  Please
         use Google Chrome version 65.0 or later.`,
        iconClass: 'fa-exclamation-triangle',
        iconColor: 'rgb(197, 50, 76)',
        display: true
      }
    );

  }

}
