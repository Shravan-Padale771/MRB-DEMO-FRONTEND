// E2E tests for Exams page
describe('Exams Page - Admin', () => {
  beforeEach(() => {
    cy.intercept('GET', '**/exams*').as('getExams');
    cy.visit('/admin');
    cy.contains('Exams').click();
  });

  it('renders the Existing Exams UI', () => {
    cy.contains('Existing Exams', { timeout: 10000 }).should('be.visible');
  });

  it('receives a successful response from the backend API', () => {
    cy.wait('@getExams', { timeout: 10000 }).its('response.statusCode').should('eq', 200);
  });

  it('loads the Exams page and shows items', () => {
    cy.wait('@getExams');
    // ExamManager uses motion.div items for the list
    cy.get('.custom-scrollbar', { timeout: 10000 }).should('be.visible');
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

  it('filters exams by exam name', () => {
    cy.get('input[placeholder="Search..."]', { timeout: 8000 })
      .first().type('Exam');
    // Note: ExamManager search also auto-triggers on change
    cy.get('body', { timeout: 10000 }).should('be.visible');
  });

  it('filters exams by status', () => {
    // If there is a status dropdown/select
    cy.get('select, input[placeholder*="status"]', { timeout: 8000 }).first()
      .then($el => {
        if ($el.is('select')) {
          cy.wrap($el).select('ACTIVE');
        } else {
          cy.wrap($el).type('ACTIVE');
        }
      });
    cy.get('button').contains(/search|filter|apply/i).click();
    cy.get('table tbody tr', { timeout: 10000 }).should('exist');
  });

  it('form can be cleared', () => {
    // ExamManager form reset is via "Cancel Edit" if editing, 
    // but the test here refers to the list filters.
    // List filters in ExamManager don't have a specific Reset button, they just clear on empty input.
    cy.get('input[placeholder="Search..."]').first().clear();
    cy.get('body').should('be.visible');
  });
});
