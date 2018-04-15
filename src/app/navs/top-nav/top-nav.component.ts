import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AppDataService } from '../../_shared/services/app-data.service';

declare var $: any;

@Component({
  selector: 'app-top-nav',
  templateUrl: './top-nav.component.html',
  styleUrls: ['./top-nav.component.css']
})
export class TopNavComponent implements OnInit {

  constructor(
    private router: Router,
    private appDataService: AppDataService
  ) { }

  ngOnInit() {
  }

  onAppClick() {
    window.location.href = '/main';
  }

  onMenuLinkClick(menu: string) {
    console.log('menu item clicked: ' + menu);
    // this.appDataService.partNumber = undefined;
    // this.appDataService.recipe = undefined;
    // this.appDataService.selectedMenu = menu;
    $('.app-menu-links').css('display', 'none');
    setTimeout(() => {
      $('.app-menu-links').css('display', '');
    }, 100);
    this.router.navigate([`/${menu}`]);
  }

}
