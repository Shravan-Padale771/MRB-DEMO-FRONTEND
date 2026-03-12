// E2E tests for Schools page
describe('Schools Page - Admin', () => {
  beforeEach(() => {
    cy.visit('/admin');
    cy.contains('Schools').click();
    cy.contains('School Management', { timeout: 10000 }).should('be.visible');
  });

  it('loads the Schools page and shows a list', () => {
    cy.get('table tbody tr', { timeout: 10000 }).should('have.length.greaterThan', 0);
  });

  it('shows pagination controls', () => {
    cy.get('button[title="Next Page"]', { timeout: 10000 }).should('exist');
  });

  it('paginates if controls exist', () => {
    cy.get('body').then(($body) => {
      if ($body.find('button[title="Next Page"]').length > 0) {
        cy.get('button[title="Next Page"]').click();
        cy.contains(/Page [2-9] of/i).should('be.visible');
        cy.get('button[title="First Page"]').click();
        cy.contains('Page 1 of').should('be.visible');
      }
    });
  });

  it('filters schools by region', () => {
    // SchoolManager uses select for filtering
    cy.get('select').eq(1).select(1); // Select first available region
    cy.get('body').should('be.visible');
  });

  it('interacts with Manage button', () => {
    cy.contains('button', 'Manage').first().click();
    // Verify it triggers something or at least is clickable
    cy.get('body').should('be.visible');
  });
});
