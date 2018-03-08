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

    console.log(`login button clicked with user name ${this.userName} and password ${this.password}`);

    const user = JSON.stringify({
      userName: this.userName,
      password: encodeURIComponent(this.password)
    });

    this.apiDataService.authenticate(user)
      .subscribe(
        res => {
          console.log('authentication response:');
          console.log(res);
        },
        err => {
          console.log('authentication errors:');
          console.log(err);
        }
      );


  }

}
