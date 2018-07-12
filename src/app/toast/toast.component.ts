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
  toastShow = false;

  ngOnInit() {

    console.log('toast component has been initialized');

    this.toastSubscription = this.cacheService.toast.subscribe( toast => {
      this.toastType = `toast toast-${toast.type}`;
      this.toastText = toast.text;
      this.showToast();
    });
  }

  showToast() {
    // show the toast, then remove the toastShow class from the div after 3 sec
    this.toastShow = true;
    setTimeout(() => { this.toastShow = false; }, 5000);
  }

  ngOnDestroy() {
    this.toastSubscription.unsubscribe();
  }
}
