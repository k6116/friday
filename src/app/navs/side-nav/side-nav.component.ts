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

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private appDataService: AppDataService) { }

  ngOnInit() {

    // init the tooltip javascript (still need this for the expand/collapse since it is applied in the html)
    $('[data-toggle="tooltip"]').tooltip({ trigger: 'hover' });

    // get the current route path from the url
    const path = this.router.url.slice(1, this.router.url.length);

    // set the icon color based to light blue for the current/active menu
    // needed here if the user goes directly to the route using the url
    this.selectedMenu = path;

  }

}
