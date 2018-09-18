import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';

export class DataStub {
  public authenticate(user: any): Observable<any> {
    return Observable.of(undefined);
  }

}
