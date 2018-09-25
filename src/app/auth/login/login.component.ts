import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CacheService } from '../../_shared/services/cache.service';
import { AuthService } from '../../_shared/services/auth.service';
import { ToolsService } from '../../_shared/services/tools.service';
import { ClickTrackingService } from '../../_shared/services/click-tracking.service';
import { User } from '../../_shared/models/user.model';
import { WebsocketService } from '../../_shared/services/websocket.service';
import { CookiesService } from '../../_shared/services/cookies.service';
import { ApiDataAuthService, ApiDataOrgService } from '../../_shared/services/api-data/_index';
import { LoginImageService } from './login-image.service';
import { LoginAuthService } from './login-auth.service';
import { LoginErrorsService } from './login-errors.service';
import { LoginCookiesService } from './login-cookies.service';
import { IBackgroundImage } from './login-image.service';

declare var $: any;


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css', '../../_shared/styles/common.css'],
  providers: [LoginImageService, LoginAuthService, LoginErrorsService, LoginCookiesService]
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

  // toggle checkbox state
  rememberMe: boolean;

  // toggle animated icon on login click
  showPendingLoginAnimation: boolean;

  // page's background image
  backgroundImage: IBackgroundImage;

  // control behavior of full size image (small vs. large)
  imageClass: string;

  // used to hide the thumbnail image when the full-size has finished loading
  isImageLoaded: boolean;

  // set to true if this is the test instance (port 440)
  isTestInstance: boolean;


  constructor(
    private router: Router,
    public cacheService: CacheService,
    private apiDataOrgService: ApiDataOrgService,
    private apiDataAuthService: ApiDataAuthService,
    private authService: AuthService,
    private toolsService: ToolsService,
    private clickTrackingService: ClickTrackingService,
    private websocketService: WebsocketService,
    private cookiesService: CookiesService,
    private loginImageService: LoginImageService,
    private loginAuthService: LoginAuthService,
    private loginCookiesService: LoginCookiesService,
    private loginErrorsService: LoginErrorsService,
    private route: ActivatedRoute
  ) {

    this.imageClass = '';

  }

  ngOnInit() {

    // set the page's background image
    this.setBackgroundImage();

    // check the cookies for the jrt_username cookie, if it is there set the username
    // this means that the user had previously logged in with 'Remember Me' selected
    this.checkRememberMeCookie();

    // check which instance this is by checking the port (dev: '3000', test: '440', prod: '')
    // if this is test, use the 'blue' icon version (_test) and text instead of yellow
    this.checkInstance();

    // check for the an autoLogout object passed via the cache service; if it exists display the message below the Login button
    this.checkForAutoLogout();

  }

  setBackgroundImage() {

    // if the image is stored in the cache, use that image (use same image on logout that was used for login)
    if (this.cacheService.backgroundImage) {
      this.setCachedBackgroundImage();
    // otherwise, get a new random image for the page and use the 'blur up' technique to load
    } else {
      this.setBlurUpBackgroundImage();
    }

  }

  async setBlurUpBackgroundImage() {

    // get a random background image object (with metadata) from the service
    this.backgroundImage = await this.loginImageService.getBackgroundImage();

    // set the background image urls for both the thumbnail and full size images
    $('div.login-background-image1').css('background-image', `url(${this.backgroundImage.thumbnail.path})`);
    $('div.login-background-image2').css('background-image', `url(${this.backgroundImage.fullSize.path})`);

    // set the src property to trigger the download of the hidden images
    // so we can listen for the load event
    $('img.hidden-background-image1').attr('src', this.backgroundImage.thumbnail.path);
    $('img.hidden-background-image2').attr('src', this.backgroundImage.fullSize.path);

    // add the 'small' image class to the full-size image to apply a 20px blur initially
    // NOTE: will set it to 'large' when it completes loading to transition out to no blur ('blur up')
    this.imageClass = 'small';

  }

  setCachedBackgroundImage() {

    // get the background image from the cache (same as image displayed on login)
    this.backgroundImage = this.cacheService.backgroundImage;

    // set the background image url; it will be in the browser cache so should be displayed/loaded immediately
    setTimeout(() => {
      $('div.login-background-image2').css('background-image', `url(${this.backgroundImage.fullSize.path})`);
    }, 0);

    // remove the 'small' or 'large' image class so that it will not be blurred or initiate a transition
    this.imageClass = '';

    // used with style binding to set the visibility css property to 'visible'
    this.showLoginPage = true;

    // set the focus on either the user name or password input
    setTimeout(() => {
      this.setInputFocus(!!this.userName);
    }, 0);

  }

  // triggered when the thumbnail image has finished downloading using (load) event handler
  onImageLoaded1() {

    // add a quarter second buffer to wait and ensure that the small image is fully loaded and rendered
    setTimeout(() => {
      // trigger the visibility of the login page when the thumbnail image is fully loaded
      this.showLoginPage = true;
      setTimeout(() => {
        // set the focus on either the user name or password input
        this.setInputFocus(!!this.userName);
      }, 0);
    }, 250);

  }

  // triggered when the full size image has finished downloading using (load) event handler
  onImageLoaded2() {

    // add a half second buffer to wait and ensure that the large image is fully loaded and rendered
    setTimeout(() => {
      // set the addt'l background image 2 class to large (from small) to start the sharpen transition effect
      this.imageClass = 'large';
      // set image is loaded (large image) to set background image 1 visibility to hidden
      this.isImageLoaded = true;
    }, 500);

  }

  // check for the jrt_username cookie; if it exists set the username in the input (uses two-way binding)
  checkRememberMeCookie() {
    const userName = this.cookiesService.getCookie('jrt_username');
    if (userName) {
      this.userName = userName;
      this.rememberMe = true;
    } else {
    }
  }

  // check the port to see if this is the test instance (dev will return '3000', test will return '440' prod will return '')
  // if this is test, use the 'blue' icon version (_test) and text instead of yellow
  checkInstance() {
    if (location.port === '440') {
      this.isTestInstance = true;
    }
  }

  // check for the an autoLogout object passed via the cache service; if it exists display the message below the Login button
  checkForAutoLogout() {
    if (this.cacheService.autoLogout$) {
      const autoLogout = this.cacheService.autoLogout$;
      this.displayMessage(autoLogout.message, autoLogout.iconClass, autoLogout.iconColor);
    }
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



  async onLoginClick() {

    // reset and hide the error message if any is already displayed
    this.resetErrorMessage();

    // check for form entry errors (missing user name or password)
    if (this.hasFormEntryErrors()) {
      this.displayFormEntryErrors();
      // stop here
      return;
    }

    // show the animated svg
    this.showPendingLoginAnimation = true;

    // construct a user/login object that will be passed in the request body
    const user = {
      userName: this.userName,
      password: this.password,
      rememberMe: this.rememberMe
    };

    const authResponse = await this.loginAuthService.authenticate(user);

    console.log('auth response in component:');
    console.log(authResponse);

    // // call the api data service to authenticate the user credentials
    // this.apiDataAuthService.authenticate(user)
    //   .subscribe(
    //     res => {

    //       // console.log(res);

    //       // log the time it took to authenticate
    //       // this.logAuthPerformance(t0);

    //       // set or clear the username cookie depending on whether remember me is selected
    //       this.setCookie();

    //       // store the logged in user in the auth service
    //       this.authService.loggedInUser = new User().deserialize(res.jarvisUser);

    //       // store the jwt token in the cache service
    //       this.cacheService.token = res.token;

    //       // store the jwt token in local storage
    //       localStorage.setItem('jarvisToken', res.token.signedToken);
    //       // sessionStorage.setItem('jarvisToken', res.token.signedToken);

    //       // set logged in to true in the auth service (loggedIn property)
    //       this.authService.setLoggedIn(true);

    //       // reset the timer so that it will be synched with the token expiration, at least within a second or two
    //       this.cacheService.resetTimer.emit(true);

    //       // clear the autologout object
    //       this.cacheService.autoLogout$ = undefined;

    //       // get and store nested org data for this user, in anticipation of use and for performance
    //       this.getNestedOrgData(res.jarvisUser.email);
    //       // this.getNestedOrgData('ethan_hunt@keysight.com');

    //       // hide the animated svg
    //       this.showPendingLoginAnimation = false;

    //       // route to the main page or the page that the user was attempting to go to before getting booted back to the login page
    //       if (this.cacheService.appLoadPath) {
    //         this.router.navigateByUrl(this.cacheService.appLoadPath);
    //       } else {
    //         this.router.navigateByUrl('/main/dashboard');
    //       }

    //       // send the logged in user object to all other clients via websocket
    //       this.websocketService.sendLoggedInUser(this.authService.loggedInUser);

    //     },
    //     err => {

    //       // log the time it took to authenticate
    //       // this.logAuthPerformance(t0);

    //       // TEMP CODE to log the response (error)
    //       console.error('authentication failed:');
    //       console.error(err);

    //       // hide the animated svg
    //       this.showPendingLoginAnimation = false;

    //       // display the appropriate message depending on the type of error (timeout, invalid credentials, etc.)
    //       this.handleErrorMessage(err);

    //     }
    //   );

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

  // when the checkbox is changed, update the rememberMe property (boolean)
  onRememberMeChange(event) {
    this.rememberMe = event.target.checked;
  }



}
