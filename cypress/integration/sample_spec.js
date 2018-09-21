
describe('My First Test', function() {
  it('Does not do much!', function() {
    console.log('executing my first test spec 1');
    expect(true).to.equal(true)
  })

  it('Visits the login page', function() {
    cy.visit('/login')

    // cy.pause()
    
    cy.get('input.login-user-name')
      .type('chuetzle')
      .should('have.value', 'chuetzle')

    cy.get('input.login-password').type(`2milkbon#`)

    cy.get('input[type=checkbox]').click()

    cy.get('button.btn-login').click()

    // we should be redirected to /dashboard
    cy.url().should('include', '/dashboard')

    // our auth cookie should be present
    cy.getCookie('jrt_username').should('exist')

    // UI should reflect this user being logged in
    cy.get('div.app-menu-text').should('equal', 'B')
  })

  

})