import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { AuthService } from '../auth/auth.service';
import { User } from '../_shared/models/user.model';
import { AppDataService } from '../_shared/services/app-data.service';


@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit {

  loggedInUser: User;
  subscription1: Subscription;

  constructor(
    private authService: AuthService,
    private appDataService: AppDataService
  ) { }

  ngOnInit() {

    this.loggedInUser = this.authService.loggedInUser;

    this.subscription1 = this.appDataService.loggedInUser.subscribe(
      (loggedInUser: any) => {
        console.log('subscription to loggedInUser receivevd in the main component');
        this.loggedInUser = loggedInUser;
    });

  }

}
