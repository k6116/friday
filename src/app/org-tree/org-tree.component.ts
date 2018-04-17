import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ApiDataService } from '../_shared/services/api-data.service';
import * as _ from 'lodash';
declare var $: any;

@Component({
  selector: 'app-org-tree',
  templateUrl: './org-tree.component.html',
  styleUrls: ['./org-tree.component.css', '../_shared/styles/tab-groups.css', '../_shared/styles/common.css'],
  encapsulation: ViewEncapsulation.None
})
export class OrgTreeComponent implements OnInit {

  employeeList: any;
  organizationFlat: any;
  organizationNested: any;
  subOrganization: any;
  employeeFullName: string;
  employeeEmail: string;

  constructor(
    private apiDataService: ApiDataService
  ) { }


  ngOnInit() {

    // this.employeeEmail = 'kristi_burgess@keysight.com';
    // this.onDisplayClick();

  }


  onDisplayClick() {
        if (this.employeeEmail) {
            this.apiDataService.getEmployeeData(this.employeeEmail)
              .subscribe(
                  res => {

                  this.employeeList =  JSON.parse('[' + res[0].json + ']');
                  console.log( this.employeeList);
                  this.expandCollapse(this.employeeList, this.employeeList[0].fullName);
                  },
                  err => {
                    console.log(err);
                  }
              );
            } else { this.employeeList = null; }
}

nodeFullNameClick(fullName) {
    console.log('Outer Event Reached: ' + fullName);
    this.employeeFullName = fullName;
    this.expandCollapse(this.employeeList, this.employeeFullName);
}



  expandCollapse(org: any, fullName: string) {

    for (const i in org) {
      if (typeof org[i] === 'object') {
        if (org[i].fullName === fullName) {
          console.log(`found manager name ${org[i].fullName}`);
          org[i].showEmployees = !org[i].showEmployees;
          console.log('org for this manager:');
          console.log(org[i]);
          return;
        } else {
          this.expandCollapse(org[i].employees, fullName);
        }
      }
    }

  }

  // BONUS DATA
   getManagerName(org: any, empName: string): string {

      let returnManagerName: string;
      loopThroughOrg(org);

   function loopThroughOrg(org2: any, managerName?: string) {
        for (const i in org2) {
          if (typeof org2[i] === 'object') {
            if (org2[i].fullName === empName) {
              returnManagerName = managerName;
            }
            if (org2[i].employees) {
              managerName = org2[i].fullName;
              loopThroughOrg(org2[i].employees, managerName);
            }
          }
        }
      }
      return returnManagerName;
    }

  onTestMaxLevelClick() {
    const maxLevel = this.getMaxOrgLevel(this.employeeList);
    console.log(`max level in org: ${maxLevel}`);
  }

  getMaxOrgLevel(org: any, displayedOnly?: boolean): number {

    let maxLevel = 0;
    loopThroughOrg(org);

    function loopThroughOrg(org2: any) {
      for (const i in org2) {
        if (typeof org2[i] === 'object') {
          // console.log(`employee name: ${org2[i].name}, level: ${org2[i].level}`);
          if (org2[i].level > maxLevel) {
            maxLevel = org2[i].level;
          }
          if (org2[i].employees && (displayedOnly ? org2[i].showEmployees : true)) {
            loopThroughOrg(org2[i].employees);
          }
        }
      }
    }
    return maxLevel;
  }

  onTestNumEmployeesClick() {
    const numEmployees = this.getNumEmployees(this.employeeList, this.employeeFullName);
    console.log(`number of employees for ${this.employeeFullName} is: ${numEmployees}`);
  }

  getNumEmployees(org: any, managerName: string, directOnly?: boolean): number {

    let numEmployees = 0;
    loopThroughOrg(org);

    function loopThroughOrg(org2: any, startCount?: boolean) {
      for (const i in org2) {
        if (typeof org2[i] === 'object') {
          // console.log(`employee name: ${org2[i].name}`);
          if (org2[i].name === managerName || startCount) {
            if (org2[i].employees) {
              numEmployees += org2[i].employees.length;
              // console.log(`current count is ${numEmployees}`);
              loopThroughOrg(org2[i].employees, true);
            }
          } else if (org2[i].employees) {
            loopThroughOrg(org2[i].employees, false);
          }
        }
      }
    }
    return numEmployees;
  }

  // number of employees all (array of objects)
  onTestNumEmployeesAllClick() {
    const directOnly = false;
    const t0 = performance.now();
    const empArr = this.getNumEmployeesAll(this.employeeList, directOnly);
    const t1 = performance.now();
    console.log(`number of employees (direct only set to ${directOnly}):`);
    console.log(empArr);
    console.log(`get number of employees took ${t1 - t0} milliseconds`);
  }

  getNumEmployeesAll(org: any, directOnly = true): any {

    const empArr: any[] = [];
    const that = this;
    loopThroughOrg(org);

    function loopThroughOrg(org2: any) {
      for (const i in org2) {
        if (typeof org2[i] === 'object') {
          // console.log(`employee name: ${org2[i].name}`);
          if (org2[i].employees) {
            empArr.push({
              name: org2[i].name,
              numEmployees: directOnly ? org2[i].employees.length : that.getNumEmployees(that.employeeList, org2[i].name),
              uid: org2[i].uid
            });
            loopThroughOrg(org2[i].employees);
          }
        }
      }
    }
    return empArr;
  }
}
