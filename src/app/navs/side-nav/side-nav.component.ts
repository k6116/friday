import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import { CacheService } from '../../_shared/services/cache.service';
import { AuthService } from '../../_shared/services/auth.service';
import { MainMenuItems } from './side-nav.model';

declare var $: any;

@Component({
  selector: 'app-side-nav',
  templateUrl: './side-nav.component.html',
  styleUrls: ['./side-nav.component.css']
})
export class SideNavComponent implements OnInit, AfterViewInit, OnDestroy {

  selectedMenu: string;
  toggleMode: string;
  expandCollapseTooltip: string;
  initStart: number;
  menuStructure: any;
  expandedMenus: any;
  parentMenuToExpand: any;
  subscription1: Subscription;
  subscription2: Subscription;
  isTestInstance: boolean;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private cacheService: CacheService,
    private authService: AuthService) {


      // build an object that represents the sidebar menu structure, to be rendered in the html
      this.menuStructure = [
        {
          title: 'Dashboard',
          iconClass: 'nc-dashboard-half',
          alias: 'dashboard',
          path: 'main/dashboard',
          expanded: false,
          active: false,
          highlighted: false,
          permissionProtected: false,
          hidden: false
        },
        {
          title: 'FTE Entry',
          iconClass: 'nc-calendar-add',
          alias: 'fteEntry',
          expanded: false,
          active: false,
          highlighted: false,
          permissionProtected: true,
          hidden: false,
          subItems: [
            {
              title: 'My FTEs',
              alias: 'my-ftes',
              path: 'main/fte-entry/employee',
              parentAlias: 'fteEntry',
              active: false,
              permissionProtected: false,
              hidden: false
            },
            {
              title: 'Team FTEs',
              alias: 'team-ftes',
              path: 'main/fte-entry/team',
              parentAlias: 'fteEntry',
              active: false,
              permissionProtected: true,
              hidden: false
            }
          ]
        },
        {
          title: 'Projects',
          iconClass: 'nc-gantt',
          alias: 'projects',
          path: 'main/my-projects',
          expanded: false,
          active: false,
          highlighted: false,
          permissionProtected: false,
          hidden: false,
          subItems: [
            {
              title: 'My Projects',
              alias: 'my-projects',
              path: 'main/projects/my-projects',
              parentAlias: 'projects',
              active: false,
              permissionProtected: false,
              hidden: false
            },
            {
              title: 'Search',
              alias: 'search',
              path: 'main/projects/search',
              subPaths: ['main/projects/display/:id'],
              parentAlias: 'projects',
              active: false,
              permissionProtected: false,
              hidden: false
            }
          ]
        },
        {
          title: 'Reports',
          iconClass: 'nc-chart-bar-33',
          alias: 'reports',
          expanded: false,
          active: false,
          highlighted: false,
          permissionProtected: false,
          hidden: false,
          subItems: [
            {
              title: 'My FTE Summary',
              alias: 'reports-my-fte-summary',
              path: 'main/reports/my-fte-summary',
              parentAlias: 'reports',
              active: false,
              permissionProtected: false,
              hidden: false
            },
            {
              title: 'Team FTE Summary',
              alias: 'reports-team-fte-summary',
              path: 'main/reports/team-fte-summary',
              parentAlias: 'reports',
              active: false,
              permissionProtected: false,
              hidden: false
            },
            {
              title: 'Top Projects',
              alias: 'reports-top-projects',
              path: 'main/reports/top-projects',
              parentAlias: 'reports',
              active: false,
              permissionProtected: true,
              hidden: false
            },
            {
              title: 'Top Projects Bubble',
              alias: 'reports-top-projects-bubble',
              path: 'main/reports/top-projects-bubble',
              parentAlias: 'reports',
              active: false,
              permissionProtected: true,
              hidden: false
            },
          ]
        },
        // temporarily hiding BOM from sidenav until we can complete BOM editor
        // {
        //   title: 'BOM',
        //   iconClass: 'nc-hierarchy-53',
        //   alias: 'bom',
        //   expanded: false,
        //   active: false,
        //   highlighted: false,
        //   permissionProtected: true,
        //   hidden: false,
        //   subItems: [
        //     {
        //       title: 'BOM Viewer',
        //       alias: 'bom-viewer',
        //       path: 'main/bom/bom-viewer',
        //       parentAlias: 'bom',
        //       active: false,
        //       permissionProtected: false,
        //       hidden: false
        //     },
        //     {
        //       title: 'BOM Editor',
        //       alias: 'bom-editor',
        //       path: 'main/bom/bom-editor',
        //       parentAlias: 'bom',
        //       active: false,
        //       permissionProtected: true,
        //       hidden: false
        //     }
        //   ]
        // },
        {
          title: 'Matplan',
          iconClass: 'nc-privacy-policy-2',
          alias: 'matplan',
          path: 'main/matplan',
          expanded: false,
          active: false,
          highlighted: false,
          permissionProtected: true,
          hidden: false
        },
        {
          title: 'Org Chart',
          iconClass: 'nc-hierarchy-53',
          alias: 'orgchart',
          path: 'main/org/org-viewer',
          expanded: false,
          active: false,
          highlighted: false,
          permissionProtected: false,
          hidden: false
        },
        {
          title: 'Setups',
          iconClass: 'nc-settings',
          alias: 'setups',
          expanded: false,
          active: false,
          permissionProtected: true,
          hidden: false,
          subItems: [
            {
              title: 'Projects',
              alias: 'setups-projects',
              path: 'main/setups/projects',
              parentAlias: 'setups',
              active: false,
              permissionProtected: true,
              hidden: false
            },
            {
              title: 'Parts',
              alias: 'setups-parts',
              path: 'main/setups/parts',
              parentAlias: 'setups',
              active: false,
              permissionProtected: true,
              hidden: false
            },
            {
              title: 'Team Roles',
              alias: 'setups-team-roles',
              path: 'main/setups/team-roles',
              parentAlias: 'setups',
              active: false,
              permissionProtected: true,
              hidden: false
            }
          ]
        },
        {
          title: 'Admin',
          iconClass: 'nc-l-security',
          alias: 'admin',
          path: 'main/admin',
          expanded: false,
          active: false,
          permissionProtected: true,
          hidden: false
        }
        // {
        //   title: 'Websockets',
        //   iconClass: 'nc-socket',
        //   alias: 'websockets',
        //   path: 'main/chat',
        //   expanded: false,
        //   active: false,
        //   highlighted: false,
        //   permissionProtected: false,
        //   hidden: false
        // }
      ];  // end menuStructure array of objects


  }


  ngOnInit() {


    // PSEUDO-CODE
    //
    // * highlighted menu item: 5px colored left border and white text
    // * highlighted parent menu item: white text
    //
    // 1. on page refresh get the current path from the router
    //    highlight the menu item that matches, expand and highlight the parent menu item if it is a submenu item
    //    note the expanding must be done after view init and with settimeout of 0 to work without errors
    //
    // 2. on menu item click get the menu item object from the click event
    //    if there is no path/route, xpand or contract the submenu items container
    //    if there is a route, highlight the menu item, expand and highlight the parent menu item if it is a submenu item
    //
    // 3. on subscription to navigatedPath (from guards) or browserLocation (from app component checking for back or forward button presses)
    //    highlight the menu item that matches, expand and highlight the parent menu item if it is a submenu item
    //    even if a guarded menu item (route) is clicked and passes the guard, it will not highlight it, so need the subscription

    // check the port to see if this is the test instance (dev will return '3000', prod will return '')
    // if this is test, use the 'blue' icon version (_test) and text instead of yellow
    if (location.port === '440') {
      this.isTestInstance = true;
    }

    // get the current route path from the url e.g. reports/projects, fte-entry/team, etc.
    const path = this.router.url.slice(1, this.router.url.length);

    // highlight the selected/active menu item with color, background color, etc.
    // needed here if the user goes directly to the route using the url or on refresh
    this.highlightActiveMenu(path);

    // hide menu items that the user does not have permissions to access
    this.hideUnauthorizedMenuItems();

    // set up subscription to receive path from the fte entry guard (or other guards), to highlight the menu item after passing the guard
    this.subscription1 = this.cacheService.navigatedPath.subscribe(navigatedPath => {
      // console.log('received subscription in the sidenav component for navigated path:');
      // console.log(navigatedPath);
      // show the correct menu item based on the location/path (colored border, white text, expanded parent if any)
      // NOTE: need to trim off the leading /
      this.activateMenuItem(navigatedPath.slice(1));
    });

    // set up subscription to receive path from the app component, detecting browser back or foward button clicks
    this.subscription2 = this.cacheService.browserLocation.subscribe(location => {
      // show the correct menu item based on the location/path (colored border, white text, expanded parent if any)
      // NOTE: need to trim off the leading /
      this.activateMenuItem(location.url.slice(1));
    });


  }


  ngAfterViewInit() {

    // NOTE: the actual expanding of main menu items must be done in this lifecycle hook,
    // because the html won't be rendered yet in the init hook

    // get the current route path from the url e.g. reports/projects, fte-entry/team, etc.
    const path = this.router.url.slice(1, this.router.url.length);

    // expand and higlight the parent menu if this path is associated with a sub menu item
    // NOTE: use setTimeout with zero to avoid the Expression has changed after it was checked error
    setTimeout(() => {
      this.highlightAndExpandParentMenu(path);
    }, 0);


  }


  ngOnDestroy() {
    this.subscription1.unsubscribe();
    this.subscription2.unsubscribe();
  }


  // activate clicked or re-directed menu item
  // set 5px colored left border, text color to white, expand the parent menu item if applicable
  activateMenuItem(path) {
    // unhighlight all the main menu items - set color to dark grey
    this.clearAllParentMenuHighlights();
    // highlight the active menu and unhighlight all the non-active menus (5px colored border, white text)
    this.highlightActiveMenu(path);
    // expand and higlight the parent menu if this path is associated with a sub menu item (white text)
    this.highlightAndExpandParentMenu(path);
  }


  hideUnauthorizedMenuItems() {

    // get the decoded token from the auth service which will have the array of permissions
    // NOTE, TO-DO BILL: when jwt is refactored from local storage into a cookie not accessible from code,
    // we will no longer be able to decodeon the client side
    const tokenPayload = this.authService.decodedToken();
    // console.log('token payload:');
    // console.log(tokenPayload);

    // get the permissions out of the token payload
    const permissions = tokenPayload.userData.permissions;
    // console.log('user permissions:');
    // console.log(permissions);

    // go through each menu item and set the hidden property by checking the permissions
    // only if the permissionProtected property is set to true
    this.menuStructure.forEach(menuItem => {
      // if the permissionProtected property is set to true, need to check to make sure the user has the permission to access this menu item
      if (menuItem.permissionProtected) {
        // look through the permissions, try to find a match based on the convention of:
        // 'Resources > Main Menu Title > View'
        const foundPermission = permissions.find(permission => {
          return permission.permissionName === `Resources > ${menuItem.title} > View`;
        });
        // console.log('found permission object:');
        // console.log(foundPermission);
        // if the permission was not found, set the hidden property to true
        if (!foundPermission) {
          menuItem.hidden = true;
        }
      }
      // if the menu item has sub menu items
      if (menuItem.hasOwnProperty('subItems')) {
        // go through each sub-menu item and set the hidden property by checking the permissions
        // only if the permissionProtected property is set to true
        menuItem.subItems.forEach(subMenuItem => {
          // if the permissionProtected property is set to true
          // need to check to make sure the user has the permission to access this sub menu item
          if (subMenuItem.permissionProtected) {
            // look through the permissions, try to find a match based on the convention of:
            // 'Resources > Main Menu Title > Sub Menu Title > View'
            const foundPermission = permissions.find(permission => {
              return permission.permissionName === `Resources > ${menuItem.title} > ${subMenuItem.title} > View`;
            });
            // if the permission was not found, set the hidden property to true
            if (!foundPermission) {
              subMenuItem.hidden = true;
            }
          }
        });
      }
    });

  }


  onMenuItemClick(menuItem: any, isSubMenuItem: boolean) {

      // if the menu item has a sub-menu (meaning, it is a parent menu item that has no route)
      if (menuItem.subItems) {

        // expand or collapse the menu (toggle it by passing !menuItem.expanded)
        this.expandOrCollapseMenu(!menuItem.expanded, menuItem, true);

      // otherwise, it is a parent menu or sub menu item that has a route
      } else {

        // navigate to the selected/clicked route
        this.router.navigate([`/${menuItem.path}`]);

        // only highlight the menu item if the navigation was successfull (path matches)
        // deals with cases where guard prevents navigation to the route
        setTimeout(() => {
          // get the current route path from the url e.g. reports/projects, fte-entry/team, etc.
          const path = this.router.url.slice(1, this.router.url.length);
          // console.log('navigated to new path:');
          // console.log(path);
          // if the new path matches where we attempted to navigate to
          if (path === menuItem.path) {
            // proceed to activate the menu item (highlight etc.)
            this.activateMenuItem(path);
          }
        }, 0);

      }

  }


  clearAllParentMenuHighlights() {

    // go through all main menu items and set the highlighted property to false
    this.menuStructure.forEach(mainMenuItem => {
      mainMenuItem.highlighted = false;
    });

  }


  // set the active property to true if the path matches (and set all others to false along the way)
  // active will set the 5px left border to yellow or blue and text color to white
  highlightActiveMenu(path: string) {
    // loop through each menu item
    this.menuStructure.forEach(menuItem => {
      // if the menu item has a path (route), set the active property to either true or false (left border color)
      if (menuItem.hasOwnProperty('path')) {
        menuItem.active = menuItem.path === path ? true : false;
      }
      // if the menu item has sub items (it is a parent menu item)
      if (menuItem.hasOwnProperty('subItems')) {
        // loop through each sub menu item
        menuItem.subItems.forEach(subMenuItem => {
          // set the active property to either true or false (left border color)
          // don't need to check for path property since all sub menu items should have a route
          subMenuItem.active = subMenuItem.path === path ? true : false;
          // check any alternative paths that may also match, as defined in this.menuStructure
          // for instance: subPaths: ['main/projects/display/:id'],
          if (!subMenuItem.active && subMenuItem.hasOwnProperty('subPaths')) {
            subMenuItem.active = this.checkAlternativePaths(subMenuItem.subPaths, path);
          }
        });
      }
    });
  }


  highlightAndExpandParentMenu(path: string) {
    // initialize a variable to hold the index of the parent menu object
    let parentMenuIndex: number;
    // loop through the menu structure
    this.menuStructure.forEach((menuItem, index) => {
      // set the index
      parentMenuIndex = index;
      // if the menu item has sub menu items, loop through those
      if (menuItem.hasOwnProperty('subItems')) {
        menuItem.subItems.forEach(subMenuItem => {
          // if the path matches, highlight and expand the main/parent menu item
          let highlightAndExpand: boolean;
          if (subMenuItem.path === path) {
            highlightAndExpand = true;
          } else if (subMenuItem.hasOwnProperty('subPaths')) {
            highlightAndExpand = this.checkAlternativePaths(subMenuItem.subPaths, path);
          }
          if (highlightAndExpand) {
            const parentMenuItem = this.menuStructure[parentMenuIndex];
            parentMenuItem.highlighted = true;
            parentMenuItem.expanded = true;
            this.expandOrCollapseMenu(true, parentMenuItem, false, true);
          }
        });
      }
    });

  }


  checkAlternativePaths(subPaths: any[], path: string): boolean {
    let returnVal = false;
    if (subPaths.length) {
      subPaths.forEach(subPath => {
        let regexString;
        // replace the '/' with '\/' (escape char for regex)
        regexString = subPath.replace(/\//g, '\\/');
        regexString = regexString.replace(/(:.+(?=\/))|(:.+$)/g, '.+');
        const regexTest = new RegExp(regexString, 'g');
        if (regexTest.test(path)) {
          returnVal = true;
        }
      });
      return returnVal;
    } else {
      return returnVal;
    }
  }


  // method to perform the expanding or collapsing of a main menu item
  expandOrCollapseMenu(expand: boolean, menuItem: any, animate: boolean, skipPropertyUpdate?: boolean) {
    // ge the element using jQuery and the alias which will be included in the element classes
    const $el = $(`div.sidenav-menu-item.${menuItem.alias}`);
    // find the menu item using the alias
    // const foundMenuItem = this.getMenuObject(alias);
    // find the number of visible (non-hidden) sub-menu items
    const visibleSubMenuItems = menuItem.subItems.filter(subItem => {
      return !subItem.hidden;
    });
    // set/calculate the height
    // will be 55 pixels collapsed, and 55 + 40 times the number of subitems (and extra 20px for bottom margin)
    const height = expand ? 55 + 20 + (visibleSubMenuItems.length * 40) : 55;
    // if animation is desired, set the transition css otherwise clear it
    if (animate) {
      $el.css('transition', 'height .35s ease-out');
    } else {
      $el.css('transition', '');
    }
    // set the height using jQuery css method
    $el.css('height', `${height}px`);
    // NOTE: skipPropertyUpdate is used to avoid error due to init vs. afterview init lifecycle conflict
    // Error: ExpressionChangedAfterItHasBeenCheckedError: Expression has changed after it was checked
    if (!skipPropertyUpdate) {
      menuItem.expanded = expand;
    }
  }



}
