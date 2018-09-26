import { Injectable } from '@angular/core';
import { CookiesService } from '../../_shared/services/cookies.service';

export interface ICookie {
  userName: string;
  rememberMe: boolean;
}

@Injectable()
export class LoginCookiesService {

  constructor(
    private cookiesService: CookiesService
  ) { }


  setCookie(rememberMe: boolean, userName: string) {
    if (rememberMe) {
      this.cookiesService.setCookie('jrt_username', userName, 365);
    } else {
      this.cookiesService.deleteCookie('jrt_username');
    }
  }

  getRememberMeCookie(): ICookie {
    const userName = this.cookiesService.getCookie('jrt_username');
    if (userName) {
      return {
        userName: userName,
        rememberMe: true
      };
    } else {
      return {
        userName: undefined,
        rememberMe: false
      };
    }
  }

}
