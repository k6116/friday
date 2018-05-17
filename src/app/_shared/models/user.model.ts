
import {Deserializable} from './deserializable.model';

import * as moment from 'moment';

export class User implements Deserializable<User> {

  id: number;
  fullName: string;
  userName: string;
  email: string;
  roleID: number;
  jobTitleID: number;
  loginEnabled: boolean;
  forcePasswordReset: boolean;
  createdBy: number;
  createdAt: string;
  updatedBy: number;
  updatedAt: string;
  expiringAt: number;

  // constructor(user: any) {
  //   this.id = user.id;
  //   this.fullName = user.fullName;
  //   this.userName = user.userName;
  //   this.email = user.email;
  //   this.roleID = user.roleID;
  //   this.loginEnabled = user.loginEnabled;
  //   this.forcePasswordReset = user.forcePasswordReset;
  //   this.createdBy = user.createdBy;
  //   this.createdAt = user.createdAt;
  //   this.updatedBy = user.updatedBy;
  //   this.updatedAt = user.updatedAt;
  // }

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

