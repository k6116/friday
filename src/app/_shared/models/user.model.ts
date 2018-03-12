
import {Deserializable} from './deserializable.model';

export class User implements Deserializable<User> {

  id: number;
  fullName: string;
  userName: string;
  email: string;
  roleID: number;
  loginEnabled: boolean;
  forcePasswordReset: boolean;
  createdBy: number;
  createdAt: string;
  updatedBy: number;
  updatedAt: string;

  deserialize(input: any): User {
    Object.assign(this, input);
    return this;
  }

  isLoginEnabled(): boolean {
    return this.loginEnabled;
  }

}

