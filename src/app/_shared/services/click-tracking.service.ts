import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { ApiDataService } from '../../_shared/services/api-data.service';
import { AuthService } from '../../auth/auth.service';

import * as moment from 'moment';
declare var $: any;

@Injectable()
export class ClickTrackingService {

  constructor(
    private router: Router,
    private apiDataService: ApiDataService,
    private authService: AuthService
  ) { }

  logClickWithAttribute(event) {
    // console.log('log click fired');
    // console.log(event);
    // get the element into a jQuery object
    const $el = $(event.target);
    // get the data from the attribute
    const clickTrack = $el.closest('[data-clicktrack]').data('clicktrack');
    console.log(clickTrack);
    // if any data was found, get the path and user id
    if (clickTrack) {
      const userID = this.authService.loggedInUser.id;
      console.log(userID);
      const path = this.router.url;
      console.log(path);

      const clickObj = {
        clickedDateTime: moment(),
        employeeID: userID,
        page: null,
        path: path,
        clickedOn: clickTrack,
        text: null
      };

      const clickTrackArr = clickTrack.split(',');
      clickTrackArr.forEach(obj => {
        const objArr = obj.split(':');
        const propName = objArr[0].trim();
        clickObj[propName] = objArr[1].trim();
      });

      console.log('click tracking object to insert:');
      console.log(clickObj);


      this.apiDataService.logClick(clickObj, userID)
      .subscribe(
        res => {
          console.log(res);
          console.log('log click successfull');
        },
        err => {
          console.log(err);
          console.log('log click failed');
        }
      );

    }


  }

  logClickWithEvent() {
    // using event handlers to log report searches with text
    // or other more complex scenarios where the data-clicktrack attribute can't be used
  }

}
