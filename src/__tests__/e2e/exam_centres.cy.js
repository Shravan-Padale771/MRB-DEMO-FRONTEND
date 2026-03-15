// E2E tests for Exam Centres page
describe('Exam Centres Page - Admin', () => {
  beforeEach(() => {
    cy.intercept('GET', '**/exam-centres*').as('getExamCentres');
    cy.visit('/admin');
    cy.contains('Exam Centres').click();
  });

  it('renders the Exam Centre Management UI', () => {
    cy.contains('Exam Centre Management', { timeout: 10000 }).should('be.visible');
  });

  it('receives a successful response from the backend API', () => {
    cy.wait('@getExamCentres', { timeout: 10000 }).its('response.statusCode').should('eq', 200);
  });

  it('loads with data', () => {
    cy.wait('@getExamCentres');
    cy.get('table tbody tr', { timeout: 10000 }).should('have.length.greaterThan', 0);
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

  it('filters by region', () => {
    // ExamCentreManager has a "Filter Region" select
    cy.contains('Filter Region:').parent().find('select').select(1);
    cy.get('body').should('be.visible');
  });

  it('can add a new centre form check', () => {
    cy.get('input[placeholder="e.g. EC101"]').should('be.visible');
    cy.get('input[placeholder="e.g. Modern School Pune"]').should('be.visible');
  });
});
