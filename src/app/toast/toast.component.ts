import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { CacheService } from '../_shared/services/cache.service';
import { Subscription } from 'rxjs/Subscription';

@Component({
  selector: 'app-toast',
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.css']
})
export class ToastComponent implements OnInit, OnDestroy {

  constructor(
    private cacheService: CacheService,
    private router: Router
  ) { }

  toastSubscription: Subscription;
  routerSubscription: Subscription;
  toastClass = 'toast'; // default css class
  toastText: string;
  toastType: string;
  toastVisible = false;
  timer: any;

  ngOnInit() {
    this.toastSubscription = this.cacheService.toast.subscribe( toast => {
      if (this.toastVisible) {
        // if toast is already visible, dismiss the existing one and then show the new one
        this.dismissToast();
        // delay is just a smidge longer than how long it takes to animate hiding the toast
        setTimeout( () => { this.onToastReceive(toast); }, 305);
      } else {
        this.onToastReceive(toast);
      }
    });

    this.routerSubscription = this.router.events.subscribe( () => {
      // subscribe to the router.  If the router changes paths (user navigated away) then dismiss the current toast
      if (this.toastVisible) {
        this.dismissToast();
      }
    });
  }

  ngOnDestroy() {
    this.toastSubscription.unsubscribe();
    this.routerSubscription.unsubscribe();
  }

  onToastReceive(toast: any) {
    // set type CSS class for toast, and the body of the message
    this.toastType = toast.type;
    this.toastClass = `toast toast-${this.toastType}`;
    this.toastText = toast.text;
    if (toast.type === 'error') {
      // if it's a warning toast, require the user to dismiss it
      this.showToast(true);
    } else {
      this.showToast(false);
    }
  }

  showToast(requireDismiss: boolean) {
    this.toastVisible = true;
    if (!requireDismiss) {
      // if dismiss not required, remove the toast-show class from the div after 5 sec
      this.timer = setTimeout(() => { this.dismissToast(); }, 5000);
    }
  }

  dismissToast() {
    if (this.timer) {
      clearTimeout(this.timer);
    }
    this.toastVisible = false;
  }

}
