import { LoginCookiesService } from '../services/login-cookies.service';
import { CookiesService } from '../../../_shared/services/cookies.service';
import { async, inject, TestBed } from '@angular/core/testing';


describe('Login Cookies Service', () => {

  let loginCookiesService: LoginCookiesService;
  let cookiesService: CookiesService;

  // beforeEach(async(() => {
  //   TestBed.configureTestingModule({
  //     imports: [ ],
  //     declarations: [],
  //     providers: [ LoginCookiesService, CookiesService ]
  //   })
  //   .compileComponents();
  // }));

  // beforeEach(inject([LoginCookiesService], (service: LoginCookiesService) => {
  //   loginCookiesService = service;
  // }));

  beforeEach(() => {
    cookiesService = new CookiesService();
    loginCookiesService = new LoginCookiesService(cookiesService);
  });

  it('should set and get remember me cookie', () => {

    loginCookiesService.setRememberMeCookie(true, 'chuetzle');

    expect(loginCookiesService.getRememberMeCookie()).toEqual({
      userName: 'chuetzle',
      rememberMe: true
    });

  });

  it('should delete remember me cookie', () => {

    loginCookiesService.setRememberMeCookie(false, 'chuetzle');

    expect(loginCookiesService.getRememberMeCookie()).toEqual({
      userName: undefined,
      rememberMe: false
    });

  });


});
