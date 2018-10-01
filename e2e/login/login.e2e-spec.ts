import { LoginPage } from './login.po';
import { browser, by, element, protractor, until } from 'protractor';

declare var $: any;

describe('protractor-tutorial - Login page', () => {
  let page: LoginPage;

  const wrongCredentials = {
    userName: 'chuetzle',
    password: '$adsjkfs'
  };

  beforeEach(() => {
    page = new LoginPage();
  });

  it('when wrong credentials are entered, stay on login page and show error message', async() => {
    page.navigateTo();

    // await browser.wait(function() {
    //   return element(by.css('.btn-login')).isPresent();
    // }, 5000);
    // await element(by.css('.btn-login')).click();

    browser.wait(until.elementLocated(by.css('.btn-login')), 15000).then(() => {
      console.log('getting button');
      const button = element(by.id('login-buton'));
      button.click().then(() => {
        console.log('button has been clicked');
      });
    });

    // element(by.css('.btn-login'));
    // page.fillCredentials();
    // page.logIn();
    // const foo = element(by.css('.login-subtitle'));
    // console.log('foo:');
    // element(by.css('.login-password')).sendKeys('2milkbon#').then(() => {
    //   console.log('call back complete');
    //   expect(1).toEqual(1);
    // });
    // console.log(foo);
    // await foo.getText().then(function(name) {
    //   console.log('name:');
    //   console.log(name);
    //   expect(name).toBe('Resources');
    // });
    // console.log('foo getText:');
    // console.log(foo.getText());
    // expect(foo.getText()).toEqual('Resources');
  });

  // it('when correct credentials are entered, navigate to the dashboard page', () => {
  //   page.navigateTo();
  //   page.fillCredentials();
  //   page.logIn();
  //   expect(1).toEqual(1);
  // });

});
