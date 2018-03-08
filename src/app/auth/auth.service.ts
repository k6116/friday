import { Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';
import { Router } from '@angular/router';

@Injectable()
export class AuthService {

  loggedIn: boolean;

  constructor(
    private http: Http,
    private router: Router
  ) {

    this.loggedIn = !!localStorage.getItem('jarvisToken');
    console.log(`auth service is constructed, loggedIn property is: ${this.loggedIn}`);

  }


  isLoggedIn() {
    return this.loggedIn;
  }

  setLoggedIn(loggedIn: boolean) {
    this.loggedIn = loggedIn;
  }


}
