import { Injectable } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';

@Injectable()
export class RoutingHistoryService {

  // array of string to store routing history. example:
  // ["/login", "/main/dashboard", "/main/fte-entry/employee", "/main/projects/my-projects", "/main/projects/search"]
  history: string[] = [];

  constructor(
    private router: Router
  ) { }

  // start subscription to listen for routing events and push history in an array
  // can be used when conditional logic depends on previous route
  loadRouting(): void {
    this.router.events
      .filter(event => event instanceof NavigationEnd)
      .subscribe(({urlAfterRedirects}: NavigationEnd) => {
        // add the route to the history array
        this.history = [...this.history, urlAfterRedirects];
      });
  }

}
