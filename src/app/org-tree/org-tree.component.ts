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
  displayOrg: boolean;
  employeeName: string;

  constructor(
    private apiDataService: ApiDataService
  ) { }


  ngOnInit() {
    // click on name and display assigne projects and FTW from resources.ProjectEmployees
    // this.organization = [
    //   {
    //     name: 'Patrick B Harper',
    //     managerName: 'Shidah Ahmad',
    //     level: 0,
    //     uid: 1,
    //     showEmployees: true,
    //     employees: [
    //       {
    //         name: 'Nitin Aery',
    //         managerName: 'Patrick B Harper',
    //         manager: false,
    //         level: 1,
    //         uid: 2,
    //         mgruid: 1,
    //       },
  }


  onDisplayClick() {

    this.displayOrg = true;
    const managerEmailAddress = 'ethan_hunt@keysight.com';

    this.apiDataService.getOrgData(managerEmailAddress)
      .subscribe(
          res => {

            this.employeeList = res;


           //  this.organizationNested = this.getNestedOrgData(this.employeeList, supervisorID); // 21938 22286 4551
            //  console.log('Nested Employee List:');
            //  console.log(this.organizationNested);

            // this.organizationNested.sort(function(a, b) {
            //     if (a.items === undefined) {
            //       return 1;
            //     } else {
            //       return -1;
            //     }
            // });

           // this.items = [{label: this.employeeList[0].EMAIL_ADDRESS, items: this.testData}];

          },
          err => {
            console.log(err);
          }
      );

  }

  getNestedOrgData(arr, parent) {
    const out = [];
    for (const i in arr) {
        if (arr[i].SUPERVISOR_ID === parent) {
            const directReports = this.getNestedOrgData(arr, arr[i].PERSON_ID);
            if (directReports.length) {
                arr[i].directReports = directReports;
            }
            // out.push(arr[i])
            out.push({label: arr[i].EMAIL_ADDRESS, items: arr[i].directReports, level: arr[i].Level, show: true});
        }
      }
    return out;
  }





  logUserDetails(name: string, address: string, opts?: any) {
    console.log(`${name} lives at ${address}, phone number is: ${opts.phone ? opts.phone : 'not known'}`);
    console.log(`hobbies include ${opts.hobbies}`);
  }

  onTestFlatToNested() {
    console.log('number of employees to loop through:');
    console.log(this.organizationFlat.length);
    const t0 = performance.now();
    const nestedOrg = this.buildNestedOrg(this.organizationFlat, 'pat_harper@keysight.com');
    const t1 = performance.now();
    console.log(`flat to nested method took ${t1 - t0} milliseconds`);
    console.log('nested organization:');
    console.log(nestedOrg);
  }


  buildNestedOrg(org: any, email: string): any {

    const topLevelEmail = email;
    const nestedOrg: any[] = [];

    // build the first level of the nested org array of objects (json-like structure)
    nestedOrg.push(org[0]);
    // const reports = org.filter(emp => {
    //   return emp.supervisorID === org[0].personID;
    // })
    // nestedOrg[0].employees = reports;

    // loop through the nested org (also pass the entire org structure to find employees)
    loopThroughOrg(org);

    function loopThroughOrg(org2: any) {  // email?: string
      for (const i in org2) {
        if (typeof org2[i] === 'object') {
          loopThroughNestedOrg(nestedOrg, org2, org2[i].emailAddress);
        }
      }
    }

    function loopThroughNestedOrg(org3: any, orgAll: any, emailInner?: string) {
      // console.log(`looping through nested org looking for email ${email}`);
      for (const i in org3) {
        if (typeof org3[i] === 'object') {
          // console.log(`inspecting person with email: ${org3[i].emailAddress}`);
          if (org3[i].emailAddress === emailInner) {
            // console.log(`found match for: ${org3[i].emailAddress}`);
            const reports = orgAll.filter(emp => {
              return emp.supervisorID === org3[i].personID;
            });
            if (reports.length) {
              org3[i].employees = reports;
            }
            return;
          // find the person in the nestedOrg array (json like structure)
          // will need recursion here
          } else if (org3[i].employees) {
            // console.log('didnt find match at this level, recursing now');
            loopThroughNestedOrg(org3[i].employees, orgAll, emailInner);
          }
        }
      }


    }

    return nestedOrg;

  }




  // SUB-ORGANIZATION TESTING

  onTestSubOrganization() {
    const t0 = performance.now();
    this.subOrganization = this.getSubOrg(this.employeeList, this.employeeName);
    const t1 = performance.now();
    console.log(`sub organization method took ${t1 - t0} milliseconds`);
    console.log('sub organization:');
    console.log(this.subOrganization);
  }

  getSubOrg(org: any, name: string): any {

    let subOrg: any;
    loopThroughOrg(org);

    function loopThroughOrg(org2: any) {
      for (const i in org2) {
        if (typeof org2[i] === 'object') {
          if (org2[i].name === name) {
            subOrg = org2[i];
            return;
          } else if (org2[i].employees) {
            loopThroughOrg(org2[i].employees);
          }
        }
      }
    }

    return subOrg;

  }



  // EXPAND / COLLAPSE TESTING

  onExpandCollapse() {
    console.log('employee/manager name is: ' + this.employeeName);
    // const org = this.organization;
    this.expandCollapse(this.employeeList, this.employeeName);
  }

  expandCollapse(org: any, name: string) {

    for (const i in org) {
      if (typeof org[i] === 'object') {
        // console.log(`looking at name ${org[i].name}`);
        // console.log(org[i]);
        if (org[i].name === name) {
          console.log(`found manager name ${org[i].name}`);
          org[i].showEmployees = !org[i].showEmployees;
          console.log('org for this manager:');
          console.log(org[i]);
          return;
        } else {
          this.expandCollapse(org[i].employees, name);
        }
      }
    }

  }



  // OPTIONAL PARAMETERS




  // EVENT TESTING

  onNameContClick(event) {
    console.log('name container click event triggered');
  }

  onFormGroupClick(event) {
    console.log('form group container click event triggered');
  }


  onTestClick(event) {
    console.log('button click event triggered');
    // event.stopPropagation();
  }

  onTestMouseDown(event) {
    console.log('button mouse down event triggered');
    // event.preventDefault();
    // event.stopPropagation();
  }

  onTestMouseUp(event) {
    console.log('button mouse up event triggered');
    // event.stopPropagation();
  }

  onTestKeyDown(event) {
    console.log('input key down event triggered');
    // event.stopImmediatePropagation();
  }

  onTestKeyPress(event) {
    console.log('input key press event triggered');
  }

  onTestKeyUp(event) {
    console.log('input key up event triggered');
  }


  // RECURSION TESTING

  // factorial
  onTestFactorialClick() {
    const num = 5;
    const factorialResult = this.factorial(num);
    console.log(`factorial of ${num} is: ${factorialResult}`);
  }

  factorial(n): number {
    // base case (prevent overflow)
    if (n === 0) {
      return 1;
    }
    // recursive case
    return n * this.factorial(n - 1);
  }



  // max level in org structure
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



  // number of employees
  onTestNumEmployeesClick() {
    const numEmployees = this.getNumEmployees(this.employeeList, this.employeeName);
    console.log(`number of employees for ${this.employeeName} is: ${numEmployees}`);
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



  // manager name
  onTestManagerNameClick() {
    const managerName = this.getManagerName(this.employeeList, this.employeeName);
    console.log(`manager for ${this.employeeName} is ${managerName}`);
  }

  getManagerName(org: any, empName: string): string {

    let returnManagerName: string;
    loopThroughOrg(org);

    function loopThroughOrg(org2: any, managerName?: string) {
      for (const i in org2) {
        if (typeof org2[i] === 'object') {
          if (org2[i].name === empName) {
            returnManagerName = managerName;
          }
          if (org2[i].employees) {
            managerName = org2[i].name;
            loopThroughOrg(org2[i].employees, managerName);
          }
        }
      }
    }

    return returnManagerName;

  }
}
