import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { ApiDataService } from '../../_shared/services/api-data.service';
import { AuthService } from '../../auth/auth.service';

import * as moment from 'moment';
import * as bowser from 'bowser';
declare var $: any;

@Injectable()
export class ClickTrackingService {

  constructor(
    private router: Router,
    private apiDataService: ApiDataService,
    private authService: AuthService
  ) { }


  logClickWithEvent(clickTrack: string) {
    this.logClick(clickTrack);
  }


  logClickWithAttribute(event: Event) {

    // get the element into a jQuery object
    const $el = $(event.target);

    // get the data from the attribute
    const clickTrack = $el.closest('[data-clicktrack]').data('clicktrack');

    // if any data was found
    if (clickTrack) {
      this.logClick(clickTrack);
    }

  }


  logClick(clickTrack: string) {

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
      clickedOnSub: null,
      text: null,
      browser: bowser.name,
      browserVersion: bowser.version,
      os: bowser.osname,
      osVersion: bowser.osversion
    };

    // replace the page, clickedOn, and text property values if found in the attribute string
    let error = false;
    const clickTrackArr = clickTrack.split(',');
    clickTrackArr.forEach(obj => {
      const objArr = obj.split(':');
      const propName = objArr[0].trim();
      // if the propname from the html custom attribute matches a property in the object, update the property value
      if (clickObj.hasOwnProperty(propName)) {
        clickObj[propName] = objArr[1].trim();
      // if it is not found, log an error message and don't log to the database
      } else {
        error = true;
        console.error('improper format for click tracking attribute');
      }
    });

    // log warnings if certain required properties are null (but still log to database)
    for (const key in clickObj) {
      if (clickObj.hasOwnProperty(key)) {
        if (!clickObj[key] && (key === 'page' || key === 'clickedOn')) {
          console.warn(`click tracking missing required property ${key}`);
        }
      }
    }

    // if the object looks good, send the data to the database to insert
    if (!error) {
      this.apiDataService.logClick(clickObj, userID)
      .subscribe(
        res => {
          // console.log(res);  // click tracking record was inserted successfully
        },
        err => {
          console.error(err);
        }
      );
    }

  }

}
