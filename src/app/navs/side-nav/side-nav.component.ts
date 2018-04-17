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

      // on change (expand or collapse), update array of main menu items with expanded property
      // and set in app-data.service
      // on init, pick up the data and update the menu structure while using jquery to set the heights, temporarily removing transitions
      this.menuStructure = [
        {
          title: 'FTE Entry',
          iconClass: 'nc-calendar-add',
          alias: 'fteEntry',
          expanded: false,
          subItems: [
            {
              title: 'Me',
              alias: 'me',
              path: 'fte-entry/employee',
              parentAlias: 'fteEntry',
              active: false
            },
            {
              title: 'My Team',
              alias: 'myTeam',
              path: 'fte-entry/team',
              parentAlias: 'fteEntry',
              active: false
            }
          ]
        },
        {
          title: 'Projects',
          iconClass: 'nc-gantt',
          alias: 'projects',
          path: 'setups/projects',
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
              title: 'Projects',
              alias: 'projects',
              path: 'reports/projects',
              parentAlias: 'reports',
              active: false
            },
            {
              title: 'Employees',
              alias: 'employees',
              path: 'reports/employees',
              parentAlias: 'reports',
              active: false
            }
          ]
        }
      ];


  }


  ngOnInit() {

    // get the array of expanded menu objects from the cache
    // if the expandedMenus have data, call a method to expand the appropriate ones
    this.expandedMenus = this.appDataService.expandedMenus;
    console.log('expanded menus received in side nav component');
    console.log(this.expandedMenus);
    if (this.expandedMenus) {
      if (this.expandedMenus.length) {
        this.setExpandedProperties(this.expandedMenus);
      }
    }

    // get the current route path from the url
    const path = this.router.url.slice(1, this.router.url.length);

    console.log(`current path is: ${path}`);

    // set the icon color based to light blue for the current/active menu
    // needed here if the user goes directly to the route using the url or on refresh
    this.selectedMenu = path;
    this.highlightActiveMenu(path);

    // get parent menu object based on the current path
    this.getParentOfCurrentRoute(path);
    console.log('parent menu to expand');
    console.log(this.parentMenuToExpand);
    if (this.parentMenuToExpand) {
      const expandedMenu = [];
      expandedMenu.push(this.parentMenuToExpand);
      console.log(expandedMenu);
      this.setExpandedProperties(expandedMenu);
    }

  }

  ngAfterViewInit() {

    if (this.expandedMenus) {
      if (this.expandedMenus.length) {
        this.expandMenus(this.expandedMenus);
      }
    } else if (this.parentMenuToExpand) {
      const expandedMenu = [];
      expandedMenu.push(this.parentMenuToExpand);
      this.expandMenus(expandedMenu);
    }

  }

  onMenuItemClick(menuItem: string) {
    console.log(`menu item ${menuItem} clicked`);
    const $el = $(`div.sidenav-menu-item.${menuItem}`);
    console.log($el);
    // const foundMenuItem = this.menuStructure.find(menu => {
    //   return menu.alias === menuItem;
    // });
    const foundMenuItem = this.getMenuObject(menuItem);
    console.log('found menu item object');
    console.log(foundMenuItem);
    // transition from 55px + 3px + 40px x each sub menu item
    if (foundMenuItem) {
      // if the menu item has a sub-menu, expand or collapse the menu
      if (foundMenuItem.subItems) {
        this.expandOrCollapseMenu(!foundMenuItem.expanded, menuItem, true);
        this.storeExpandedMenus();
      } else {
        // store the active/selected menu item in the cache (app-data service)
        this.appDataService.selectedMenu = menuItem;
        // navigate to the selected/clicked route
        this.router.navigate([`/${foundMenuItem.path}`]);
      }
    }
  }

  // go through the entire menu structure (main menu and sub menu items)
  // and set the active property to true if the alias matches (and set all others to false)
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

  getParentOfCurrentRoute(path: string) {
    this.menuStructure.forEach(menuItem => {
      if (menuItem.hasOwnProperty('subItems')) {
        const foundSubMenuItem = menuItem.subItems.find(subItem => {
          return subItem.path === path;
        });
        console.log('found sub menu item');
        console.log(foundSubMenuItem);
        if (foundSubMenuItem) {
          const foundMainMenuItem = this.menuStructure.find(mainItem => {
            return mainItem.alias === foundSubMenuItem.parentAlias;
          });
          console.log('found main menu item');
          console.log(foundMainMenuItem);
          this.parentMenuToExpand = foundMainMenuItem;
        }
      }
    });
  }

  onSubMenuItemClick(menuItem: string, subMenuItem: string) {
    console.log(`sub menu item ${subMenuItem} clicked`);
    const foundMenuItem = this.getSubMenuObject(menuItem, subMenuItem);
    console.log('found menu item object');
    console.log(foundMenuItem);
    // navigate to the selected/clicked route
    this.router.navigate([`/${foundMenuItem.path}`]);
  }

  getMenuObject(menuItem: string): any {
    return this.menuStructure.find(menu => {
      return menu.alias === menuItem;
    });
  }

  getSubMenuObject(menuItem: string, subMenuItem: string): any {
    const foundMenuItem = this.menuStructure.find(menu => {
      return menu.alias === menuItem;
    });
    if (foundMenuItem) {
      return foundMenuItem.subItems.find(subMenu => {
        return subMenu.alias === subMenuItem;
      });
    }
  }

  getMenuElement(alias: string): any {
    return $(`div.sidenav-menu-item.${alias}`);
  }

  storeExpandedMenus() {
    const expandedMenus = this.menuStructure.filter(menu => {
      return menu.expanded;
    });
    console.log('expanded menus being stored in appDataService:');
    console.log(expandedMenus);
    this.appDataService.expandedMenus = expandedMenus;
  }

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

  expandMenus(expandedMenus: any) {
    expandedMenus.forEach(expandedMenu => {
      const foundMenuItem = this.menuStructure.find(menuItem => {
        return expandedMenu.alias === menuItem.alias;
      });
      console.log(foundMenuItem);
      if (foundMenuItem) {
        this.expandOrCollapseMenu(true, foundMenuItem.alias, false, true);
      }
    });
  }

  expandOrCollapseMenu(expand: boolean, alias: string, animate: boolean, skipPropertyUpdate?: boolean) {
    const $el = $(`div.sidenav-menu-item.${alias}`);
    const foundMenuItem = this.getMenuObject(alias);
    const height = expand ? 55 + 3 + (foundMenuItem.subItems.length * 40) : 55;
    if (animate) {
      $el.css('transition', 'height .35s ease-out');
    } else {
      $el.css('transition', '');
    }
    $el.css('height', `${height}px`);
    // NOTE: skipPropertyUpdate is used to avoid error due to init vs. afterview init lifecycle conflic
    // Error: ExpressionChangedAfterItHasBeenCheckedError: Expression has changed after it was checked
    if (!skipPropertyUpdate) {
      foundMenuItem.expanded = expand;
    }
  }




}
