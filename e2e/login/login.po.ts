import { browser, by, element, protractor } from 'protractor';

export class LoginPage {

  private credentials = {
    userName: 'chuetzle',
    password: '2milkbon#'
  };

  navigateTo() {
    return browser.get('/login');
  }

  fillCredentials(credentials: any = this.credentials) {
    const el = element(by.css('.login-user-name'));
    console.log(el);
    el.sendKeys('chuetzle');
    element(by.css('.login-password')).sendKeys('2milkbon#');
  }

  logIn() {
    return element(by.css('.btn-login')).click();
  }

  loginSuccess() {
    const EC = protractor.ExpectedConditions;
    // Waits for the URL to contain 'foo'.
    return browser.wait(EC.urlContains('dashboard'), 5000);
  }

}
