
var expect = chai.expect;

describe('Login and Logout Tests', function() {

  beforeEach(function () {
    cy.log("I run before every test in every spec file!!!!!!")
  })

  it('Loads the login page', function() {

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
      console.log($text);
      console.log($text.text().trim());
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

    cy.wait('@loginRequest', {timeout: 10000}).then(function(xhr){
      console.log(xhr.response.body);
      // error message should be 'Invalid user name or password.  Note: Use your Windows credentials to login.'
      cy.get('td.login-notice-message').then(($text) => {
        expect($text.text().trim()).to.equal('Invalid user name or password.  Note: Use your Windows credentials to login.')
      })
    })
    

  })

  // it('Visits the login page', function() {
  //   cy.visit('/login')

  //   // cy.pause()
  //   cy.get('label.login-form-label')
    
  //   cy.get('input.login-user-name')
  //     .type('chuetzle')
  //     .should('have.value', 'chuetzle')

  //   cy.get('input.login-password').type(`2milkbon#`)

  //   cy.get('label.custom-control-label').click()

  //   cy.get('button.btn-login').click()

  //   // we should be redirected to /dashboard
  //   cy.url().should('include', '/dashboard')

  //   // our auth cookie should be present
  //   cy.getCookie('jrt_username').should('exist')

  //   // cy.pause()

  //   // UI should reflect this user being logged in
  //   cy.get('div.app-menu-text').then(($text) => {

  //     const userInitial = $text.text();
  //     console.log(userInitial)
  //     cy.log(userInitial)

  //     expect(userInitial).to.equal('B')

  //   })

  //   // .should('equal', 'B', { force: true })

  //   cy.get('div.app-menu-text').click()

  //   // cy.get('.app-sub-title').should('exist', { force: true })

  // })

  

})