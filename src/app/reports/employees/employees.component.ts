import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

import { AppDataService } from '../../_shared/services/app-data.service';
import { ApiDataService } from '../../_shared/services/api-data.service';
import { AuthService } from '../../auth/auth.service';


@Component({
  selector: 'app-employees-reports',
  templateUrl: './employees.component.html',
  styleUrls: ['./employees.component.css', '../../_shared/styles/common.css']
})
export class EmployeesReportsComponent implements OnInit, OnDestroy {

  nestedOrgData: any;
  subscription1: Subscription;
  waitingForOrgData: boolean;
  displayOrgDropDown: boolean;

  constructor(
    private appDataService: AppDataService,
    private apiDataService: ApiDataService,
    private authService: AuthService
  ) {

    this.displayOrgDropDown = false;

  }

  ngOnInit() {

    this.nestedOrgData = this.appDataService.$nestedOrgData;
    if (this.nestedOrgData) {
      console.log('nested org data picked up in employee reports');
    }

    this.subscription1 = this.appDataService.nestedOrgData.subscribe(
      (nestedOrgData: any) => {
        this.nestedOrgData = nestedOrgData;
        this.appDataService.$nestedOrgData = nestedOrgData;
        console.log('nested org data received in employee reports component via subscription');
        this.waitingForOrgData = false;
    });

    if (!this.appDataService.nestedOrgDataRequested) {
      // get logged in user's info
      this.authService.getLoggedInUser((user, err) => {
        // this.getNestedOrgData(user.email);
        this.getNestedOrgData('ron_nersesian@keysight.com');
      });
    }

    // show the spinner if the nested org data is not loaded yet
    if (!this.nestedOrgData) {
      this.waitingForOrgData = true;
    }

  }

  ngOnDestroy() {
    this.subscription1.unsubscribe();
  }

  getNestedOrgData(email: string) {
    this.apiDataService.getOrgData(email)
    .subscribe(
      res => {
        const nestedOrgData = JSON.parse('[' + res[0].json + ']');
        console.log('nested org object retrieved from api data service in employee reports component');
        console.log(nestedOrgData);
        this.appDataService.$nestedOrgData = nestedOrgData;
        this.waitingForOrgData = false;
      },
      err => {
        console.log('error getting nested org data');
      }
    );
  }

  getDropDownStyle(): any {
    if (this.waitingForOrgData) {
      return {'background-color': 'rgb(225, 225, 225)', cursor: 'wait'};
    } else {
      return {'background-color': 'rgb(245, 245, 245)'};
    }
  }


  onOrgDropDownClick() {
    console.log('org dropdown clicked');
    if (!this.waitingForOrgData) {
      this.displayOrgDropDown = !this.displayOrgDropDown;
    }
  }

}
