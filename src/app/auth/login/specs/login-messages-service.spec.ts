import { LoginMessagesService } from '../services/login-messages.service';
import { CacheService } from '../../../_shared/services/cache.service';
import { ToolsService } from '../../../_shared/services/tools.service';
import { Response, ResponseOptions, ResponseType, Request } from '@angular/http';
import { MockConnection } from '@angular/http/testing';

class MockError extends Response implements Error {
  name: any;
  message: any;
}

describe('Login Messages Service', () => {

  let loginMessagesService: LoginMessagesService;
  let cacheService: CacheService;
  let toolsService: ToolsService;

  beforeEach(() => {
    cacheService = new CacheService();
    toolsService = new ToolsService(cacheService);
    loginMessagesService = new LoginMessagesService(cacheService, toolsService);
  });

  it(`should return 'Please enter your user name and password.' if no inputs`, () => {
    expect(loginMessagesService.getFormEntryMessage(undefined, undefined).text).toEqual('Please enter your user name and password.');
  });

  it(`should return 'Please enter your password.' if no password`, () => {
    expect(loginMessagesService.getFormEntryMessage('chuetzle', undefined).text).toEqual('Please enter your password.');
  });

  it(`should return 'Please enter your user name.' if no user name`, () => {
    expect(loginMessagesService.getFormEntryMessage(undefined, 'adjfhkfasd').text).toEqual('Please enter your user name.');
  });

  // it(`should return 'Invalid user name or password.  Note: Use your Windows credentials to login.' if no user name`, () => {

  //   const body = JSON.stringify({title: 'invalid user credentials'});
  //   const opts = {type: ResponseType.Error, status: 401, body: body};
  //   const responseOpts = new ResponseOptions(opts);
  //   const mockError = new MockError(responseOpts);

  //   console.log(mockError);

  //   expect(loginMessagesService.getLoginErrorMessage(mockError).text)
  //     .toEqual('Invalid user name or password.  Note: Use your Windows credentials to login.');

  // });


});
