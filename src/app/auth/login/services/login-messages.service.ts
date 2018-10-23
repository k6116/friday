import { Injectable } from '@angular/core';
import { CacheService } from '../../../_shared/services/cache.service';
import { ToolsService } from '../../../_shared/services/tools.service';

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

    // create the message object; leave the text property undefined for now
    const message: IMessage = {
      text: undefined,
      iconClass: 'fa-exclamation-triangle',
      iconColor: this.cacheService.alertIconColor,
      display: true
    };

    // set the text property (message to display) based on whether username and/or password are populated
    if (!userName && !password) {
      message.text = 'Please enter your user name and password.';
    } else if (!userName) {
      message.text = 'Please enter your user name.';
    } else if (!password) {
      message.text = 'Please enter your password.';
    }

    // return the message object
    return message;

  }

  // clear the error message by returning an object with display set to false
  clearFormEntryError(): IMessage {
    return {
      text: undefined,
      iconClass: undefined,
      iconColor: undefined,
      display: false
    };
  }

  // called by the component get an error message object (with display true) or object to clear the error (with display false)
  getFormEntryMessage(userName: string, password: string): IMessage {
    if (!userName || !password) {
      return this.getFormEntryError(userName, password);
    } else {
      return this.clearFormEntryError();
    }
  }

  // called by the component to get a message to display that the user has been automatically logged out for security
  getAutoLogoutMessage(): IMessage {
    const autoLogout = this.cacheService.autoLogout$;
    return {
      text: autoLogout.message,
      iconClass: autoLogout.iconClass,
      iconColor: autoLogout.iconColor,
      display: true
    };
  }

  // callled by the component if the server returns an error on login button click
  // to display a proper error message below the login button and show modal if needed
  getLoginErrorMessage(error: any): IMessage {

    const message: IMessage = {
      text: undefined,
      iconClass: 'fa-exclamation-triangle',
      iconColor: this.cacheService.alertIconColor,
      display: true
    };

    if (error.status === 401) {
      if (JSON.parse(error.text()).title === 'invalid user credentials') {
        message.text = 'Invalid user name or password.  Note: Use your Windows credentials to login.';
      }
    } else if (error.hasOwnProperty('name')) {
      if (error.name === 'TimeoutError') {
        message.text = 'The server is not responding. Please check your connection to the Keysight network.';
        this.toolsService.displayTimeoutError();
      }
    } else if (error.status === 0) {
        message.text = 'Error: connection refused. Please check your connection to the Keysight network.';
    } else {
      message.text = 'Sorry, an unexpected error occured.  Please contact support.';
    }
    // add handling for sequelize errors here

    return message;

  }


}
