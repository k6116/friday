import { Component, OnInit, OnDestroy } from '@angular/core';
import { CacheService } from '../_shared/services/cache.service';
import { Subscription } from 'rxjs/Subscription';

@Component({
  selector: 'app-toast',
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.css']
})
export class ToastComponent implements OnInit, OnDestroy {

  constructor(private cacheService: CacheService) { }

  toastSubscription: Subscription;
  toastType: string;
  toastText: string;
  toastVisible = false;
  timer: any;

  ngOnInit() {

    console.log('toast component has been initialized');

    this.toastSubscription = this.cacheService.toast.subscribe( toast => {
      if (this.timer) {
        // if invoked while toast is already visible, clear the timeout
        clearTimeout(this.timer);
      }
      this.toastType = `toast toast-${toast.type}`;
      this.toastText = toast.text;
      this.showToast();
    });
  }

  showToast() {
    // show the toast, then remove the toast-show class from the div after 4 sec
    this.toastVisible = true;
    this.timer = setTimeout(() => { this.dismissToast(); }, 4000);
  }

  dismissToast() {
    this.toastVisible = false;
  }

  ngOnDestroy() {
    this.toastSubscription.unsubscribe();
  }
}
