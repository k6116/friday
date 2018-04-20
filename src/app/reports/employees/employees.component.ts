import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

import { AppDataService } from '../../_shared/services/app-data.service';
import { ApiDataService } from '../../_shared/services/api-data.service';
import { AuthService } from '../../auth/auth.service';

declare var $: any;

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
  displayedEmployee: any;

  constructor(
    private appDataService: AppDataService,
    private apiDataService: ApiDataService,
    private authService: AuthService
  ) {

    this.displayOrgDropDown = false;

  }

  ngOnInit() {


    // TEMP CODE: testing nested org data requested
    console.log('nested org data requested:');
    console.log(this.appDataService.nestedOrgDataRequested);

    this.nestedOrgData = this.appDataService.$nestedOrgData;
    if (this.nestedOrgData) {
      console.log('nested org data picked up in employee reports');
      console.log(this.nestedOrgData);
    }

    this.subscription1 = this.appDataService.nestedOrgData.subscribe(
      (nestedOrgData: any) => {
        this.nestedOrgData = nestedOrgData;
        // this.appDataService.$nestedOrgData = nestedOrgData;
        console.log('nested org data received in employee reports component via subscription');
        console.log(this.nestedOrgData);
        this.waitingForOrgData = false;
    });

    if (!this.appDataService.nestedOrgDataRequested) {
      // get logged in user's info
      this.authService.getLoggedInUser((user, err) => {
        // this.getNestedOrgData(user.email);
        this.getNestedOrgData('pat_harper@keysight.com');
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
        this.nestedOrgData = nestedOrgData;
        // this.appDataService.$nestedOrgData = nestedOrgData;
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

  onclickedEmployeeIcon(employee) {
    console.log('clicked employee icon fired with employee:');
    console.log(employee);
    this.expandCollapseOrg(this.nestedOrgData, employee.fullName);
  }

  onclickedEmployee(employee) {
    console.log('clicked employee fired with employee:');
    console.log(employee);
    this.displayOrgDropDown = false;
    this.displayedEmployee = employee;
  }


  expandCollapseOrg(org: any, name: string) {

    for (const i in org) {
      if (typeof org[i] === 'object') {
        // console.log(`employee name: ${org[i].name}`);
        // console.log(`looking for employee ${name}`);
        if (org[i].fullName === name) {
          console.log('found name match');
          console.log(`show employees set to ${org[i].showEmployees}, clicked employee uid is ${org[i].uid}`);
          console.log('number of employees: ' + org[i].employees.length);
          const maxHeight = 51 * org[i].employees.length;
          // COLLAPSE
          if (org[i].showEmployees) {
            // $(`.team-cont.${org[i].uid}`).css('transition', 'max-height 1s ease-in');
            $(`.team-cont.${org[i].uid}`).css('max-height', '0');
            setTimeout(() => {
              org[i].showEmployees = false;
            }, 500);
            return;
          // EXPAND
          } else {
            org[i].showEmployees = true;
            setTimeout(() => {
              // $(`.team-cont.${org[i].uid}`).css('transition', 'max-height 1s ease-out');
              // NOTE: TRY THIS INSTEAD TO GET THE HEIGHT
              // const maxHeight2 = $(`.team-cont.${org[i].uid}`).height();
              $(`.team-cont.${org[i].uid}`).css('max-height', maxHeight);
            }, 100);
            return;
          }
        // RECURSE TO KEEP TRYING TO FIND THE EMPLOYEE
        } else if (org[i].employees) {
          // console.log('recurse here');
          this.expandCollapseOrg(org[i].employees, name);
        }
      }
    }

  }




}
