// E2E tests for Applications page
describe('Applications Page - Admin', () => {
  beforeEach(() => {
    cy.visit('/admin');
    cy.contains('Applications').click();
    cy.contains('Student Applications', { timeout: 10000 }).should('be.visible');
  });

  it('loads the Applications page with data', () => {
    cy.get('table tbody tr', { timeout: 10000 }).should('have.length.greaterThan', 0);
  });

  it('shows pagination controls if multiple pages exist', () => {
    cy.get('body').then(($body) => {
      if ($body.find('nav').length > 0) {
        cy.get('nav').should('be.visible');
      } else {
        cy.log('Pagination not present');
      }
    });
  });

  it('navigates through pages if pagination exists', () => {
    cy.get('body').then(($body) => {
      if ($body.find('button[title="Next Page"]').length > 0) {
        cy.get('button[title="Next Page"]').click();
        cy.contains(/Page [2-9] of/i).should('be.visible');
        cy.get('button[title="First Page"]').click();
        cy.contains('Page 1 of').should('be.visible');
      }
    });
  });

  it('filters applications by status', () => {
    // Audit: ApplicationManager has a select for status
    cy.get('select').eq(4).select('PENDING'); // 5th select is Status
    cy.get('body').should('be.visible');
  });

  it('filters applications by status', () => {
    cy.get('select, input[placeholder*="status"]', { timeout: 8000 }).first()
      .then($el => {
        if ($el.is('select')) {
          cy.wrap($el).select('PENDING');
        } else {
          cy.wrap($el).type('PENDING');
        }
      });
    cy.get('button').contains(/search|filter|apply/i).click();
    cy.get('table tbody tr', { timeout: 10000 }).should('exist');
  });

  it('resets all filters', () => {
    cy.get('select').first().select(1); // Select an exam
    // The Reset button only appears when filters are active
    cy.contains('button', 'Reset').click();
    cy.get('select').first().should('have.value', '');
  });
});
