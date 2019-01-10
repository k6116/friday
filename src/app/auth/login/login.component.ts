import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CacheService } from '../../_shared/services/cache.service';
import { LoginImageService } from './services/login-image.service';
import { LoginAuthService } from './services/login-auth.service';
import { LoginMessagesService } from './services/login-messages.service';
import { LoginCookiesService } from './services/login-cookies.service';
import { IBackgroundImage } from './services/login-image.service';
import { IMessage } from './services/login-messages.service';
import { ICookie } from './services/login-cookies.service';

declare var $: any;


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css', '../../_shared/styles/common.css'],
  providers: [LoginImageService, LoginAuthService, LoginMessagesService, LoginCookiesService]
})
export class LoginComponent implements OnInit {

  // view childs are set up for the user name and password inputs so the focus() method can be used
  // tied to #userNameVC and #passwordVC in the html
  @ViewChild('userNameVC') userNameVC: ElementRef;
  @ViewChild('passwordVC') passwordVC: ElementRef;

  userName: string;  // used for two way binding with user name input, with ngModel
  password: string;   // used for two way binding with password input, with ngModel
  showLoginPage: boolean;   // used to delay rendering of the page until background image is ready
  message: IMessage;    // object used for the message displayed below the login button (invalid login etc.)
  rememberMe: boolean;    // checkbox state
  showPendingLoginAnimation: boolean;   // toggle for animated svg in login button
  backgroundImage: IBackgroundImage;    // page's background image
  imageClass: string;   // used to control blur up of full size image (small to large)
  isImageLoaded: boolean;   // used to hide the thumbnail image when the full-size has finished loading
  isTestInstance: boolean;    // set to true if this is the test instance (port 440); use blue version of icon


  constructor(
    public cacheService: CacheService,
    private loginImageService: LoginImageService,
    private loginAuthService: LoginAuthService,
    private loginMessagesService: LoginMessagesService,
    private loginCookiesService: LoginCookiesService
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
      this.setInputFocus();
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
        this.setInputFocus();
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
    const cookieContents: ICookie = this.loginCookiesService.getRememberMeCookie();
    this.userName = cookieContents.userName;
    this.rememberMe = cookieContents.rememberMe;
  }

  // check the port to see if this is the test instance (dev will return '3000', test will return '440' prod will return '')
  // if this is test, use the 'blue' icon version (_test) and text instead of yellow
  checkInstance() {
    this.isTestInstance = location.port === '440' ? true : false;
  }

  // check for the an autoLogout object passed via the cache service; if it exists display the message below the Login button
  checkForAutoLogout() {
    if (this.cacheService.autoLogout$) {
      this.message = this.loginMessagesService.getAutoLogoutMessage();
    }
  }

  // handle enter key events when focused on the user name or password inputs
  onLoginKeyEnter() {

    // call login click
    this.onLoginClick();

  }

  // handle login button clicked (with mouse click)
  async onLoginClick() {

    // check for and display form entry errors if any (user name and/or password missing)
    this.message = this.loginMessagesService.getFormEntryMessage(this.userName, this.password);

    // return/exit here is there is an error message
    // and set the focus on either the user name or password input depending on which is missing (set focus on user name if both missing)
    if (this.message.display) {
      this.setInputFocus();
      return;
    }

    // show the animated svg in the login button
    this.showPendingLoginAnimation = true;

    // construct a user/login object that will be passed in the request body
    const user = {
      userName: this.userName,
      password: this.password,
      rememberMe: this.rememberMe
    };

    // pass the user object and get the auth response from the service
    const authResponse = await this.loginAuthService.authenticate(user);

    // if there was an error, display it below the login button
    if (authResponse.error) {
      this.message = this.loginMessagesService.getLoginErrorMessage(authResponse.error);
    }
    
    // stop showing the animated svg in the login button
    this.showPendingLoginAnimation = false;

  }

  // set focus on either the username or password input depending on whether username is populated from the cookie
  setInputFocus() {
    if (this.userName) {
      this.passwordVC.nativeElement.focus();
    } else {
      this.userNameVC.nativeElement.focus();
    }
  }


}
