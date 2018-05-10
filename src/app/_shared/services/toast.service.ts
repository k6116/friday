import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs/rx';

@Injectable()
export class ToastService {

  constructor() { }

  private subject = new Subject<any>();

  getToasts(): Observable<any> {
    console.log('made it to getToasts');
    return this.subject.asObservable();
  }
  success(text: string) {
    console.log('made it to success');
    this.subject.next({
      type: 'success',
      text: text
    });
  }

}
