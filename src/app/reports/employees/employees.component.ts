import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
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
  employeeElements: any;

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
    if (!this.displayOrgDropDown) {
      this.collapseOrg(this.nestedOrgData);
    }
  }

  onclickedEmployeeIcon(employee) {
    console.log('clicked employee icon fired with employee:');
    console.log(employee);
    this.expandCollapseOrg(this.nestedOrgData, employee.fullName);
    setTimeout(() => {
      this.employeeElements = $('div.emp-name');
      // console.log(this.employeeElements.length);
    }, 100);
  }

  onclickedEmployee(employee) {
    console.log('clicked employee fired with employee:');
    console.log(employee);
    this.displayOrgDropDown = false;
    this.displayedEmployee = employee;
    this.collapseOrg(this.nestedOrgData);
  }


  expandCollapseOrg(org: any, name: string) {

    for (const i in org) {
      if (typeof org[i] === 'object') {
        if (org[i].fullName === name) {
          org[i].showEmployees = !org[i].showEmployees;
          return;
        } else if (org[i].employees) {
          this.expandCollapseOrg(org[i].employees, name);
        }
      }
    }

  }

  // collapse all managers - set showEmployees to false
  collapseOrg(org: any) {

    for (const i in org) {
      if (typeof org[i] === 'object') {
        org[i].showEmployees = false;
        if (org[i].employees) {
          this.collapseOrg(org[i].employees);
        }
      }
    }

  }


  @HostListener('scroll', ['$event'])
  onScroll(event) {

    const displayedLevels: number[] = [];
    this.employeeElements.each((i, obj) => {
      const dataUID = obj.getAttribute('data-uid');
      const element = `div.emp-name[data-uid=${dataUID}]`;
      if (this.checkInView(element, false)) {
        displayedLevels.push($(element).data('level'));
      }
    });
    const rootLevel = this.nestedOrgData[0].level;
    const minLevel = Math.min(...displayedLevels);
    const indent = minLevel - rootLevel - 1 >= 1 ? minLevel - rootLevel - 1 : 0;
    const container = $('div.org-dropdown-cont');
    container.scrollLeft(indent * 15);
    // container.animate({scrollLeft: indent * 15}, 100);

  }


  checkInView(elem, partial): boolean {
    const container = $('div.org-dropdown-cont');
    const contHeight = container.height();
    const contTop = container.scrollTop();
    const contBottom = contTop + contHeight ;

    const elemTop = $(elem).offset().top - container.offset().top;
    const elemBottom = elemTop + $(elem).height();

    const isTotal = (elemTop >= 0 && elemBottom <= contHeight);
    const isPart = ((elemTop < 0 && elemBottom > 0 ) || (elemTop > 0 && elemTop <= container.height())) && partial;

    return isTotal || isPart;
  }


}
