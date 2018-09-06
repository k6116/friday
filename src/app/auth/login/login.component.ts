import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import { CacheService } from '../../_shared/services/cache.service';
import { AuthService } from '../../_shared/services/auth.service';
import { ToolsService } from '../../_shared/services/tools.service';
import { ClickTrackingService } from '../../_shared/services/click-tracking.service';
import { User } from '../../_shared/models/user.model';
import { WebsocketService } from '../../_shared/services/websocket.service';
import { CookiesService } from '../../_shared/services/cookies.service';
import { ApiDataAuthService, ApiDataOrgService } from '../../_shared/services/api-data/_index';

declare var $: any;
import * as moment from 'moment';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css', '../../_shared/styles/common.css']
})
export class LoginComponent implements OnInit {

  // view childs are set up for the user name and password inputs so the focus() method can be used
  // tied to #userNameVC and #passwordVC in the html
  @ViewChild('userNameVC') userNameVC: ElementRef;
  @ViewChild('passwordVC') passwordVC: ElementRef;

  // properties used for two way binding, with ngModel
  userName: string;
  password: string;

  // used to delay rendering of the page until background image is ready
  showLoginPage: boolean;

  // properties used for the error message display (invalid login etc.)
  loginMessage: string;
  loginSuccess: boolean;
  showMessage: boolean;
  iconClass: string;
  iconColor: string;

  // toggle slider state
  rememberMe: boolean;

  // spinner display
  showProgressSpinner: boolean;
  showPendingLoginAnimation: boolean;

  // subscriptions
  subscription1: Subscription;

  // array of background images and randomly selected background image
  backgroundImages: any[] = [];
  backgroundImage: any;
  testImagePath: string;
  isImageLoaded: boolean;

  t0: number;
  t1: number;

  // set to true if this is the test instance (port 440)
  isTestInstance: boolean;

  constructor(
    private router: Router,
    // private apiDataService: ApiDataService,
    private cacheService: CacheService,
    private apiDataOrgService: ApiDataOrgService,
    private apiDataAuthService: ApiDataAuthService,
    private authService: AuthService,
    private toolsService: ToolsService,
    private clickTrackingService: ClickTrackingService,
    private websocketService: WebsocketService,
    private cookiesService: CookiesService,
    private route: ActivatedRoute
  ) {

  }

  ngOnInit() {

    this.t0 = performance.now();

    // check the port to see if this is the test instance (dev will return '3000', prod will return '')
    // if this is test, use the 'blue' icon version (_test) and text instead of yellow
    if (location.port === '440') {
      this.isTestInstance = true;
    }

    // check for the autoLogout object; if it exists display the message
    if (this.cacheService.autoLogout$) {
      const autoLogout = this.cacheService.autoLogout$;
      this.displayMessage(autoLogout.message, autoLogout.iconClass, autoLogout.iconColor);
    }

    // get background images from the server to display
    this.getBackgroundImages();

  }


  getBackgroundImages() {

    this.apiDataAuthService.getLoginBackgroundImages()
      .subscribe(
        res => {

          res.images.forEach(image => {
            if (res.files.indexOf(image.fileName) !== -1) {
              this.backgroundImages.push({
                fileName: image.fileName,
                path: `/assets/login_images/${image.fileName}`,
                title: image.caption,
                subTitle: `Key Sightings, ${image.winnerDate}`
              });
            }
          });

          // console.log(`number of background images: ${this.backgroundImages.length}`);

          // set random background image
          this.setBackgroundImage();
        },
        err => {
          // console.log(err);
          this.backgroundImage = this.cacheService.backgroundImage;
        }
      );

  }

  // set random background image
  setBackgroundImage() {
    const imageIndex = this.toolsService.randomBetween(0, this.backgroundImages.length - 1);
    // this.backgroundImage = this.backgroundImages[imageIndex];
    this.backgroundImage = this.backgroundImages[imageIndex];
    // this.showLoginPage = true;
    // save the last shown image in the cache service
    this.cacheService.backgroundImage = this.backgroundImage;
  }


  onImageLoaded() {
    console.log('image has finished loading');
    this.t1 = performance.now();
    console.log(`image took ${this.t1 - this.t0} milliseconds`);
    this.showLoginPage = true;
    this.isImageLoaded = true;

    // check the cookies for the jrt_username cookie, if it is there set the username
    // this means that the user had previously logged in with 'Remember Me' selected
    this.checkRememberMeCookie();

  }

  // check for the jrt_username cookie; if it exists set the username in the input (uses two-way binding)
  checkRememberMeCookie() {
    const userName = this.cookiesService.getCookie('jrt_username');
    if (userName) {
      this.userName = userName;
      this.rememberMe = true;
    } else {
    }
    setTimeout(() => {
      this.setInputFocus(userName ? true : false);
    }, 0);
  }

  // set focus on either the username or password input depending on whether username is populated from the cookie
  setInputFocus(hasUserName: boolean) {
    if (hasUserName) {
      this.passwordVC.nativeElement.focus();
    } else {
      this.userNameVC.nativeElement.focus();
    }
  }

  onLoginKeyEnter() {
    this.clickTrackingService.logClickWithEvent(`page: Login, clickedOn: Login Button, text: ${this.userName}`);
    this.onLoginClick();
  }



  onLoginClick() {

    // reset and hide the error message if any is already displayed
    this.resetErrorMessage();

    // check for form entry errors (missing user name or password)
    if (this.hasFormEntryErrors()) {
      this.displayFormEntryErrors();
      return;
    }

    // construct a user/login object that will be passed in the request body
    const user = {
      userName: this.userName,
      password: this.password
    };

    // start timer for authentication time
    const t0 = performance.now();

    // show the animated svg
    this.showPendingLoginAnimation = true;

    // call the api data service to authenticate the user credentials
    // console.log('before async authenticate');
    this.apiDataAuthService.authenticate(user)
      .subscribe(
        res => {

          // console.log('within authenticate (response');

          // log the time it took to authenticate
          this.logAuthPerformance(t0);

          // TEMP CODE: to log the response
          // console.log('authentication was successfull:');
          // console.log(res);

          // set or clear the username cookie depending on whether remember me is selected
          this.setCookie();

          // store the logged in user in the auth service
          this.authService.loggedInUser = new User().deserialize(res.jarvisUser);
          // this.authService.loggedInUser = res.jarvisUser;
          // console.log('logged in user:');
          // console.log(this.authService.loggedInUser);

          // store the jwt token in the cache service
          this.cacheService.token = res.token;
          // console.log('token saved in cache service (this.token):');
          // console.log(this.cacheService.token);

          // store the jwt token in local storage
          localStorage.setItem('jarvisToken', res.token.signedToken);
          // sessionStorage.setItem('jarvisToken', res.token.signedToken);

          // set logged in to true in the auth service (loggedIn property)
          this.authService.setLoggedIn(true);

          // reset the timer so that it will be synched with the token expiration, at least within a second or two
          this.cacheService.resetTimer.emit(true);

          // clear the autologout object
          this.cacheService.autoLogout$ = undefined;

          // get and store nested org data for this user, in anticipation of use and for performance
           this.getNestedOrgData(res.jarvisUser.email);
          // this.getNestedOrgData('ethan_hunt@keysight.com');

          // hide the animated svg
          this.showPendingLoginAnimation = false;

          // route to the main page or the page that the user was attempting to go to before getting booted back to the login page
          if (this.cacheService.appLoadPath) {
            this.router.navigateByUrl(this.cacheService.appLoadPath);
          } else {
            this.router.navigateByUrl('/main/dashboard');
          }


          // send the logged in user object to all other clients via websocket
          this.websocketService.sendLoggedInUser(this.authService.loggedInUser);

        },
        err => {

          // log the time it took to authenticate
          this.logAuthPerformance(t0);

          // TEMP CODE to log the response (error)
          console.error('authentication failed:');
          console.error(err);

          // hide the animated svg
          this.showPendingLoginAnimation = false;

          // display the appropriate message depending on the type of error (timeout, invalid credentials, etc.)
          this.handleErrorMessage(err);

        }
      );
  }

  // set or delete the jrt_username cookie when the user logs in
  setCookie() {
    if (this.rememberMe) {
      this.cookiesService.setCookie('jrt_username', this.userName, 365);
    } else {
      this.cookiesService.deleteCookie('jrt_username');
    }
  }


  // reset and hide the error message
  resetErrorMessage() {
    this.loginMessage = undefined;
    this.showMessage = false;
  }

  // simple check for form entry error (missing either user name or password or both)
  hasFormEntryErrors(): boolean {
    if (!this.userName || !this.password) {
      return true;
    }
  }

  // display error message and icon for missing username or password, also set focus for the user for convenience
  displayFormEntryErrors() {
    if (!this.userName && !this.password) {
      this.displayMessage('Please enter your user name and password', 'fa-exclamation-triangle', this.cacheService.alertIconColor);
      this.userNameVC.nativeElement.focus();
    } else if (!this.userName) {
      this.displayMessage('Please enter your user name', 'fa-exclamation-triangle', this.cacheService.alertIconColor);
      this.userNameVC.nativeElement.focus();
    } else if (!this.password) {
      this.displayMessage('Please enter your password', 'fa-exclamation-triangle', this.cacheService.alertIconColor);
      this.passwordVC.nativeElement.focus();
    }
  }

  // TEMP CODE to log the total time it took to authenticate
  logAuthPerformance(t0: number) {
    const t1 = performance.now();
    // console.log(`authentication took ${t1 - t0} milliseconds`);
  }

  // display authentication error or success message
  displayMessage(message: string, iconClass: string, iconColor: string) {
    this.loginMessage = message;
    this.iconClass = iconClass;
    this.iconColor = iconColor;
    this.showMessage = true;
  }

  // for an error response, check for various types or errors and display the appropriate message
  handleErrorMessage(err: any) {
    // check for no response (net::ERR_CONNECTION_REFUSED etc.)
    if (err.status === 0) {
      this.toolsService.displayTimeoutError();
      this.displayMessage('The server is not responding', 'fa-exclamation-triangle', this.cacheService.alertIconColor);
    // check for timeout error
    } else if (err.hasOwnProperty('name')) {
      if (err.name === 'TimeoutError') {
        this.toolsService.displayTimeoutError();
        this.displayMessage('The server is not responding', 'fa-exclamation-triangle', this.cacheService.alertIconColor);
      }
    // otherwise, this should be a failed login (invalid credentials)
    } else {
      this.displayMessage('Invalid user name or password.  Note: Use your Windows credentials to login.',
        'fa-exclamation-triangle', this.cacheService.alertIconColor);
    }
  }

  // get and store the nested org data upon successfull login
  getNestedOrgData(email: string) {
    this.cacheService.nestedOrgDataRequested = true;
    this.apiDataOrgService.getOrgData(email)
    .subscribe(
      res => {
        const nestedOrgData = JSON.parse('[' + res[0].json + ']');
        // console.log('nested org object');
        // console.log(nestedOrgData);
        this.cacheService.$nestedOrgData = nestedOrgData;
        this.cacheService.nestedOrgData.emit(nestedOrgData);
      },
      err => {
        console.error('error getting nested org data');
      }
    );
  }

  // when the slide toggle is changed, update the rememberMe property (boolean)
  onRememberMeChange(event) {
    // console.log('on remember me change event triggered');
    // console.log(event.target.checked);
    this.rememberMe = event.target.checked;
  }


}
