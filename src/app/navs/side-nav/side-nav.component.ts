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

      this.menuStructure = [
        {
          title: 'FTE Entry',
          iconClass: 'nc-calendar-add',
          alias: 'fteEntry',
          expanded: false,
          subItems: [
            {
              title: 'Me',
              alias: 'me'
            },
            {
              title: 'My Team',
              alias: 'myTeam'
            }
          ]
        },
        {
          title: 'Projects',
          iconClass: 'nc-gantt',
          alias: 'projects',
          expanded: false
        },
        {
          title: 'Reports',
          iconClass: 'nc-chart-bar-33',
          alias: 'reports',
          expanded: false,
          subItems: [
            {
              title: 'Projects',
              alias: 'projects'
            },
            {
              title: 'Employees',
              alias: 'employees'
            }
          ]
        }
      ];


  }


  ngOnInit() {

    // init the tooltip javascript (still need this for the expand/collapse since it is applied in the html)
    $('[data-toggle="tooltip"]').tooltip({ trigger: 'hover' });

    // get the current route path from the url
    const path = this.router.url.slice(1, this.router.url.length);

    // set the icon color based to light blue for the current/active menu
    // needed here if the user goes directly to the route using the url
    this.selectedMenu = path;

  }

  onMenuItemClick(menuItem: string) {
    console.log(`menu item ${menuItem} clicked`);
    const $el = $(`div.sidenav-menu-item.${menuItem}`);
    console.log($el);
    const foundMenuItem = this.menuStructure.find(menu => {
      return menu.alias === menuItem;
    });
    console.log('found menu item object');
    console.log(foundMenuItem);
    // transition from 55px + 3px + 40px x each sub menu item
    if (foundMenuItem) {
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
        // navigate to menu item, since there are no subitems
      }
    }
  }

  onSubMenuItemClick(subMenuItem: string) {
    console.log(`sub menu item ${subMenuItem} clicked`);
  }


}
