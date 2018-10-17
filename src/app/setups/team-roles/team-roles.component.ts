import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../_shared/services/auth.service';
import { ApiDataJobTitleService, ApiDataOrgService, ApiDataFteService } from '../../_shared/services/api-data/_index';
import { CacheService } from '../../_shared/services/cache.service';
import { ToolsService } from '../../_shared/services/tools.service';
import { NewRole } from './team-roles.interface';

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
  totalArray: any;

  // for jobtitle and subtiitle combobox
  jobTitles: any;           // List of jobtitles
  jobSubTitles: any;        // List of subtitles
  selectedJobTitle: any;    // Array with info of the jobtitle option
  newRoleInit: boolean;     // flag to reset combobox
  duplicateRole: boolean;   // validator when role is already in the list
  newRole: NewRole = {      // interface for adding new roles
    JobTitleID: null,
    JobTitleName: '',
    JobSubTitleID: null,
    JobSubTitleName: ''
  };
  loginAsEmail: string;
  displayAdminViewMessage: boolean;

  constructor(
    private authService: AuthService,
    private apiDataOrgService: ApiDataOrgService,
    private apiDataFteService: ApiDataFteService,
    private apiDataJobTitleService: ApiDataJobTitleService,
    private cacheService: CacheService,
    private toolsService: ToolsService
  ) {}

  async ngOnInit() {
    // get the token from local storage
    // NOTE: we can count on the token being there; if it is not, the user would have been logged out already
    // with the AuthGuardService on the main route
    const token = localStorage.getItem('jarvisToken');

    // check if user has special admin permissions for team FTEs
    // NOTE: this must be done synchronously using async / await
    const permRes = await this.apiDataFteService.checkTeamFTEAdminPermission(token);

    if (permRes.length > 0) {
      // this.loginAsEmail = this.authService.loggedInUser.managerEmailAddress;
      this.loginAsEmail = 'ethan_hunt@keysight.com';
      // this.loginAsEmail = 'ermina_chua@keysight.com';
      this.displayAdminViewMessage = true;
    } else {
      this.loginAsEmail = this.authService.loggedInUser.email;

    }

    this.initializeEmployeeData();
    this.getJobTitleList();
  }

  async initializeEmployeeData() {
    // Get Team Data - Manager and Employees
    this.teamOrgStructure = await this.getTeam(this.loginAsEmail);

    // Build email string of only employees
    await this.buildTeamEditableMembers();

    // Get nested and flat data for jobtitles/subtitles and their employees
    const employeesJobTitles = await this.getEmployeesJobTitles(this.teamEditableMembers);
    this.employeesJobTitlesNested = employeesJobTitles.nested;
    this.employeesJobTitlesFlat = employeesJobTitles.flat;

    // add jobTitles to the teamOrgStructure object
    for (let i = 0; i < this.teamOrgStructure.length; i++) {
      const fullName = this.teamOrgStructure[i].fullName.split(' ');
      this.teamOrgStructure[i].firstName = fullName[0];
      this.teamOrgStructure[i].lastName = fullName[1];
      this.teamOrgStructure[i].jobTitleID = null;
      this.teamOrgStructure[i].jobSubTitleID = null;
      this.teamOrgStructure[i].newUser = true;
      for (let j = 0; j < this.employeesJobTitlesFlat.length; j++) {
        // First if employee has job title, then add jobtitle data to teamOrgStructure
        // Else if employee has no job title, but exists in employees table, then just update job titles
        if (this.teamOrgStructure[i].emailAddress === this.employeesJobTitlesFlat[j]['Employees: EmailAddress']) {
          this.teamOrgStructure[i].jobTitleID = this.employeesJobTitlesFlat[j].JobTitleID;
          this.teamOrgStructure[i].jobSubTitleID = this.employeesJobTitlesFlat[j].JobSubTitleID;
          this.teamOrgStructure[i].newUser = false;
          break;
        } else if (j === this.employeesJobTitlesFlat.length - 1 && this.teamOrgStructure[i].employeeID !== null) {
            this.teamOrgStructure[i].newUser = false;
        }
      }
    }
  }

  async getTeam(email: string): Promise<any> {
    // get list of subordinates
    return await this.apiDataOrgService.getEmployeeList(email).toPromise();
  }

  async getEmployeesJobTitles(emailList: string): Promise<any> {
    return await this.apiDataJobTitleService.indexEmployeesJobTitles(emailList).toPromise();
  }

  async buildTeamEditableMembers(): Promise<any> {
    this.teamEditableMembers = '';
    // build the string of employee email address to use as a parameter for the SP resources.DisplayTeamFTE
    for (let i = 0; i < this.teamOrgStructure.length; i++) {
      this.teamEditableMembers = this.teamOrgStructure[i].emailAddress + '\',\'' + this.teamEditableMembers;
    }
    this.teamEditableMembers = this.teamEditableMembers.substr(0, this.teamEditableMembers.lastIndexOf(','));
    this.teamEditableMembers = '\'\'' + this.teamEditableMembers + '\'';
  }

  onSelectChange(indexJT: number, indexEmp: number, jobTitle: any) {
    this.teamOrgStructure[indexEmp].jobTitleID = jobTitle.JobTitleID;
    this.teamOrgStructure[indexEmp].jobSubTitleID = jobTitle.JobSubTitleID;
  }

  getJobTitleList() {
    this.duplicateRole = false; // set flag to initiale value
    this.apiDataJobTitleService.getJobTitleList()
      .subscribe(
        res => { this.jobTitles = res; },
        err => { console.log(err); }
      );
  }

  onJobTitleChange(event: any) {
    // value is the index of the option list; null means no jobtitle is selected
    const eventTarget = event.target.value;

    if (eventTarget !== 'null') {
      this.selectedJobTitle = this.jobTitles[eventTarget];
      this.jobSubTitles = this.selectedJobTitle.jobSubTitles;
      // assign ID and name to newRole
      this.newRole.JobTitleID = this.selectedJobTitle.id;
      this.newRole.JobTitleName = this.selectedJobTitle.jobTitleName;
      // reset subtitles in newRole
      this.newRole.JobSubTitleID = null;
      this.newRole.JobSubTitleName = null;
    } else {
      // clear subtitle list
      this.jobSubTitles = null;
      // reset all values in newRole
      this.newRole.JobTitleID = null;
      this.newRole.JobTitleName = null;
      this.newRole.JobSubTitleID = null;
      this.newRole.JobSubTitleName = null;

    }
    // set flag to false so option doesn't jump to default
    this.newRoleInit = false;
  }

  onJobSubTitleChange(event: any) {
    // value is the index of the option list; null means no subtitle is selected
    const eventTarget = event.target.value;
    if (eventTarget !== 'null') {
      // find the subtitle from list
      const selectedJobSubTitle = this.selectedJobTitle.jobSubTitles[eventTarget];
      // assign id and name to newRole
      this.newRole.JobSubTitleID = selectedJobSubTitle.id;
      this.newRole.JobSubTitleName = selectedJobSubTitle.jobSubTitleName;
    } else {
      // clear subtitle in newRole
      this.newRole.JobSubTitleID = null;
      this.newRole.JobSubTitleName = null;
    }

    // VALIDATION: Check if selected role already exists in list (nested employeesJobTitles)
    const rolesFilter = this.employeesJobTitlesNested.filter(item =>
      item.JobTitleID === this.newRole.JobTitleID && item.JobSubTitleID === this.newRole.JobSubTitleID)[0];

    // If role doesn't exist the roles filter will be undefined => Good to add new role to list
    if (rolesFilter === undefined) {
      this.duplicateRole = false;
    } else {
      // set duplicateRole flag so the red boxes appear and the green add button doesn't show up
      this.duplicateRole = true;
      // remove subtitle values from newRole so it can't be added
      this.newRole.JobSubTitleID = null;
      this.newRole.JobSubTitleName = null;
    }
  }

  onAddNewRoleClick() {
    // add newRole values to main list
    this.employeesJobTitlesNested.push({
      JobTitleID: this.newRole.JobTitleID,
      JobTitleName: this.newRole.JobTitleName,
      JobSubTitleID: this.newRole.JobSubTitleID,
      JobSubTitleName: this.newRole.JobSubTitleName,
    });
    // reset newRole and flags
    this.initNewRole();
  }

  initNewRole() {
    this.newRole.JobTitleID = null;
    this.newRole.JobTitleName = null;
    this.newRole.JobSubTitleID = null;
    this.newRole.JobSubTitleName = null;
    // option box shows initial value null
    this.newRoleInit = true;
    // reset validation flag
    this.duplicateRole = false;
  }

  onSaveClick() {
     // call the api data service to send the put request
     this.apiDataJobTitleService.updateEmployeesJobTitlesBulk(this.teamOrgStructure, this.authService.loggedInUser.id)
     .subscribe(
       res => {
         this.cacheService.raiseToast('success', res.message);
         this.initializeEmployeeData();
         this.initNewRole();
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
    console.log('this.teamOrgStructure', this.teamOrgStructure);
    console.log('teamOrgStructure', this.teamOrgStructure);
  }

}

