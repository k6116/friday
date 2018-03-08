import { Component, OnInit } from '@angular/core';
import { ApiDataService } from '../../_shared/services/api-data.service';



@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {


  userName: string;
  password: string;
  loginMessage: string;
  loginSuccess: boolean;
  showMessage: boolean;
  iconClass: string;


  constructor(
    private apiDataService: ApiDataService
  ) { }

  ngOnInit() {


    this.apiDataService.getUserData()
      .subscribe(
        res => {
          console.log('users data:');
          console.log(res);
        },
        err => {
          console.log('error getting users data:');
          console.log(err);
        }
      );

  }


  onLoginClick() {

    console.log(`login button clicked with user name ${this.userName}`);

    this.loginMessage = undefined;
    this.showMessage = false;

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
          console.log(`user login successfull, email is ${res.mail}, name is ${res.givenName} ${res.sn}`);
          this.showMessage = true;
          this.loginSuccess = true;
          this.iconClass = 'fa-check-circle';
          this.loginMessage = `Login Successfull for ${res.givenName} ${res.sn}`;
        },
        err => {
          const t1 = performance.now();
          console.log(`authentication took ${t1 - t0} milliseconds`);
          console.log('user login failed; errors:');
          console.log(err);
          this.showMessage = true;
          this.loginSuccess = false;
          this.iconClass = 'fa-exclamation-triangle';
          this.loginMessage = 'Invalid User Name or Password';
        }
      );


  }

}
