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

    // get the element into a jQuery object
    const $el = $(event.target);

    // get the data from the attribute
    const clickTrack = $el.closest('[data-clicktrack]').data('clicktrack');

    // if any data was found
    if (clickTrack) {

      // get the user id
      const userID = this.authService.loggedInUser ? this.authService.loggedInUser.id : null;

      // get the url path
      const path = this.router.url;

      // build an object that will be inserted into the table
      const clickObj = {
        clickedDateTime: moment(),
        employeeID: userID,
        page: null,
        path: path,
        clickedOn: null,
        text: null
      };

      // replace the page, clickedOn, and text property values if found in the attribute string
      let error = false;
      const clickTrackArr = clickTrack.split(',');
      clickTrackArr.forEach(obj => {
        const objArr = obj.split(':');
        const propName = objArr[0].trim();
        if (clickObj.hasOwnProperty(propName)) {
          clickObj[propName] = objArr[1].trim();
        } else {
          error = true;
          console.error('improper format for click tracking attribute');
        }
      });

      if (!error) {
        this.apiDataService.logClick(clickObj, userID)
        .subscribe(
          res => {
            console.log(res);
          },
          err => {
            console.log(err);
          }
        );
      }
    }


  }

  logClickWithEvent() {
    // using event handlers to log report searches with text
    // or other more complex scenarios where the data-clicktrack attribute can't be used
  }

}
