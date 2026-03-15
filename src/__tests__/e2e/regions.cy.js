// E2E tests for Regions page
describe('Regions Page - Admin', () => {
  beforeEach(() => {
    cy.intercept('GET', '**/regions*').as('getRegions');
    cy.visit('/admin');
    cy.contains('Regions').click();
  });

  it('renders the Region Management UI', () => {
    cy.contains('Region Management', { timeout: 10000 }).should('be.visible');
  });

  it('receives a successful response from the backend API', () => {
    cy.wait('@getRegions', { timeout: 10000 }).its('response.statusCode').should('eq', 200);
  });

  it('loads the Regions page and shows cards', () => {
    cy.wait('@getRegions');
    // Regions use cards instead of a table
    cy.get('h4').should('have.length.greaterThan', 0);
  });

  it('displays the add region form', () => {
    cy.get('input[placeholder*="Enter Region Name"]').should('be.visible');
  });
});
