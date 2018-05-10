import { Component, OnInit } from '@angular/core';
import { AppDataService } from '../_shared/services/app-data.service';

@Component({
  selector: 'app-toast',
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.css']
})
export class ToastComponent implements OnInit {

  constructor(private appDataService: AppDataService) { }

  toastType: string;
  toastText: string;
  toastShow = false;

  ngOnInit() {
    this.appDataService.toast.subscribe( toast => {
      this.toastType = `toast toast-${toast.type}`;
      this.toastText = toast.text;
      this.showToast();
    });
  }

  showToast() {
    // show the toast, then remove the toastShow class from the div after 3 sec
    this.toastShow = true;
    setTimeout(() => { this.toastShow = false; }, 3000);
  }
}
