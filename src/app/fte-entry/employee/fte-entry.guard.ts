import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRoute, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { CacheService } from '../../_shared/services/cache.service';
import { AuthService } from '../../_shared/services/auth.service';
import { ApiDataFteService } from '../../_shared/services/api-data/api-data-fte.service';
import 'rxjs/add/operator/toPromise';

@Injectable()
export class FteEntryGuard implements CanActivate {

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private apiDataFteService: ApiDataFteService,
    private cacheService: CacheService,
    private authService: AuthService
  ) { }

  async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {

    // get the token from local storage
    // NOTE: we can count on the token being there; if it is not, the user would have been logged out already
    // with the AuthGuardService on the main route
    const token = localStorage.getItem('jarvisToken');

    // check to make sure the user has updated their profile with their job title before allowing them to add a project
    // NOTE: this must be done synchronously using async / await
    const res = await this.apiDataFteService.checkJobTitleUpdatedSync(token)
      .catch(err => {
        return false;
      });

    // if the job title is populated (not null)
    if (res.jobTitle[0].JobTitleID) {
      // emit the path through the cache service for the sidenav component to pick up to highlight the menu item
      this.cacheService.navigatedPath.emit(state.url);
      // return true to let down the guard
      return true;
    // if the job title is null
    } else {
      // route to the dashboard landing page, if the user tries to navigate directly to the fte entry page via the address bar
      if (this.router.url === '/') {
        this.router.navigate(['/main/dashboard']);
      } else {
        // show modal instructing the user they must update their profile with their job title and subtitle
        const initial = this.authService.loggedInUser.fullName[0].toUpperCase();
        this.cacheService.confirmModalData.emit(
          {
            title: 'Profile Update Required',
            message: `Please update your profile with your job title and subtitle -
              click the ${initial} icon in the upper right hand corner then the profile button.
              You won't be able to enter your project ftes until this has been updated.`,
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
}
