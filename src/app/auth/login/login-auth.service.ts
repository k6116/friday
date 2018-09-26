import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { ApiDataAuthService, ApiDataOrgService } from '../../_shared/services/api-data/_index';
import { AuthService } from '../../_shared/services/auth.service';
import { User } from '../../_shared/models/user.model';
import { CacheService } from '../../_shared/services/cache.service';
import { WebsocketService } from '../../_shared/services/websocket.service';
import { LoginCookiesService } from './login-cookies.service';


interface IUser {
  userName: string;
  password: string;
  rememberMe: boolean;
}

@Injectable()
export class LoginAuthService {


  constructor(
    private router: Router,
    private apiDataAuthService: ApiDataAuthService,
    private apiDataOrgService: ApiDataOrgService,
    private authService: AuthService,
    public cacheService: CacheService,
    private websocketService: WebsocketService,
    private loginCookiesService: LoginCookiesService
  ) { }


  async getAuthResponse(user: IUser): Promise<any> {

    return await this.apiDataAuthService.authenticate(user).toPromise();

  }


  async authenticate(user: IUser): Promise<any> {

    let authResponse: any;

    await this.getAuthResponse(user)
    .then(res => {
      authResponse = res;
    })
    .catch(err => {
      authResponse = err;
    });

    // console.log(authResponse.text());

    if (authResponse.status === 500) {
      return {
        response: undefined,
        error: authResponse.text(),
        status: authResponse.status
      };
    }

    console.log('auth response:');
    console.log(authResponse);

    // set or clear the username cookie depending on whether remember me is selected
    this.loginCookiesService.setCookie(user.rememberMe, user.userName);

    // store the logged in user in the auth service
    this.authService.loggedInUser = new User().deserialize(authResponse.jarvisUser);

    // store the jwt token in the cache service
    this.cacheService.token = authResponse.token;

    // store the jwt token in local storage
    localStorage.setItem('jarvisToken', authResponse.token.signedToken);
    // sessionStorage.setItem('jarvisToken', res.token.signedToken);

    // set logged in to true in the auth service (loggedIn property)
    this.authService.setLoggedIn(true);

    // reset the timer so that it will be synched with the token expiration, at least within a second or two
    this.cacheService.resetTimer.emit(true);

    // clear the autologout object
    this.cacheService.autoLogout$ = undefined;

    // get and store nested org data for this user, in anticipation of use and for performance
    this.getNestedOrgData(authResponse.jarvisUser.email);
    // this.getNestedOrgData('ethan_hunt@keysight.com');

    // hide the animated svg
    // this.showPendingLoginAnimation = false;

    // route to the main page or the page that the user was attempting to go to before getting booted back to the login page
    if (this.cacheService.appLoadPath) {
      this.router.navigateByUrl(this.cacheService.appLoadPath);
    } else {
      this.router.navigateByUrl('/main/dashboard');
    }

    // send the logged in user object to all other clients via websocket
    this.websocketService.sendLoggedInUser(this.authService.loggedInUser);

    console.log({
      response: authResponse,
      error: undefined,
      status: authResponse.status
    });

    return {
      response: authResponse,
      error: undefined,
      status: authResponse.status
    };


    // hide the animated svg
    // this.showPendingLoginAnimation = false;

    // display the appropriate message depending on the type of error (timeout, invalid credentials, etc.)
    // this.handleErrorMessage(err);

  }


  // get and store the nested org data upon successfull login
  getNestedOrgData(email: string) {
    this.cacheService.nestedOrgDataRequested = true;
    this.apiDataOrgService.getOrgData(email)
    .subscribe(
      res => {
        const nestedOrgData = JSON.parse('[' + res[0].json + ']');
        this.cacheService.$nestedOrgData = nestedOrgData;
        this.cacheService.nestedOrgData.emit(nestedOrgData);
      },
      err => {
        console.error('error getting nested org data');
      }
    );
  }


}
