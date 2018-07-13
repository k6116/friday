import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { ApiDataClickTrackingService } from '../../_shared/services/api-data/_index';
import { AuthService } from '../../_shared/services/auth.service';

import * as moment from 'moment';
import * as bowser from 'bowser';
declare var $: any;

@Injectable()
export class ClickTrackingService {

  constructor(
    private router: Router,
    private apiDataClickTrackingService: ApiDataClickTrackingService,
    private authService: AuthService
  ) { }



  // usage: two options:
  // 1. add a custom attribute named data-clicktrack to the element that you want to track a click for, such as a button, div, etc.
  // it should specify the page, clicked on element, and text if any.  variables can be mixed in.  examples:
  // [attr.data-clicktrack]="'page: Login, clickedOn: Login Button, text: ' + userName"
  // [attr.data-clicktrack]="'page: Main, clickedOn: Menu Item > ' + menu.title + ' > ' + subMenu.title"
  // for divs, always apply the attribute to the outermost element, since an inner element such as an icon or text might actually be clicked
  // 2. if the custom attribute cannot be used for whatever reason and it must be triggered from the code (typescript),
  // you can use the logClickWithEvent method; passing the string in the same format
  // with page, clickedOn, and text (optional).  example:
  // this.clickTrackingService.logClickWithEvent(`page: Login, clickedOn: Login Button, text: ${this.userName}`);


  // log the click with the custom data-clicktrack attribute from html
  logClickWithAttribute(event: Event) {

    // get the element into a jQuery object
    const $el = $(event.target);

    // get the data from the attribute.
    // closest is a jQuery method that will traverse up the DOM tree and find the first element
    // that matches the selector, in this case ('[data-clicktrack]'), starting with the element itself
    // this is needed if an inner element such as text or an icon was clicked instead of the element that has the attribute
    const clickTrack = $el.closest('[data-clicktrack]').data('clicktrack');

    // if any data was found, log the click
    if (clickTrack) {
      this.logClick(clickTrack);
    }

  }

  // log the click using the string passed from code
  logClickWithEvent(clickTrack: string) {
    this.logClick(clickTrack);
  }


  logClick(clickTrack: string) {

    // get the user id. ternary is needed here since click tracking is used in the login page
    const userID = this.authService.loggedInUser ? this.authService.loggedInUser.id : null;

    // get the url path
    const path = this.router.url;

    // build an object that will be inserted into the table
    // NOTE: for now, page, clickedOn, and text will be null, and will be updated later with the clickTrack string
    const clickObj = {
      clickedDateTime: moment(),
      employeeID: userID,
      page: null,
      path: path,
      clickedOn: null,
      text: null,
      browser: bowser.name,
      browserVersion: bowser.version,
      os: bowser.osname,
      osVersion: bowser.osversion
    };

    // replace the page, clickedOn, and text property values if found in the attribute string
    let error = false;
    // split the string into an array of key value pairs formatted like key: value
    const clickTrackArr = clickTrack.split(',');
    // for each key value pair such as page, clickedOn, and text (consider these like objects)
    clickTrackArr.forEach(obj => {
      // split the key and value into an array of 2
      const objArr = obj.split(':');
      // get the property
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
      this.apiDataClickTrackingService.logClick(clickObj, userID)
      .subscribe(
        res => {
          // click tracking record was inserted successfully
          console.log(res);
        },
        err => {
          console.error(err);
        }
      );
    }

  }

}
