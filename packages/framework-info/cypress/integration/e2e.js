describe('Detects frameworks', () => {
  beforeEach(() => {
    cy.visit('/')
  })
  it('Next.js site framework detected on load - react site', () => {
    cy.contains('React Site').click()
    cy.contains('"name":"Next.js"')
  })
})
