import { Injectable } from '@angular/core';
import { ApiDataOrgService } from '../../_shared/services/api-data/_index';

declare var $: any;

@Injectable()
export class DashboardTeamSelectService {

  managerData: any;
  nestedManagerData: any;

  constructor(
    private apiDataOrgService: ApiDataOrgService
  ) { }


  getManagementOrgStructure() {

    this.apiDataOrgService.getManagementOrgStructure('soon-chai_gooi@keysight.com')
      .subscribe(
        res => {
          console.log('response from get management org structure:');
          console.log(res);

          const t0 = performance.now();
          this.copyIntoNewArray(res);
          const t1 = performance.now();
          console.log(`copy into new array took ${t1 - t0} milliseconds`);

          const t2 = performance.now();
          this.buildNestedManagerData();
          const t3 = performance.now();
          console.log(`build nested manager data took ${t3 - t2} milliseconds`);

        },
        err => {
          console.error(err);
        }
      );

  }

  // copy the raw response from the stored procedure into a new array of objects
  // with select properties with the proper names
  copyIntoNewArray(res: any) {

    this.managerData = [];

    let uid = 0;

    res.forEach(manager => {

      const newManager = {
        uid: uid,
        personID: manager.PERSON_ID,
        employeeID: manager.EmployeeID,
        fullName: manager.fullName,
        emailAddress: manager.EMAIL_ADDRESS,
        supervisorID: manager.SUPERVISOR_ID,
        // supervisorEmailAddress: manager.
        level: manager.Level
      };

      this.managerData.push(newManager);

      uid++;

    });

    console.log('new manager data array:');
    console.log(this.managerData);


    // EMAIL_ADDRESS: "shidah_ahmad@keysight.com"
    // EmployeeID: 2704
    // FIRST_NAME: "NOORASHIDAH (SHIDAH)"
    // LAST_NAME: "AHMAD"
    // Level: 1
    // PERSON_ID: 5790
    // ParentTree: "Shidah Ahmad"
    // SUPERVISOR_FIRST_NAME: "SOON CHAI"
    // SUPERVISOR_FULL_NAME: "GOOI, SOON CHAI"
    // SUPERVISOR_ID: 5786
    // SUPERVISOR_LAST_NAME: "GOOI"
    // TeamName: "Order Fulfillment"
    // fullName: "Shidah Ahmad"


    // 'uid':7671,
    // 'personID':111281,
    // 'employeeID':179,
    // 'fullName':'Arash Ghanadan',
    // 'emailAddress':'arash_ghanadan@keysight.com',
    // 'supervisorID':167759,
    // 'supervisorEmailAddress':'trevor_buehl@keysight.com',
    // 'level':5,
    // 'numEmployees':7,
    // 'showEmployees':false,
    // 'employees: []

  }

  buildNestedManagerData() {

    this.nestedManagerData = $.extend(true, {}, this.managerData[0]);

    this.buildNestedData(this.nestedManagerData);

    console.log('nested manager data:');
    console.log(this.nestedManagerData);

  }


  buildNestedData(manager: any) {

    // filter to get employees where employee's supervisorID equals manager's personID
    const employees = this.managerData.filter(employee => {
      return employee.supervisorID === manager.personID;
    });

    // console.log(`employees for manager ${manager.fullName}:`);
    // console.log(employees);

    if (employees.length) {
      manager.numEmployees = employees.length;
      manager.showEmployees = false;
      manager.employees = employees;

      employees.forEach(employee => {
        this.buildNestedData(employee);
      });
    }

  }

}
