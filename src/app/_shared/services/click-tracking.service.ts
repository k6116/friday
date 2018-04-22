import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { ApiDataService } from '../../_shared/services/api-data.service';
import { AuthService } from '../../auth/auth.service';


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
    }


  }

  logClickWithEvent() {
    // using event handlers to log report searches with text
    // or other more complex scenarios where the data-clicktrack attribute can't be used
  }

}
