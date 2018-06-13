import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

import { AppDataService } from '../../_shared/services/app-data.service';
import { ApiDataService } from '../../_shared/services/api-data.service';
import { ApiDataOrgService } from '../../_shared/services/api-data/_index';
import { AuthService } from '../../_shared/services/auth.service';

import * as Highcharts from 'highcharts';

declare var require: any;
declare var $: any;

require('highcharts/modules/exporting')(Highcharts);
require('highcharts/modules/export-data')(Highcharts);

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
  displayResults: boolean;
  employeeElements: any;
  dropDownDisplayedEmployee: string;
  quarterlyEmployeeFTETotals: any;
  currentFiscalQuarter: number;
  currentFiscalYear: number;

  // temp properties for testing
  manager: any;
  managerString: string;
  employees: any;
  employeesString: string;
  teamMembers: any;
  teamMembersString: string;


  constructor(
    private appDataService: AppDataService,
    private apiDataService: ApiDataService,
    private apiDataOrgService: ApiDataOrgService,
    private authService: AuthService
  ) {

    this.displayOrgDropDown = false;
    this.dropDownDisplayedEmployee = 'Loading...';

  }


  ngOnInit() {


    if (this.appDataService.$nestedOrgData) {
      this.nestedOrgData = this.appDataService.$nestedOrgData;
      this.appDataService.nestedOrgDataCached = true;
      // console.log('nested org data picked up in employee reports');
      // console.log(this.nestedOrgData);
      this.waitingForOrgData = false;
      this.setInitialDropDownEmployee();
      this.appDataService.nestedOrgDataRequested = undefined;
    }

    this.subscription1 = this.appDataService.nestedOrgData.subscribe(
      (nestedOrgData: any) => {
        if (!this.appDataService.nestedOrgDataCached) {
          this.nestedOrgData = nestedOrgData;
          this.appDataService.$nestedOrgData = nestedOrgData;
          this.appDataService.nestedOrgDataCached = true;
          // console.log('nested org data received in employee reports component via subscription');
          // console.log(this.nestedOrgData);
          this.waitingForOrgData = false;
          this.setInitialDropDownEmployee();
          this.appDataService.nestedOrgDataRequested = undefined;
        }
    });

    if (!this.appDataService.nestedOrgDataRequested && !this.appDataService.nestedOrgDataCached) {
      // get logged in user's info
      this.authService.getLoggedInUser((user, err) => {
        // this.getNestedOrgData(user.email);
        // this.getNestedOrgData('ron_nersesian@keysight.com');
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
    this.apiDataOrgService.getOrgData(email)
    .subscribe(
      res => {
        const nestedOrgData = JSON.parse('[' + res[0].json + ']');
        // console.log('nested org object retrieved from api data service in employee reports component');
        // console.log(nestedOrgData);
        this.nestedOrgData = nestedOrgData;
        this.waitingForOrgData = false;
        this.appDataService.$nestedOrgData = this.nestedOrgData;
        this.appDataService.nestedOrgDataCached = true;
        this.setInitialDropDownEmployee();
        const t0 = performance.now();
        this.flatOrgData = this.flattenNestedOrgData($.extend(true, {}, this.nestedOrgData));
        const t1 = performance.now();
        // console.log(`flatten org data took ${t1 - t0} milliseconds`);
        // console.log('flattened org data');
        // console.log(this.flatOrgData);
      },
      err => {
        console.error('error getting nested org data');
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


  setInitialDropDownEmployee() {
    this.dropDownDisplayedEmployee = this.nestedOrgData[0].fullName;
    this.displayedEmployee = this.nestedOrgData[0];
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
    console.log('displayed employee');
    console.log(this.displayedEmployee);

    this.manager = this.getManager(this.nestedOrgData, employee);
    // console.log('manager:');
    // console.log(this.manager);

    this.managerString = this.manager ? `${this.manager.fullName} (id: ${this.manager.employeeID})` : 'No Manager in Org Structure';

    if (this.manager) {
      this.teamMembersString = this.buildCoworkersString(this.manager);
    } else {
      this.teamMembersString = undefined;
    }

    this.employees = this.getEmployees(this.nestedOrgData, employee);
    // console.log('employees:');
    // console.log(this.employees);

    this.employeesString = this.buildEmployeesString(this.employees);


    this.displayResults = true;

    this.dropDownDisplayedEmployee = employee.fullName;
    this.collapseOrg(this.nestedOrgData);

    // console.log('manager data:');
    // console.log(manager);

    setTimeout(() => {
      console.log('Employee ' + this.displayedEmployee.employeeID);
      this.getQuarterlyEmployeeFTETotals();
    }, 0);

  }


  expandCollapseOrg(org: any, name: string, animate?: boolean) {

    for (const i in org) {
      if (typeof org[i] === 'object') {
        if (org[i].fullName === name) {
          if (animate) {
            if (!org[i].showEmployees) {
              org[i].showEmployees = !org[i].showEmployees;
              this.setEmployeeElements();
              // this.setIndent();
              this.animateExpandCollapse(org[i], true);
            } else {
              this.animateExpandCollapse(org[i], false);
              setTimeout(() => {
                org[i].showEmployees = !org[i].showEmployees;
                this.setEmployeeElements();
                // this.setIndent();
              }, 500);
            }
          } else {
            org[i].showEmployees = !org[i].showEmployees;
            this.setEmployeeElements();
            // this.setIndent();
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
      $el.css(
        {
          'max-height': '0',
          // '-webkit-transition': 'max-height 0.35s ease-out',
          // '-moz-transition': 'max-height 0.35s ease-out',
          // '-o-transition': 'max-height 0.35s ease-out',
          'transition': 'max-height 0.35s ease-out'
        }
      );
      setTimeout(() => {
        $el.css('max-height', `${32 * employee.numEmployees}px`);
      }, 0);
      setTimeout(() => {
        $el.css({'max-height': '', 'transition': ''});
      }, 500);
    } else {
      $el.css(
        {
          'max-height': `${32 * employee.numEmployees}px`,
          // '-webkit-transition': 'max-height 0.35s ease-in',
          // '-moz-transition': 'max-height 0.35s ease-in',
          // '-o-transition': 'max-height 0.35s ease-in',
          'transition': 'max-height 0.35s ease-in'
        }
      );
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
    this.setIndent();
  }


  setIndent() {
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
    $('div.org-dropdown-cont-inner').css('left', -(1 + (indent * 15)));
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
      console.error('cant find element');
      return false;
    }

    const elemTop = $(elem).offset().top - container.offset().top;
    const elemBottom = elemTop + $(elem).height();

    const isTotal = (elemTop >= 0 && elemBottom <= contHeight);
    const isPart = ((elemTop < 0 && elemBottom > 0 ) || (elemTop > 0 && elemTop <= container.height())) && partial;

    return isTotal || isPart;
  }


  onClickOutside(clickedElement) {
    this.displayOrgDropDown = false;
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


  getManager(org: any, employee: any): any {

    let manager: any;
    findManager(org, employee);

    function findManager(org2: any, employee2: any) {
      for (const i in org2) {
        if (typeof org2[i] === 'object') {
          if (org2[i].personID === employee2.supervisorID) {
            manager = org2[i];
            return;
          }
          if (org2[i].employees) {
            findManager(org2[i].employees, employee2);
          }
        }
      }
    }

    return manager;

  }


  getEmployees(org: any, employee: any): any {

    const employees: any[] = [];
    findEmployees(org, employee);

    function findEmployees(org2: any, employee2: any) {
      for (const i in org2) {
        if (typeof org2[i] === 'object') {
          if (org2[i].personID === employee2.personID) {
            if (org2[i].hasOwnProperty('employees')) {
              org2[i].employees.forEach(employee3 => {
                const empCopy = $.extend(true, {}, employee3);
                if (empCopy.hasOwnProperty('employees')) {
                  delete empCopy.employees;
                }
                employees.push(empCopy);
              });
            }
            return;
          }
          if (org2[i].employees) {
            findEmployees(org2[i].employees, employee2);
          }
        }
      }
    }

    return employees;

  }


  // TEMP CODE: build string of co-workers for the selected employee
  buildCoworkersString(manager): string {
    const teamArr: string[] = [];
    if (manager.hasOwnProperty('employees')) {
      manager.employees.forEach(employee => {
        teamArr.push(`${employee.fullName} (id: ${employee.employeeID})`);
      });
    }
    return teamArr.join(', ');
  }

  // TEMP CODE: build string of employees for the selected employee
  buildEmployeesString(employees): string {
    const empArr: string[] = [];
    employees.forEach(employee => {
      empArr.push(`${employee.fullName} (id: ${employee.employeeID})`);
    });
    return empArr.length ? empArr.join(', ') : '';
  }

  getQuarterlyEmployeeFTETotals() {

    // Convert current month to fiscal quarter
    const date = new Date();

    if (date.getMonth() === 10 || date.getMonth() === 11 || date.getMonth() === 0) {
      this.currentFiscalQuarter = 1;
    } else if (date.getMonth() === 1 || date.getMonth() === 2 || date.getMonth() === 3) {
      this.currentFiscalQuarter = 2;
    } else if (date.getMonth() === 4 || date.getMonth() === 5 || date.getMonth() === 6) {
      this.currentFiscalQuarter = 3;
    } else if (date.getMonth() === 7 || date.getMonth() === 8 || date.getMonth() === 9) {
      this.currentFiscalQuarter = 4;
    }

    this.currentFiscalYear = date.getFullYear();

    // Retrieve employee FTE aggregate data for a specific quarter and year
    this.apiDataService.getQuarterlyEmployeeFTETotals(this.displayedEmployee.employeeID, this.currentFiscalQuarter, this.currentFiscalYear)
      .subscribe(
        res => {
          this.quarterlyEmployeeFTETotals = res;
          console.log('Project FTE List: ',  this.quarterlyEmployeeFTETotals);
          this.employeeProjectChart();
        },
        err => {
          console.log(err);
        }
      );
  }

  employeeProjectChart() {

    // Employee FTE in Pie Chart
    Highcharts.chart('employeeProjectChart', {
      chart: {
          plotBackgroundColor: null,
          plotBorderWidth: null,
          plotShadow: false,
          type: 'pie'
      },
      title: {
          text: this.displayedEmployee.fullName + 'Current Quarter FTE'
      },
      tooltip: {
          pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
      },
      plotOptions: {
          pie: {
              allowPointSelect: true,
              cursor: 'pointer',
              dataLabels: {
                  enabled: true,
                  format: '<b>{point.name}</b>: {point.percentage:.1f} %',
                  // style: {
                  //     color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
                  // }
              }
          }
      },
      series: [{
          data: this.quarterlyEmployeeFTETotals
      }]
    });

  }

}
