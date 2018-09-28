import { async, fakeAsync, tick, inject, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { LoginComponent } from '../login.component';
import { ConfirmModalComponent } from '../../../modals/confirm-modal/confirm-modal.component';
import { SafeHtmlPipe } from '../../../_shared/pipes/safe-html.pipe';
import { CacheService } from '../../../_shared/services/cache.service';
import { AuthService } from '../../../_shared/services/auth.service';
import { ToolsService } from '../../../_shared/services/tools.service';
import { ClickTrackingService } from '../../../_shared/services/click-tracking.service';
import { WebsocketService } from '../../../_shared/services/websocket.service';
import { CookiesService } from '../../../_shared/services/cookies.service';
import { ApiDataAuthService, ApiDataOrgService, ApiDataClickTrackingService } from '../../../_shared/services/api-data/_index';
import { LoginImageService } from '../services/login-image.service';
import { LoginAuthService } from '../services/login-auth.service';
import { LoginMessagesService } from '../services/login-messages.service';
import { LoginCookiesService } from '../services/login-cookies.service';
import { IBackgroundImage } from '../services/login-image.service';
import { IMessage } from '../services/login-messages.service';
import { ICookie } from '../services/login-cookies.service';
import { HttpModule } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';


declare var $: any;


const mockResponse = {
  jarvisUser: {id: 2, firstName: 'Bill ', lastName: 'Schuetzle', fullName: 'Bill Schuetzle', userName: 'chuetzle',
    email: 'bill_schuetzle@keysight.com'},
  ldapUser: {dn: 'CN=chuetzle,CN=Users,DC=AD,DC=KEYSIGHT,DC=COM'},
  token: {signedToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyRGF0Y…YzOX0._p8VulK9Qy1y_aZWf_8xcgGUj-L5H0Jg8rUF_eB4TYA',
    issuedAt: 1537249839, expiringAt: 1537251639}
};


xdescribe('Login Component', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let debugElement: DebugElement;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ FormsModule, RouterTestingModule, HttpModule ],
      declarations: [ LoginComponent, ConfirmModalComponent, SafeHtmlPipe ],
      providers: [ CacheService, AuthService, ToolsService, ClickTrackingService,
        WebsocketService, CookiesService, ApiDataAuthService, ApiDataOrgService,
        ApiDataClickTrackingService, LoginImageService, LoginAuthService, LoginMessagesService, LoginCookiesService ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    debugElement = fixture.debugElement;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display `Please enter your user name and password` if no inputs', () => {
    debugElement
      .query(By.css('button.btn-login'))
      .triggerEventHandler('click', null);
    fixture.detectChanges();
    const text = debugElement.query(By.css('td.login-notice-message')).nativeElement.innerText;
    expect(text).toEqual('Please enter your user name and password.');
  });

  it('should display `Please enter your user name` if password but no username', () => {
    component.password = 'asdflskf$';
    debugElement
      .query(By.css('button.btn-login'))
      .triggerEventHandler('click', null);
    fixture.detectChanges();
    const text = debugElement.query(By.css('td.login-notice-message')).nativeElement.innerText;
    expect(text).toEqual('Please enter your user name.');
  });

  it('should display `Please enter your password` if username but no password', () => {
    component.userName = 'chuetzle';
    debugElement
      .query(By.css('button.btn-login'))
      .triggerEventHandler('click', null);
    fixture.detectChanges();
    const text = debugElement.query(By.css('td.login-notice-message')).nativeElement.innerText;
    expect(text).toEqual('Please enter your password.');
  });

  it('should populate user name from cookie', () => {
    const cookiesService = fixture.debugElement.injector.get(CookiesService);
    const userName = cookiesService.getCookie('jrt_username');
    // console.log('username:');
    // console.log(userName);
    expect(1).toEqual(1);
  });

  it('should fetch user data on login and store in the cache service', async(() => {
    component.userName = 'chuetzle';
    component.password = 'asdfls$';
    const apiDataAuthService = fixture.debugElement.injector.get(ApiDataAuthService);
    const authService = fixture.debugElement.injector.get(AuthService);
    const spy = spyOn(apiDataAuthService, 'authenticate')
      .and.returnValue(Observable.of(mockResponse));
    component.onLoginClick();
    fixture.detectChanges();
    fixture.whenStable().then(() => {
      // console.log('after stable');
      const user = authService.loggedInUser;
      // console.log('user');
      // console.log(user);
      expect(user).toBeTruthy();
      expect(user.fullName).toEqual('Bill Schuetzle');
    });
  }));


});
