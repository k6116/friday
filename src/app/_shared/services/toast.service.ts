import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs/rx';

@Injectable()
export class ToastService {

  constructor() { }

  private subject = new Subject<any>();

  getToasts(): Observable<any> {
    return this.subject.asObservable();
  }

  success(text: string) {
    this.subject.next({
      type: 'success',
      text: text
    });
  }

}
