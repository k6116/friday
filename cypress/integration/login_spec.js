
var expect = chai.expect;

describe('Login and Logout Tests', function() {

  before(() => {
    cy.clearCookie('jrt_username')
  })


  beforeEach(function () {
    cy.log("I run before every test in every spec file!!!!!!")

    Cypress.Cookies.preserveOnce("jrt_username")

  })


  afterEach(() => {
    cy.wait(2000)
  })


  it('Loads the login page', function() {

    // cy.pause()

    // go to the login page
    cy.visit('/login')

    // validate the url
    cy.url().should('contain', '/login')

  })


  it('Displays error if no username and password', function() {

    // click the login button
    cy.get('button.btn-login').click()

    // error message should be 'Please enter your user name and password'
    cy.get('td.login-notice-message').then(($text) => {
      // console.log($text);
      // console.log($text.text().trim());
      expect($text.text().trim()).to.equal('Please enter your user name and password')
    })

  })


  it('Displays error if no password', function() {

    // enter username
    cy.get('input.login-user-name').type('chuetzle')

    // click the login button
    cy.get('button.btn-login').click()

    // error message should be 'Please enter your password'
    cy.get('td.login-notice-message').then(($text) => {
      expect($text.text().trim()).to.equal('Please enter your password')
    })

  })


  it('Displays error if no username', function() {

    // clear username
    cy.get('input.login-user-name').clear()

    // enter password
    cy.get('input.login-password').type('$jaskf!f')

    // click the login button
    cy.get('button.btn-login').click()

    // error message should be 'Please enter your user name'
    cy.get('td.login-notice-message').then(($text) => {
      expect($text.text().trim()).to.equal('Please enter your user name')
    })

  })


  it('Displays error if invalid user name and password', function() {

    // clear username, enter new one
    cy.get('input.login-user-name').clear()
    cy.get('input.login-user-name').type('chuetzle')

    // clear password, enter new one (invalid)
    cy.get('input.login-password').clear()
    cy.get('input.login-password').type('$jaskf!f')

    cy.server()

    cy.route({
      method: 'post',
      url: 'http://localhost:3000/api/auth/authenticate',
      body: {userName: "chuetzle", password: "sdafasd#"}
    }).as('loginRequest')

    // click the login button
    cy.get('button.btn-login').click()

    cy.wait('@loginRequest', {timeout: 10000})
    .then(function(xhr){
      // console.log(xhr)
      // console.log(xhr.response.body);
      expect(xhr.status).to.equal(500);
      expect(xhr.response.body.title).to.equal('invalid user credentials')
      // error message should be 'Invalid user name or password.  Note: Use your Windows credentials to login.'
      cy.get('td.login-notice-message').then(($text) => {
        expect($text.text().trim()).to.equal('Invalid user name or password.  Note: Use your Windows credentials to login.')
      })
    })

  })


  it('Logs in successfully', function() {

    // clear username, enter new one
    cy.get('input.login-user-name').clear()
    cy.get('input.login-user-name').type('chuetzle')

    // clear password, enter new one (invalid)
    cy.get('input.login-password').clear()
    cy.get('input.login-password').type('2milkbon#')

    cy.server()

    cy.route({
      method: 'post',
      url: 'http://localhost:3000/api/auth/authenticate',
      body: {userName: "chuetzle", password: "2milkbon#"}
    }).as('loginRequest')

    // click the login button
    cy.get('button.btn-login').click()

    cy.wait('@loginRequest', {timeout: 10000}).then(function(xhr){
      // console.log(xhr.response.body);
      // console.log(cy.getCookie('jrt_username'))
      expect(xhr.status).to.equal(200);
      expect(xhr.response.body.jarvisUser.fullName).to.equal('Bill Schuetzle')
      // we should be redirected to /dashboard
      cy.url().should('include', '/dashboard')
    })
    
  })


  it(`Sets the user's initial in the circle icon`, () => {

    // user initial should be 'B'
    cy.get('div.app-menu-text').then(($text) => {
      expect($text.text().trim()).to.equal('B')
    })

  })


  it('Logs out successfully', () => {

    // click the 'B' circle icon
    cy.get('div.app-menu-text').click()

    // click the logout buton
    cy.get('button.app-menu-dropdown-button.logout').click({ force: true })

    // we should be redirected to /dashboard
    cy.url().should('equal', 'http://localhost:3000/login')

  })


  it('Logs in with Remember Me checkced', function() {

    // clear username, enter new one
    cy.get('input.login-user-name').clear()
    cy.get('input.login-user-name').type('chuetzle')

    // clear password, enter new one (invalid)
    cy.get('input.login-password').clear()
    cy.get('input.login-password').type('2milkbon#')

    // click the Remember Me label to enable the checkcbox
    cy.get('label.custom-control-label').click()

    cy.server()

    cy.route({
      method: 'post',
      url: 'http://localhost:3000/api/auth/authenticate',
      body: {userName: "chuetzle", password: "2milkbon#"}
    }).as('loginRequest')

    // click the login button
    cy.get('button.btn-login').click()

    cy.wait('@loginRequest', {timeout: 10000}).then(function(xhr){
      // console.log(xhr.response.body);
      // console.log(cy.getCookie('jrt_username'))
      expect(xhr.status).to.equal(200);
      expect(xhr.response.body.jarvisUser.fullName).to.equal('Bill Schuetzle')
      // we should be redirected to /dashboard
      cy.url().should('include', '/dashboard')
    })

    // the remember me cookie should be present
    cy.getCookie('jrt_username').should('exist')

    cy.getCookie('jrt_username').then(cookie => {
      console.log(cookie);
      expect(cookie.value).to.equal('chuetzle');
    })
    
  })


  it('Logs out again', () => {

    // click the 'B' circle icon
    cy.get('div.app-menu-text').click()

    // click the logout buton
    cy.get('button.app-menu-dropdown-button.logout').click()
    // cy.get('button.app-menu-dropdown-button.logout').click({ force: true })

    // we should be redirected to /login
    cy.url().should('equal', 'http://localhost:3000/login')

  })

  it('Remembers User Name', () => {

    // expect the user name to be populated with 'chuetzle'
    cy.get('input.login-user-name').then(($text) => {
      console.log($text)
      expect($text.val()).to.equal('chuetzle')
    })

  })

  

})