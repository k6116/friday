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
  flatOrgData: any;
  subscription1: Subscription;
  waitingForOrgData: boolean;
  displayOrgDropDown: boolean;
  displayedEmployee: any;
  employeeElements: any;
  dropDownDisplayedEmployee: string;

  constructor(
    private appDataService: AppDataService,
    private apiDataService: ApiDataService,
    private authService: AuthService
  ) {

    this.displayOrgDropDown = false;
    this.dropDownDisplayedEmployee = 'Select Employee';

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
        this.waitingForOrgData = false;
        this.appDataService.$nestedOrgData = this.nestedOrgData;
        const t0 = performance.now();
        this.flatOrgData = this.flattenNestedOrgData($.extend(true, {}, this.nestedOrgData));
        const t1 = performance.now();
        console.log(`flatten org data took ${t1 - t0} milliseconds`);
        console.log('flattened org data');
        console.log(this.flatOrgData);
      },
      err => {
        console.log('error getting nested org data');
      }
    );
  }

  getDropDownStyle(): any {
    if (this.waitingForOrgData) {
      return {'background-color': 'rgb(245, 245, 245)', cursor: 'wait'};
    } else {
      return {'background-color': 'rgb(255, 255, 255)'};
    }
  }


  onOrgDropDownClick() {
    if (!this.waitingForOrgData) {
      if (!this.displayOrgDropDown) {
        if (this.nestedOrgData[0].numEmployees > 0) {
          this.nestedOrgData[0].showEmployees = true;
        }
        this.displayOrgDropDown = true;
        setTimeout(() => {
          this.employeeElements = $('div.emp-name');
        }, 0);
      } else {
        this.displayOrgDropDown = false;
        this.collapseOrg(this.nestedOrgData);
      }
    }
  }

  onclickedEmployeeIcon(employee) {
    this.expandCollapseOrg(this.nestedOrgData, employee.fullName, true);
  }

  onclickedEmployee(employee) {
    this.displayOrgDropDown = false;
    this.displayedEmployee = employee;
    this.dropDownDisplayedEmployee = employee.fullName;
    this.collapseOrg(this.nestedOrgData);
  }


  expandCollapseOrg(org: any, name: string, animate?: boolean) {

    for (const i in org) {
      if (typeof org[i] === 'object') {
        if (org[i].fullName === name) {
          if (animate) {
            if (!org[i].showEmployees) {
              org[i].showEmployees = !org[i].showEmployees;
              this.setEmployeeElements();
              this.animateExpandCollapse(org[i], true);
            } else {
              this.animateExpandCollapse(org[i], false);
              setTimeout(() => {
                org[i].showEmployees = !org[i].showEmployees;
                this.setEmployeeElements();
              }, 500);
            }
          } else {
            org[i].showEmployees = !org[i].showEmployees;
            this.setEmployeeElements();
          }
          return;
        } else if (org[i].employees) {
          this.expandCollapseOrg(org[i].employees, name, animate);
        }
      }
    }

  }

  setEmployeeElements() {
    setTimeout(() => {
      this.employeeElements = $('div.emp-name');
    }, 0);
  }

  animateExpandCollapse(employee: any, expand: boolean) {

    const $el = $(`div.team-cont.${employee.uid}`);
    if (expand) {
      $el.css({'max-height': '0', 'transition': 'max-height 0.35s ease-out'});
      setTimeout(() => {
        $el.css('max-height', `${32 * employee.numEmployees}px`);
      }, 0);
      setTimeout(() => {
        $el.css({'max-height': '', 'transition': ''});
      }, 500);
    } else {
      $el.css({'max-height': `${32 * employee.numEmployees}px`, 'transition': 'max-height 0.35s ease-in'});
      setTimeout(() => {
        $el.css('max-height', '0');
      }, 0);
      setTimeout(() => {
        $el.css({'max-height': '', 'transition': ''});
      }, 500);
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
    $('div.emp-name').css('left', -(1 + (indent * 15)));
    // const container = $('div.org-dropdown-cont');
    // container.scrollLeft(indent * 15);
    // container.animate({scrollLeft: indent * 15}, 100);

  }


  checkInView(elem, partial): boolean {
    const container = $('div.org-dropdown-cont');
    const contHeight = container.height();
    const contTop = container.scrollTop();
    const contBottom = contTop + contHeight ;

    if (!$(elem).offset()) {
      console.log('ERROR: cant find element');
      return false;
    }

    const elemTop = $(elem).offset().top - container.offset().top;
    const elemBottom = elemTop + $(elem).height();

    const isTotal = (elemTop >= 0 && elemBottom <= contHeight);
    const isPart = ((elemTop < 0 && elemBottom > 0 ) || (elemTop > 0 && elemTop <= container.height())) && partial;

    return isTotal || isPart;
  }


  flattenNestedOrgData(org: any): any {

    const flatOrgData: any[] = [];
    flattenOrgData(org);

    function flattenOrgData(org2: any) {
      for (const i in org2) {
        if (typeof org2[i] === 'object') {
          const employee = $.extend(true, {}, org2[i]);
          if (employee.hasOwnProperty('employees')) {
            delete employee.employees;
          }
          flatOrgData.push(employee);
          if (org2[i].employees) {
            flattenOrgData(org2[i].employees);
          }
        }
      }
    }

    return flatOrgData;

  }


}
