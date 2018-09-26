import { Injectable } from '@angular/core';
import { CacheService } from '../../_shared/services/cache.service';
import { ToolsService } from '../../_shared/services/tools.service';

export interface IMessage {
  text: string;
  iconClass: string;
  iconColor: string;
  display: boolean;
}

@Injectable()
export class LoginMessagesService {

  constructor(
    private cacheService: CacheService,
    private toolsService: ToolsService
  ) { }


  // get error message object for missing user name and/or password
  getFormEntryError(userName: string, password: string): IMessage {

    const message: IMessage = {
      text: undefined,
      iconClass: 'fa-exclamation-triangle',
      iconColor: this.cacheService.alertIconColor,
      display: true
    };

    if (!userName && !password) {
      message.text = 'Please enter your user name and password.';
    } else if (!userName) {
      message.text = 'Please enter your user name.';
    } else if (!password) {
      message.text = 'Please enter your password.';
    }

    return message;

  }

  clearFormEntryError(): IMessage {
    return {
      text: undefined,
      iconClass: undefined,
      iconColor: undefined,
      display: false
    };
  }

  getFormEntryMessage(userName: string, password: string): IMessage {
    if (!userName || !password) {
      return this.getFormEntryError(userName, password);
    } else {
      return this.clearFormEntryError();
    }
  }


  getAutoLogoutMessage(): IMessage {
    const autoLogout = this.cacheService.autoLogout$;
    return {
      text: autoLogout.message,
      iconClass: autoLogout.iconClass,
      iconColor: autoLogout.iconColor,
      display: true
    };
  }

  getLoginErrorMessage(error: any): IMessage {

    console.log(error);

    const message: IMessage = {
      text: undefined,
      iconClass: 'fa-exclamation-triangle',
      iconColor: this.cacheService.alertIconColor,
      display: true
    };

    if (error.hasOwnProperty('title')) {
      if (error.title === 'invalid user credentials') {
        message.text = 'Invalid user name or password.  Note: Use your Windows credentials to login.';
      }
    } else if (1 === 1) {
      message.text = 'Some other error';
      this.toolsService.displayTimeoutError();
    }

    return message;

  }


}
