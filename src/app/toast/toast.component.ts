import { Component, OnInit } from '@angular/core';
import { ToastService } from '../_shared/services/toast.service';

@Component({
  selector: 'app-toast',
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.css']
})
export class ToastComponent implements OnInit {

  constructor(private toastService: ToastService) { }

  toastText: string;

  ngOnInit() {
    console.log('we init');
    this.toastService.getToasts().subscribe( toast => {
      console.log('made it here');
      console.log(toast);
      this.toastText = toast.text;
      this.showToast();
    });
  }

  showToast() {
    const toast = document.getElementById('toast');
    toast.classList.add('toast-show');

    // After 3 seconds, remove the show class from DIV
    setTimeout(() => { toast.classList.remove('toast-show'); }, 3000);
  }
}
