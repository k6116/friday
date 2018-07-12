
import {Deserializable} from './deserializable.model';

import * as moment from 'moment';

export class User implements Deserializable<User> {

  id: number;
  fullName: string;
  userName: string;
  email: string;
  roleID: number;
  jobTitleID: number;
  jobSubTitleID: number;
  loginEnabled: boolean;
  forcePasswordReset: boolean;
  createdBy: number;
  createdAt: string;
  updatedBy: number;
  updatedAt: string;
  expiringAt: number;

  // TO-DO BILL: add comments for these three methods

  deserialize(user: any): User {
    Object.assign(this, user);
    return this;
  }

  isLoginEnabled(): boolean {
    return this.loginEnabled;
  }

  minutesSinceLastUpdate(): number {
    return moment().diff(moment(this.updatedAt), 'minutes');
  }

}

