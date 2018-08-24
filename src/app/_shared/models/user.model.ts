
import {Deserializable} from './deserializable.model';

import * as moment from 'moment';

export class Permission {
  permissionName: string;
}

export class User implements Deserializable<User> {

  id: number;
  firstName: string;
  lastName: string;
  fullName: string;
  userName: string;
  email: string;
  roleID: number;
  roleName: string;
  jobTitleID: number;
  jobSubTitleID: number;
  createdBy: number;
  creationDate: string;
  lastUpdatedBy: number;
  lastUpdateDate: string;
  isManager: boolean;
  isExistingUser: boolean;
  permissions: Permission[];
  managerEmailAddress: string;

  // TO-DO BILL: add comments for these three methods

  deserialize(user: any): User {
    Object.assign(this, user);
    return this;
  }


  minutesSinceLastUpdate(): number {
    return moment().diff(moment(this.lastUpdateDate), 'minutes');
  }

}

