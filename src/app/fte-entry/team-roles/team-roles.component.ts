import { Component, OnInit } from '@angular/core';
import { FormGroup, FormArray, FormControl, Validators, FormBuilder } from '@angular/forms';

import { AuthService } from '../../_shared/services/auth.service';
import { ApiDataProjectService, ApiDataFteService, ApiDataJobTitleService,
  ApiDataOrgService } from '../../_shared/services/api-data/_index';
import { CacheService } from '../../_shared/services/cache.service';
import { ToolsService } from '../../_shared/services/tools.service';

import { JobTitleModel, EmployeesArray} from './role-model';

@Component({
  selector: 'app-team-roles',
  templateUrl: './team-roles.component.html',
  styleUrls: ['./team-roles.component.css', '../../_shared/styles/common.css']
})
export class TeamRolesComponent implements OnInit {

  FTEFormGroup: FormGroup;
  display: boolean; // TODO: find a better solution to FTE display timing issue
  displayFTETable = false;
  jobTitleList: any;
  employees: any;
  employeesJobTitles: any;
  employeesJobTitlesNested: any;
  employeesJobTitlesFlat: any;
  teamOrgStructure: any;
  teamEditableMembers: any;
  FTEFormGroupLive: any;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private apiDataProjectService: ApiDataProjectService,
    private apiDataFteService: ApiDataFteService,
    private apiDataOrgService: ApiDataOrgService,
    private apiDataJobTitleService: ApiDataJobTitleService,
    private cacheService: CacheService,
    private toolsService: ToolsService
  ) {
    // initialize the FTE formgroup
    this.FTEFormGroup = this.fb.group({
      FTEFormArray: this.fb.array([])
    });
  }

  async ngOnInit() {
    this.initializeEmployeeData();
  }

  async initializeEmployeeData() {
    // Get Team Data - Manager and Employees
    this.teamOrgStructure = await this.getTeam('ethan_hunt@keysight.com');
    this.teamOrgStructure = JSON.parse('[' + this.teamOrgStructure[0].json + ']')[0];

    // Get employees only
    await this.buildEmployeesArray();

    // Build email string of only employees
    await this.buildTeamEditableMembers();

    // Get nested and flat data for jobtitles/subtitles and their employees
    this.employeesJobTitles = await this.getEmployeesJobTitles(this.teamEditableMembers);
    this.employeesJobTitlesNested = this.employeesJobTitles.nested;
    this.employeesJobTitlesFlat = this.employeesJobTitles.flat;

    this.buildForm();

    const FTEFormArray = <FormArray>this.FTEFormGroup.controls.FTEFormArray;
    this.jobTitleList = FTEFormArray.controls;
  }

  async getTeam(email: string): Promise<any> {
    // get list of subordinates
    return await this.apiDataOrgService.getOrgData(email).toPromise();
  }

  async buildEmployeesArray(): Promise<any> {
    this.employees = [];
    for (let i = 0; i < this.teamOrgStructure.employees.length; i++) {
      this.employees.push({
        employeeID: this.teamOrgStructure.employees[i].employeeID,
        fullName: this.teamOrgStructure.employees[i].fullName,
        emailAddress: this.teamOrgStructure.employees[i].emailAddress
      });
    }
  }

  async getEmployeesJobTitles(emailList: string): Promise<any> {
    return await this.apiDataJobTitleService.indexEmployeesJobTitles(emailList).toPromise();
  }

  async buildTeamEditableMembers(): Promise<any> {
    // build the string of employee email address to use as a parameter for the SP resources.DisplayTeamFTE
    for (let i = 0; i < this.employees.length; i++) {
      this.teamEditableMembers = this.employees[i].emailAddress + '\',\'' + this.teamEditableMembers;
    }
    this.teamEditableMembers = this.teamEditableMembers.substr(0, this.teamEditableMembers.lastIndexOf(','));
    this.teamEditableMembers = '\'\'' + this.teamEditableMembers + '\'';
  }

  buildForm() {
    this.FTEFormGroup = this.fb.group({
      FTEFormArray: this.fb.array([])
    });
    // grab the Project formarray
    const FTEFormArray = <FormArray>this.FTEFormGroup.controls.FTEFormArray;

    this.toolsService.clearFormArray(FTEFormArray); // remove any existing form groups in the array

    // loop through each project to get into the FTE entry elements
    this.employeesJobTitlesNested.forEach( (jobTitle: JobTitleModel) => {
      this.addJobTitleToForm(FTEFormArray, jobTitle, false);
    });

  }

  addJobTitleToForm(FTEFormArray: FormArray, jobTitle: JobTitleModel, newProject: boolean) {

    const projFormArray = this.fb.array([]); // instantiating a temp formarray for each project

    this.employees.forEach(employee => {
      // for each FTE entry in a given project, push the FTE controller into the temp formarray

      // attempt to find a record/object for this project and month
      const foundEntry = this.employeesJobTitlesFlat.find(jobTitleEmp => {
        if (newProject) {
          return false;
        } else {
          return employee.emailAddress === jobTitleEmp['Employees: EmailAddress'] &&
          jobTitle.JobTitleID === jobTitleEmp.JobTitleID &&
          jobTitle.JobSubTitleID === jobTitleEmp.JobSubTitleID;
        }
      });

      // check if an employee exists in the jarvis employees table
      const foundExistingUser = this.employeesJobTitlesFlat.find(jobTitleEmp => {
        return employee.emailAddress === jobTitleEmp['Employees: EmailAddress'];
      });

      const fullNameSplit = employee.fullName.split(' ');

      projFormArray.push(
        this.fb.group({
          jobTitleID: [jobTitle.JobTitleID],
          jobTitleName: [jobTitle.JobTitleName],
          jobSubTitleID: [jobTitle.JobSubTitleID],
          jobSubTitleName: [jobTitle.JobSubTitleName],
          emailAddress: [employee.emailAddress],
          firstName: [fullNameSplit[0]],
          lastName: [fullNameSplit[1]],
          fullName: [employee.fullName],
          isJobTitle: [foundEntry ? true : false],
          newUser: [foundExistingUser ? false : true],
          updated: [false],
        })
      );
    });
    // cast the new project to an 'any', so we can assign arbitrary properties to each array
    // used to parse the projectName in HTML without having to dive into the controls
    const tempProj: any = projFormArray;
    tempProj.jobTitleID = jobTitle.JobTitleID;
    tempProj.jobTitleName = jobTitle.JobTitleName;
    tempProj.jobSubTitleID = jobTitle.JobSubTitleID;
    tempProj.jobSubTitleName = jobTitle.JobSubTitleName;

    FTEFormArray.push(tempProj);  // push the temp formarray as 1 object in the Project formarray
  }

  onSelectChange(i: any, j: any, event: any) {
    // Since radio buttons were difficult to implement, this loop will allow checkboxes to mimic radio button behavior
    // An employee should only be allowed to have one jobtitle, so at select, make all other checkboxes false
    console.log('i: ' + i + ', j: ' + j + ', checked: ' + event);
    const FTEFormArray = <FormArray>this.FTEFormGroup.controls.FTEFormArray;
    for (let empOpt = 0; empOpt < this.jobTitleList.length; empOpt++) {
      const FTEFormProjectArray = <FormArray>FTEFormArray.at(empOpt);
      const FTEFormGroup = FTEFormProjectArray.at(j);
      if (empOpt !== i) {
        FTEFormGroup.patchValue({
          isJobTitle: false
        });
      } else if (!FTEFormGroup.value.newUser) {
        FTEFormGroup.patchValue({
          updated: true
        });
      }
    }
  }

  onSaveClick() {
    const jobTitleData = this.FTEFormGroup.value.FTEFormArray;

    // call the api data service to send the put request
    this.apiDataJobTitleService.updateEmployeesJobTitlesBulk(jobTitleData, this.authService.loggedInUser.id)
    .subscribe(
      async res => {
        this.cacheService.raiseToast('success', res.message);
        // Get nested and flat data for jobtitles/subtitles and their employees
        this.employeesJobTitles = await this.getEmployeesJobTitles(this.teamEditableMembers);
        this.employeesJobTitlesNested = this.employeesJobTitles.nested;
        this.employeesJobTitlesFlat = this.employeesJobTitles.flat;
        this.buildForm();
       },
      err => {
        console.log(err);
        this.cacheService.raiseToast('error', `${err.status}: ${err.statusText}`);
      }
    );
  }

  onTestFormClick() {
    console.log('this.FTEFormGroup', this.FTEFormGroup)
    console.log('FTEFormArray', this.FTEFormGroup.value.FTEFormArray)
    console.log('this.teamOrgStructure', this.teamOrgStructure)
    console.log('this.employees', this.employees)
    console.log('this.jobTitleList', this.jobTitleList)
    console.log('this.employeesJobTitlesNested', this.employeesJobTitlesNested)
    console.log('this.employeesJobTitlesFlat', this.employeesJobTitlesFlat)
  }


}

