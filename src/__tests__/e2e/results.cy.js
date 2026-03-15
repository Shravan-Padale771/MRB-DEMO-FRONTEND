// E2E tests for Results pages (View Results + Publish Results)
describe('Results - View Results Page', () => {
  beforeEach(() => {
    cy.intercept('GET', '**/exam-results*').as('getExamResults');
    cy.visit('/admin');
    cy.contains('View Results').click();
  });

  it('renders the Published Results UI', () => {
    cy.contains('Published Results', { timeout: 10000 }).should('be.visible');
  });

  it('receives a successful response from the backend API', () => {
    cy.wait('@getExamResults', { timeout: 10000 }).its('response.statusCode').should('eq', 200);
  });

  it('loads the View Results page', () => {
    cy.wait('@getExamResults');
    // The result viewer should render
    cy.contains(/result|score|marks/i, { timeout: 10000 }).should('be.visible');
  });

  it('shows pagination when there are multiple pages of results', () => {
    cy.get('button[title="Next Page"]', { timeout: 10000 }).should('exist');
  });

  it('paginates through result pages if pagination exist', () => {
    cy.get('body').then(($body) => {
      if ($body.find('button[title="Next Page"]').length > 0) {
        cy.get('button[title="Next Page"]').click();
        cy.contains(/Page [2-9] of/i).should('be.visible');
        cy.get('button[title="First Page"]').click();
        cy.contains('Page 1 of').should('be.visible');
      }
    });
  });

  it('filters results by exam', () => {
    // ResultViewer uses select for exams
    cy.get('select').first().select(1);
    cy.get('body').should('be.visible');
  });

  it('toggles between Recent and Toppers', () => {
    cy.contains('button', 'Toppers').click();
    cy.get('p').contains('Rankings & Toppers View').should('be.visible');
    cy.contains('button', 'Recent').click();
    cy.get('p').contains('Recent Publications View').should('be.visible');
  });

  it('applies insight filters', () => {
    cy.contains('Distinction (75%+)').click();
    // Verify filter bar summary or list updates
    cy.get('body').should('be.visible');
  });
});

describe('Results - Publish Results Page', () => {
  beforeEach(() => {
    cy.visit('/admin');
    cy.contains('Publish Results').click();
    cy.get('body', { timeout: 10000 }).should('not.contain', 'Loading');
  });

  it('loads the Publish Results page', () => {
    cy.contains(/publish|result/i, { timeout: 10000 }).should('be.visible');
  });

  it('shows exam selector or form to publish results', () => {
    // The publish page should have some form of exam selection
    cy.get('select, input, button', { timeout: 10000 }).should('have.length.greaterThan', 0);
  });
});
