import { Injectable } from '@angular/core';

@Injectable()
export class ToastService {

  constructor() { }

  success() {
    const toast = document.getElementById('toast-save');
    toast.classList.add('toast-show');

    // After 3 seconds, remove the show class from DIV
    setTimeout(() => { toast.classList.remove('toast-show'); }, 3000);
  }
}
