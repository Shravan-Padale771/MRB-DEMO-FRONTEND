// E2E tests for Regions page
describe('Regions Page - Admin', () => {
  beforeEach(() => {
    cy.visit('/admin');
    cy.contains('Regions').click();
    cy.contains('Region Management', { timeout: 10000 }).should('be.visible');
  });

  it('loads the Regions page and shows cards', () => {
    // Regions use cards instead of a table
    cy.get('h4').should('have.length.greaterThan', 0);
  });

  it('displays the add region form', () => {
    cy.get('input[placeholder*="Enter Region Name"]').should('be.visible');
  });
});
