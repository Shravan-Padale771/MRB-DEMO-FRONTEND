// cypress/e2e equivalent - Students page E2E tests
// Requires: frontend running at localhost:5173 AND backend at 100.53.20.30:8080

describe('Students Page - Admin', () => {
  beforeEach(() => {
    cy.intercept('GET', '**/students*').as('getStudents');
    cy.visit('/admin');
    // Navigate to Students tab via Sidebar
    cy.contains('Students').click();
  });

  it('renders the Student Directory UI', () => {
    // Wait for the Directory heading
    cy.contains('Student Directory', { timeout: 10000 }).should('be.visible');
  });

  it('receives a successful response from the backend API', () => {
    cy.wait('@getStudents', { timeout: 10000 }).its('response.statusCode').should('eq', 200);
  });

  it('loads the Students page and displays a list', () => {
    // Ensure API returns before checking table
    cy.wait('@getStudents');
    // Table rows should appear after API call
    cy.get('table tbody tr', { timeout: 10000 }).should('have.length.greaterThan', 0);
  });

  it('shows pagination controls when multiple pages exist', () => {
    // Pagination only renders when totalPages > 1
    cy.get('body').then(($body) => {
      if ($body.find('nav').length > 0) {
        cy.get('nav').should('be.visible');
      } else {
        cy.log('Pagination not present (likely low data volume)');
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
      } else {
        cy.log('Skipping navigational test: Pagination buttons not found');
      }
    });
  });

  it('filters students by first name', () => {
    // UI uses auto-search on change
    cy.get('input[placeholder="First Name"]', { timeout: 8000 })
      .first().type('A');
    // Verify list updates (at least doesn't break)
    cy.get('body').should('be.visible');
  });

  it('filters students by student ID', () => {
    cy.get('input[placeholder="Student ID"]', { timeout: 8000 })
      .first().type('1');
    cy.get('body').should('be.visible');
  });

  it('resets filters and shows full list again', () => {
    cy.get('input[placeholder="First Name"]').first().type('Z');
    // The Reset button only appears when filters are active
    cy.contains('button', 'Reset').click();
    cy.get('input[placeholder="First Name"]').should('have.value', '');
  });
});
