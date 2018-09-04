import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRoute, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { CacheService } from '../../_shared/services/cache.service';
import { AuthService } from '../../_shared/services/auth.service';
import { ApiDataFteService, ApiDataOrgService } from '../../_shared/services/api-data/_index';
import 'rxjs/add/operator/toPromise';

@Injectable()
export class FteTeamEntryGuard implements CanActivate {

  teamOrgStructure: any;
  teamEditableMembers: any;
  allEmployees: any;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private apiDataFteService: ApiDataFteService,
    private apiDataOrgService: ApiDataOrgService,
    private cacheService: CacheService,
    private authService: AuthService
  ) { }

  async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {

    // Get Team Data - Manager and Employees
    const teamOrgStructure = await this.getTeam('ethan_hunt@keysight.com');
    this.teamOrgStructure = JSON.parse('[' + teamOrgStructure[0].json + ']')[0];

    this.allEmployees = this.teamOrgStructure.employees;
    const numOfEmployees = this.allEmployees.length;

    // Build email string of only employees
    await this.buildTeamEditableMembers();

    // check to make sure the user has updated their profile with their job title before allowing them to add a project
    // NOTE: this must be done synchronously using async / await
    const res = await this.checkTeamJobTitleUpdatedSync(this.teamEditableMembers);

    // if the returned numOfEmployees does not match all numOfEmployees, means some employees haven't been set up in the employees table yet
    if (res[0].numOfEmployees === numOfEmployees) {
      // emit the path through the cache service for the sidenav component to pick up to highlight the menu item
      this.cacheService.navigatedPath.emit(state.url);
      // return true to let down the guard
      return true;
    // if the job title is null
    } else {
      // route to the dashboard landing page, if the user tries to navigate directly to the fte entry page via the address bar
      if (this.router.url === '/') {
        this.router.navigate(['/main/setups/team-roles']);
      } else {
        this.router.navigate(['/main/setups/team-roles']);
        // show modal instructing the user they must update their profile with their job title and subtitle
        const initial = this.authService.loggedInUser.fullName[0].toUpperCase();
        this.cacheService.confirmModalData.emit(
          {
            title: 'Profile Update Required',
            message: `All employees must be set up with Job Titles and Job Sub Titles before editing their FTEs.
              You will be re-directed to the setup page.`,
            iconClass: 'fa-exclamation-triangle',
            iconColor: 'rgb(193, 27, 27)',
            closeButton: true,
            allowOutsideClickDismiss: true,
            allowEscKeyDismiss: true,
            buttons: [
              {
                text: 'Ok',
                bsClass: 'btn-secondary'
              }
            ]
          }
        );
      }
      // return false to implement the guard / block the navigate to the fte entry component
      return false;
    }



  }

  async getTeam(email: string): Promise<any> {
    // get list of subordinates
    return await this.apiDataOrgService.getOrgData(email).toPromise();
  }

  async buildTeamEditableMembers(): Promise<any> {
    this.teamEditableMembers = '';
    // build the string of employee email address to use as a parameter for the SP resources.DisplayTeamFTE
    for (let i = 0; i < this.allEmployees.length; i++) {
      this.teamEditableMembers = this.allEmployees[i].emailAddress + '\',\'' + this.teamEditableMembers;
    }
    this.teamEditableMembers = this.teamEditableMembers.substr(0, this.teamEditableMembers.lastIndexOf(','));
    this.teamEditableMembers = '\'' + this.teamEditableMembers;
  }

  async checkTeamJobTitleUpdatedSync(emailAdresses: string): Promise<any> {
    return await this.apiDataFteService.checkTeamJobTitleUpdatedSync(emailAdresses).toPromise();
  }

}
