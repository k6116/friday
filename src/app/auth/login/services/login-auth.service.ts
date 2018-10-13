import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { ApiDataAuthService, ApiDataOrgService } from '../../../_shared/services/api-data/_index';
import { AuthService } from '../../../_shared/services/auth.service';
import { User } from '../../../_shared/models/user.model';
import { CacheService } from '../../../_shared/services/cache.service';
import { WebsocketService } from '../../../_shared/services/websocket.service';
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


  // make the api call and get the authentication response
  // either 200 status with jarvis user data, ldap data, and jwt token, or 401 unauthorized status with error
  getAuthResponse(user: IUser): Promise<any> {

    return this.apiDataAuthService.authenticate(user).toPromise();

  }

  // method to be called from the component, to either return an error object or proceed to login
  async authenticate(user: IUser): Promise<any> {

    let authResponse: any;

    // get the auth response synchronously
    await this.getAuthResponse(user)
    .then(res => {
      authResponse = res;
    })
    .catch(err => {
      console.log(err);
      authResponse = err;
    });

    // if the status is anything other than 200 / ok, return an object with the error property populated with the response
    if (authResponse.status !== 200) {
      return {
        response: undefined,
        error: authResponse,
        status: authResponse.status
      };
    }

    // set or clear the username cookie depending on whether remember me is selected
    this.loginCookiesService.setRememberMeCookie(user.rememberMe, user.userName);

    // store the logged in user in the auth service
    this.authService.loggedInUser = new User().deserialize(authResponse.jarvisUser);

    // store the jwt token in local storage
    localStorage.setItem('jarvisToken', authResponse.token.signedToken);
    // sessionStorage.setItem('jarvisToken', res.token.signedToken);

    // set logged in to true in the auth service (loggedIn property)
    this.authService.setLoggedIn(true);

    // store the auth response in the cache
    this.updateCache(authResponse);

    // get and store nested org data for this user, in anticipation of use in other components (performance reasons)
    this.getNestedOrgData(authResponse.jarvisUser.email);
    // this.getNestedOrgData('ethan_hunt@keysight.com');

    // send the logged in user object to all other clients via websocket
    this.websocketService.sendLoggedInUser(this.authService.loggedInUser);

    // route to the dashboard page,
    // or the page that the user was attempting to go to before getting sent back to the login page (deep linking)
    this.routeToPage();

    // return the auth response with no error and 200 ok status
    return {
      response: authResponse,
      error: undefined,
      status: authResponse.status
    };

  }

  updateCache(authResponse) {

    // store the jwt token in the cache service
    this.cacheService.token = authResponse.token;

    // reset the timer so that it will be synched with the token expiration, at least within a second or two
    this.cacheService.resetTimer.emit(true);

    // clear the autologout object
    this.cacheService.autoLogout$ = undefined;

  }

  // route to the dashboard page,
  // or the page that the user was attempting to go to before getting booted back to the login page (deep linking)
  routeToPage() {

    if (this.cacheService.appLoadPath) {
      this.router.navigateByUrl(this.cacheService.appLoadPath);
    } else {
      this.router.navigateByUrl('/main/dashboard');
    }

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
