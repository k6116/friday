import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AppDataService } from '../../_shared/services/app-data.service';

declare var $: any;

@Component({
  selector: 'app-side-nav',
  templateUrl: './side-nav.component.html',
  styleUrls: ['./side-nav.component.css']
})
export class SideNavComponent implements OnInit {

  selectedMenu: string;
  toggleMode: string;
  expandCollapseTooltip: string;
  initStart: number;
  menuStructure: any;

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
              active: false
            },
            {
              title: 'My Team',
              alias: 'myTeam',
              path: 'fte-entry/team',
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
          active: true
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
              active: false
            },
            {
              title: 'Employees',
              alias: 'employees',
              path: 'reports/employees',
              active: true
            }
          ]
        }
      ];


  }


  ngOnInit() {

    // get the current route path from the url
    const path = this.router.url.slice(1, this.router.url.length);

    console.log(`current path is: ${path}`);

    // set the icon color based to light blue for the current/active menu
    // needed here if the user goes directly to the route using the url
    this.selectedMenu = path;

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
        let height;
        if (!foundMenuItem.expanded) {
          height = 55 + 3 + (foundMenuItem.subItems.length * 40);
          $el.css('height', `${height}px`);
          foundMenuItem.expanded = true;
        } else {
          height = 55;
          $el.css('height', `${height}px`);
          foundMenuItem.expanded = false;
        }
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
      menuItem.active = menuItem.path === path ? true : false;
      menuItem.subItems.forEach(subMenuItem => {
        subMenuItem.active = subMenuItem.path === path ? true : false;
      });
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


}
