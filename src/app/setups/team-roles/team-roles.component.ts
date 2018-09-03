import { Component, OnInit } from '@angular/core';

import { AuthService } from '../../_shared/services/auth.service';
import { ApiDataJobTitleService, ApiDataOrgService } from '../../_shared/services/api-data/_index';
import { CacheService } from '../../_shared/services/cache.service';
import { ToolsService } from '../../_shared/services/tools.service';

@Component({
  selector: 'app-team-roles',
  templateUrl: './team-roles.component.html',
  styleUrls: ['./team-roles.component.css', '../../_shared/styles/common.css']
})
export class TeamRolesComponent implements OnInit {

  employeesJobTitlesNested: any;
  employeesJobTitlesFlat: any;
  teamOrgStructure: any;
  teamEditableMembers: any;
  allEmployees: any;
  totalArray: any;

  constructor(
    private authService: AuthService,
    private apiDataOrgService: ApiDataOrgService,
    private apiDataJobTitleService: ApiDataJobTitleService,
    private cacheService: CacheService,
    private toolsService: ToolsService
  ) {
  }

  ngOnInit() {
    this.initializeEmployeeData();
  }

  async initializeEmployeeData() {
    // Get Team Data - Manager and Employees
    const teamOrgStructure = await this.getTeam('ethan_hunt@keysight.com');
    this.teamOrgStructure = JSON.parse('[' + teamOrgStructure[0].json + ']')[0];

    this.allEmployees = this.teamOrgStructure.employees;

    // Build email string of only employees
    await this.buildTeamEditableMembers();

    // Get nested and flat data for jobtitles/subtitles and their employees
    const employeesJobTitles = await this.getEmployeesJobTitles(this.teamEditableMembers);
    this.employeesJobTitlesNested = employeesJobTitles.nested;
    this.employeesJobTitlesFlat = employeesJobTitles.flat;

    // add jobTitle to allEmployees
    for (let i = 0; i < this.allEmployees.length; i++) {
      for (let j = 0; j < this.employeesJobTitlesFlat.length; j++) {
        const fullName = this.allEmployees[i].fullName.split(' ');
        this.allEmployees[i].firstName = fullName[0];
        this.allEmployees[i].lastName = fullName[1];
        if (this.allEmployees[i].emailAddress === this.employeesJobTitlesFlat[j]['Employees: EmailAddress']) {
          this.allEmployees[i].jobTitleID = this.employeesJobTitlesFlat[j].JobTitleID;
          this.allEmployees[i].jobSubTitleID = this.employeesJobTitlesFlat[j].JobSubTitleID;
          this.allEmployees[i].newUser = false;
          break;
        } else if (j === this.employeesJobTitlesFlat.length - 1) {
          this.allEmployees[i].jobTitleID = null;
          this.allEmployees[i].jobSubTitleID = null;
          this.allEmployees[i].newUser = true;
        }
      }
    }
  }

  async getTeam(email: string): Promise<any> {
    // get list of subordinates
    return await this.apiDataOrgService.getOrgData(email).toPromise();
  }

  async getEmployeesJobTitles(emailList: string): Promise<any> {
    return await this.apiDataJobTitleService.indexEmployeesJobTitles(emailList).toPromise();
  }

  async buildTeamEditableMembers(): Promise<any> {
    this.teamEditableMembers = '';
    // build the string of employee email address to use as a parameter for the SP resources.DisplayTeamFTE
    for (let i = 0; i < this.allEmployees.length; i++) {
      this.teamEditableMembers = this.allEmployees[i].emailAddress + '\',\'' + this.teamEditableMembers;
    }
    this.teamEditableMembers = this.teamEditableMembers.substr(0, this.teamEditableMembers.lastIndexOf(','));
    this.teamEditableMembers = '\'\'' + this.teamEditableMembers + '\'';
  }

  onSelectChange(indexJT: number, indexEmp: number, jobTitle: any) {
    console.log('jobTitle', jobTitle);
    console.log('indexJT: ' + indexJT + ', indexEmp: ' + indexEmp);

    this.allEmployees[indexEmp].jobTitleID = jobTitle.JobTitleID;
    this.allEmployees[indexEmp].jobSubTitleID = jobTitle.JobSubTitleID;

  }

  onSaveClick() {

     // call the api data service to send the put request
     this.apiDataJobTitleService.updateEmployeesJobTitlesBulk(this.allEmployees, this.authService.loggedInUser.id)
     .subscribe(
       res => {
         this.cacheService.raiseToast('success', res.message);
         this.initializeEmployeeData();
       },
       err => {
         console.log(err);
         this.cacheService.raiseToast('error', `${err.status}: ${err.statusText}`);
       }
     );

  }

  onTestFormClick() {
    console.log('this.employeesJobTitlesNested', this.employeesJobTitlesNested);
    console.log('this.employeesJobTitlesFlat', this.employeesJobTitlesFlat);
    console.log('this.allEmployees', this.allEmployees);
  }

}

