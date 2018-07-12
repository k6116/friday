import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AppDataService } from '../../_shared/services/app-data.service';

declare var $: any;

@Component({
  selector: 'app-side-nav',
  templateUrl: './side-nav.component.html',
  styleUrls: ['./side-nav.component.css']
})
export class SideNavComponent implements OnInit, AfterViewInit {

  selectedMenu: string;
  toggleMode: string;
  expandCollapseTooltip: string;
  initStart: number;
  menuStructure: any;
  expandedMenus: any;
  parentMenuToExpand: any;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private appDataService: AppDataService) {

      // build an object that represents the sidebar menu structure, to be rendered in the html
      this.menuStructure = [
        {
          title: 'Dashboard',
          iconClass: 'nc-dashboard-half',
          alias: 'dashboard',
          path: 'main/dashboard',
          expanded: false,
          active: false
        },
        {
          title: 'FTE Entry',
          iconClass: 'nc-calendar-add',
          alias: 'fteEntry',
          path: 'main/fte-entry/employee',
          expanded: false,
          active: false
        },
        {
          title: 'Projects',
          iconClass: 'nc-gantt',
          alias: 'projects',
          path: 'main/setups/projects',
          expanded: false,
          active: false
        },
        {
          title: 'Reports',
          iconClass: 'nc-chart-bar-33',
          alias: 'reports',
          expanded: false,
          subItems: [
            {
              title: 'My FTE Summary',
              alias: 'reports-my-fte-summary',
              path: 'main/reports/my-fte-summary',
              parentAlias: 'reports',
              active: false
            },
            {
              title: 'Team FTE Summary',
              alias: 'reports-team-fte-summary',
              path: 'main/reports/team-fte-summary',
              parentAlias: 'reports',
              active: false
            },
            {
              title: 'Top Projects',
              alias: 'reports-top-projects',
              path: 'main/reports/top-projects',
              parentAlias: 'reports',
              active: false
            },
            {
              title: 'Top Projects Bubble',
              alias: 'reports-top-projects-bubble',
              path: 'main/reports/top-projects-bubble',
              parentAlias: 'reports',
              active: false
            },
            {
              title: 'Employees',
              alias: 'employees',
              path: 'main/reports/employees',
              parentAlias: 'reports',
              active: false
            }
          ]
        }
      ];


  }


  ngOnInit() {

    console.log('side nav component has been initialized');

    // get the current route path from the url e.g. reports/projects, fte-entry/team, etc.
    const path = this.router.url.slice(1, this.router.url.length);

    // highlight the selected/active menu item with color, background color, etc.
    // needed here if the user goes directly to the route using the url or on refresh
    this.highlightActiveMenu(path);

    // attempt to find the parent menu item, if a sub-menu item is the active one
    // if one is found, expand it so that the active sub-menu can be seen
    this.getParentOfCurrentRoute(path);
    if (this.parentMenuToExpand) {
      const expandedMenu = [];
      expandedMenu.push(this.parentMenuToExpand);
      this.setExpandedProperties(expandedMenu);
    }

  }

  ngAfterViewInit() {

    // NOTE: the actual expanding of main menu items must be done in this lifecycle hook,
    // because the html won't be rendered yet in the init hook
    // what is done on init is just setting the properties
    // separating these two is also used to avoid this error for the class binding for the caret icon:
    // Error: ExpressionChangedAfterItHasBeenCheckedError: Expression has changed after it was checked
    if (this.parentMenuToExpand) {
      const expandedMenu = [];
      // push it into an array so that the expandMenus method can be reused
      expandedMenu.push(this.parentMenuToExpand);
      this.expandMenus(expandedMenu);
    }

  }

  onMenuItemClick(menuItem: string) {
    // get the element object using jQuery
    const $el = $(`div.sidenav-menu-item.${menuItem}`);
    // get the menu item object in the menu structure (this.menuStructure)
    const foundMenuItem = this.getMenuObject(menuItem);
    if (foundMenuItem) {
      // if the menu item has a sub-menu, expand or collapse the menu (toggle it by passing !foundMenuItem.expanded)
      if (foundMenuItem.subItems) {
        this.expandOrCollapseMenu(!foundMenuItem.expanded, menuItem, true);
      } else {
        // navigate to the selected/clicked route
        this.router.navigate([`/${foundMenuItem.path}`]);
        this.highlightActiveMenu(foundMenuItem.path);
      }
    }
  }

  onSubMenuItemClick(menuItem: string, subMenuItem: string) {
    // get the menu item object in the menu structure (this.menuStructure)
    // TO-DO: attempt to combine getMenuObject and getSubMenuObject into a single method
    const foundMenuItem = this.getSubMenuObject(menuItem, subMenuItem);
    // navigate to the selected/clicked route
    this.router.navigate([`/${foundMenuItem.path}`]);
    this.highlightActiveMenu(foundMenuItem.path);
  }

  // hightlight the active/selected menu by going through the entire menu structure (main menu and sub menu items)
  // and set the active property to true if the path matches (and set all others to false along the way)
  highlightActiveMenu(path: string) {
    this.menuStructure.forEach(menuItem => {
      if (menuItem.hasOwnProperty('path')) {
        menuItem.active = menuItem.path === path ? true : false;
      }
      if (menuItem.hasOwnProperty('subItems')) {
        menuItem.subItems.forEach(subMenuItem => {
          subMenuItem.active = subMenuItem.path === path ? true : false;
        });
      }
    });
  }

  // get the parent of the selected/active menu item based on the path
  // used to expand that parent on init
  getParentOfCurrentRoute(path: string) {
    // loop through each main menu item in the menu structure
    this.menuStructure.forEach(menuItem => {
      // if the main menu item has a subItems property, attempt to find it within that array
      if (menuItem.hasOwnProperty('subItems')) {
        const foundSubMenuItem = menuItem.subItems.find(subItem => {
          return subItem.path === path;
        });
        // once the sub menu item is found, find it's parent main menu item (matching using the parentAlias)
        if (foundSubMenuItem) {
          const foundMainMenuItem = this.menuStructure.find(mainItem => {
            return mainItem.alias === foundSubMenuItem.parentAlias;
          });
          // set the property
          // TO-DO: make this method return the object instead of setting a class property, would be more proper
          this.parentMenuToExpand = foundMainMenuItem;
        }
      }
    });
  }

  // find and return a main menu item/object using the alias
  getMenuObject(alias: string): any {
    return this.menuStructure.find(menu => {
      return menu.alias === alias;
    });
  }

  // find and return a sub menu item/object using the alias
  getSubMenuObject(mainMenuAlias: string, subMenuAlias: string): any {
    const foundMenuItem = this.menuStructure.find(menu => {
      return menu.alias === mainMenuAlias;
    });
    if (foundMenuItem) {
      return foundMenuItem.subItems.find(subMenu => {
        return subMenu.alias === subMenuAlias;
      });
    }
  }

  // go through the cached expanded menu items and set the expanded property to true
  setExpandedProperties(expandedMenus: any) {
    expandedMenus.forEach(expandedMenu => {
      const foundMenuItem = this.menuStructure.find(menuItem => {
        return expandedMenu.alias === menuItem.alias;
      });
      if (foundMenuItem) {
        foundMenuItem.expanded = true;
      }
    });
  }

  // go through the cached expanded menu items and expand them, without any animation/transition
  expandMenus(expandedMenus: any) {
    expandedMenus.forEach(expandedMenu => {
      const foundMenuItem = this.menuStructure.find(menuItem => {
        return expandedMenu.alias === menuItem.alias;
      });
      if (foundMenuItem) {
        this.expandOrCollapseMenu(true, foundMenuItem.alias, false, true);
      }
    });
  }

  // method to perform the expanding or collapsing of a main menu item
  expandOrCollapseMenu(expand: boolean, alias: string, animate: boolean, skipPropertyUpdate?: boolean) {
    // ge the element using jQuery and the alias which will be included in the element classes
    const $el = $(`div.sidenav-menu-item.${alias}`);
    // find the menu item using the alias
    const foundMenuItem = this.getMenuObject(alias);
    // set/calculate the height
    // will be 55 pixels collapsed, and 55 + 40 times the number of subitems (and extra 20px for bottom margin)
    const height = expand ? 55 + 20 + (foundMenuItem.subItems.length * 40) : 55;
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
      foundMenuItem.expanded = expand;
    }
  }




}
