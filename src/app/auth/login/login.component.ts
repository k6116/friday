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
          console.log(`user login successfull, email is ${res.ldap.mail}, name is ${res.ldap.givenName} ${res.ldap.sn}`);
          if (res.jarvis) {
            console.log(`this is an existing Jarvis user:`);
            console.log(res.jarvis);
          } else {
            console.log('this would be a new Jarvis user');
          }
          this.showMessage = true;
          this.loginSuccess = true;
          this.iconClass = 'fa-check-circle';
          this.loginMessage = `Login Successfull for ${res.ldap.givenName} ${res.ldap.sn}`;
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
