import { Injectable } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import 'rxjs/add/operator/filter';

@Injectable()
export class RoutingHistoryService {

  history = [];

  constructor(
    private router: Router
  ) { }


  loadRouting(): void {
    this.router.events
      .filter(event => event instanceof NavigationEnd)
      .subscribe(({urlAfterRedirects}: NavigationEnd) => {
        this.history = [...this.history, urlAfterRedirects];
      });
  }

}
