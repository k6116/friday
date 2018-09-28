import { Injectable } from '@angular/core';
import { CookiesService } from '../../../_shared/services/cookies.service';

export interface ICookie {
  userName: string;
  rememberMe: boolean;
}

@Injectable()
export class LoginCookiesService {

  constructor(
    private cookiesService: CookiesService
  ) { }

  // set or delete the cookie depending on whether the 'Remember Me' checkbox is checked
  setRememberMeCookie(rememberMe: boolean, userName: string) {
    if (rememberMe) {
      // set the cookie value with the user's user name (to auto populate next time the login page is loaded)
      // set the expiration date to 365 days / 1 year from now
      this.cookiesService.setCookie('jrt_username', userName, 365);
    } else {
      // delete the cookie if 'Remember Me' is not checked
      this.cookiesService.deleteCookie('jrt_username');
    }
  }

  // attempt to get the cookie
  getRememberMeCookie(): ICookie {
    // cookiesService.getCookie will return the Value in the cookie
    const userName = this.cookiesService.getCookie('jrt_username');
    // if the jrt_username cookie is there, return an object with the user's user name and remmber me set to true
    // the login component html will use two way binding to set the user name and rembmer me controls
    if (userName) {
      return {
        userName: userName,
        rememberMe: true
      };
    // otherwise return user name as undefined and remember me set to false
    } else {
      return {
        userName: undefined,
        rememberMe: false
      };
    }
  }

}
