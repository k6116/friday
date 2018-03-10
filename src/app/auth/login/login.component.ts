import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { ApiDataService } from '../../_shared/services/api-data.service';
import { AuthService } from '../auth.service';
import { ToolsService } from '../../_shared/services/tools.service';

import * as moment from 'moment';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  @ViewChild('userNameVC') userNameVC: ElementRef;
  @ViewChild('passwordVC') passwordVC: ElementRef;

  userName: string;
  password: string;
  loginMessage: string;
  loginSuccess: boolean;
  showMessage: boolean;
  iconClass: string;


  constructor(
    private router: Router,
    private apiDataService: ApiDataService,
    private authService: AuthService,
    private toolsService: ToolsService
  ) { }

  ngOnInit() {

  }


  onLoginClick() {

    console.log(`login button clicked with user name ${this.userName}`);

    this.loginMessage = undefined;
    this.showMessage = false;

    if (!this.userName || !this.password) {
      if (!this.userName && !this.password) {
        this.loginMessage = 'Please enter your user name and password';
      } else if (!this.userName) {
        this.loginMessage = 'Please enter your user name';
        this.userNameVC.nativeElement.focus();
      } else if (!this.password) {
        this.loginMessage = 'Please enter your password';
        this.passwordVC.nativeElement.focus();
      }
      this.showMessage = true;
      this.loginSuccess = false;
      this.iconClass = 'fa-exclamation-triangle';
      return;
    }

    const user = JSON.stringify({
      userName: this.userName,
      password: encodeURIComponent(this.password)
    });

    const t0 = performance.now();
    this.apiDataService.authenticate(user)
      .subscribe(
        res => {
          const t1 = performance.now();
          console.log(`authentication took ${t1 - t0} milliseconds`);
          console.log('authentication response:');
          console.log(res);
          const fullName = this.toolsService.toSentanceCase(`${res.ldapUser.givenName} ${res.ldapUser.sn}`);
          console.log(`user login successfull, email is ${res.ldapUser.mail}, name is ${fullName}`);
          if (!res.newUser) {
            console.log(`this is an existing Jarvis user:`);
            console.log(res.jarvisUser);
          } else {
            console.log('this would be a new Jarvis user');
            console.log(res.jarvisUser);
          }
          localStorage.setItem('jarvisToken', res.token);
          this.showMessage = true;
          this.loginSuccess = true;
          this.iconClass = 'fa-check-circle';
          this.loginMessage = `Login successfull for ${fullName}`;
          // this.authService.setLoggedIn(true);
          // this.router.navigateByUrl('/main');
        },
        err => {
          const t1 = performance.now();
          console.log(`authentication took ${t1 - t0} milliseconds`);
          console.log('user login failed; errors:');
          console.log(err);

          // check for no response (net::ERR_CONNECTION_REFUSED etc.)
          if (err.status === 0) {
            this.loginMessage = 'Server is not responding';
          // check for timeout error
          } else if (err.hasOwnProperty('name')) {
            if (err.name === 'TimeoutError') {
              this.loginMessage = 'Server timed out';
            }
          // otherwise, this should be a failed login
          } else {
            this.loginMessage = 'Invalid user name or password';
          }
          this.showMessage = true;
          this.loginSuccess = false;
          this.iconClass = 'fa-exclamation-triangle';
        }
      );


  }

}
