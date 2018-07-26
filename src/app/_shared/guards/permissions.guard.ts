import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { AuthService } from '../services/auth.service';
import { ApiDataAuthService } from '../services/api-data/api-data-auth.service';
// import 'rxjs/add/operator/toPromise';

import * as decode from 'jwt-decode';

@Injectable()
export class PermissionsGuard implements CanActivate {

  constructor(
    private router: Router,
    private authService: AuthService,
    private apiDataAuthService: ApiDataAuthService
  ) { }

  async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {

    // get the path the user is attempting to naviate to
    const path = state.url;
    console.log('user is attempting to navigate to the path:');
    console.log(path);

    // split the path into an array
    const pathArr = path.split('/');
    console.log('path array:');
    console.log(pathArr);

    // get the token from local storage
    // NOTE: we can count on the token being there; if it is not, the user would have been logged out already
    // with the AuthGuardService on the main route
    const token = localStorage.getItem('jarvisToken');

    // get the decoded token from the auth service which will have the array of permissions
    const tokenPayload = decode(token);

    // get the permissions out of the token payload
    const permissions = tokenPayload.userData.permissions;
    console.log('permissions array:');
    console.log(permissions);

    // find the position of 'main' in the path
    const mainIndex = pathArr.indexOf('main');
    console.log('index of main:');
    console.log(mainIndex);

    // get a string of the 'protected' route, which is everthing after the main route
    const protectedRoute = pathArr.slice(mainIndex + 1).join(' > ');
    console.log('protected route:');
    console.log(protectedRoute);

    // build the required permission string based on the path and permissions convention
    const permissionNeeded = `resources > ${protectedRoute} > view`;
    console.log('permission needed');
    console.log(permissionNeeded);

    // try to find the required permission in the user's list of permissions
    const foundPermission = permissions.find(permission => {
      // modify the permission string to replace white space between characters with '-' to match app routes and convert to lowercase
      const permissionNameModified = permission.permissionName.split(' > ').map(x => x.replace(/\s/g, '-')).join(' > ').toLowerCase();
      console.log('permission modified');
      console.log(permissionNameModified);
      return permissionNameModified === permissionNeeded;
    });
    console.log('found permission:');
    console.log(foundPermission);

    // final check to pass the token to the server to have it verified
    // to make sure it hasn't been tampered with; for example to add the permission
    const response = await this.apiDataAuthService.verifyToken(token + 'sadfs')
      .catch(err => {
        console.error('token may have been tampered!');
        return false;
      });
    console.log('response within permissions guard:');
    console.log(response);

    console.log('something after response');

    // if the token is valid
    if (response.tokenIsValid) {
      // return true if the permission was found, false if not found to enable the guard
      return foundPermission ? true : false;
    } else {
      // return false regardless of whether the permission was found, because the token could not be verified
      return false;
    }


  }


}
