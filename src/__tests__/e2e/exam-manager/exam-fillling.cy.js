describe('ExamManager Full 6-Step Flow E2E', () => {
  beforeEach(() => {
    // Visit admin dashboard and click on Exams
    cy.visit('/admin');
    cy.contains('Exams').click();
    // Ensure the create form is visible
    cy.contains('Create Exam').should('be.visible');
  });

  it('completes the entire 6-step exam creation flow', () => {
    // --- Step 0: Basic Information ---
    cy.get('#exam_code').type('E2E_EXAM_001');
    cy.get('#exam_name').type('E2E Comprehensive Test Exam');
    cy.get('#exam_fees').clear().type('750');
    cy.get('[data-testid="next-wizard-button"]').click();

    // --- Step 1: Dates & Schedule ---
    cy.contains('Dates & Schedule').should('be.visible');
    const today = new Date().toISOString().split('T')[0];
    const nextWeek = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];
    const nextMonth = new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0];
    const nextMonthEnd = new Date(Date.now() + 35 * 86400000).toISOString().split('T')[0];

    cy.get('#application_start_date').type(today);
    cy.get('#application_end_date').type(nextWeek);
    cy.get('#exam_start_date').type(nextMonth);
    cy.get('#exam_end_date').type(nextMonthEnd);
    cy.get('[data-testid="next-wizard-button"]').click();

    // --- Step 2: Papers Configuration ---
    cy.contains('Papers Configuration').should('be.visible');

    // Use selectall to overwrite any default value (like '1') with '2'
    cy.get('#no_of_papers').type('{selectall}2').should('have.value', '2');

    // Wait briefly for the UI to render the paper fields
    cy.get('#paper_0_name').should('be.visible').type('Mathematics');
    cy.get('#paper_0_marks').type('{selectall}100');

    cy.get('#paper_1_name').should('be.visible').type('English');
    cy.get('#paper_1_marks').type('{selectall}100');

    cy.get('[data-testid="next-wizard-button"]').click();

    // --- Step 3: Exam Identity ---
    cy.contains('Exam Identity').should('be.visible');
    cy.get('#examFullTitle').type('Full Title of E2E Exam');
    cy.get('#conductingBody').type('E2E Testing Body');
    cy.get('#board').type('Cypress Board');
    cy.get('#examLevel').type('Undergraduate');
    cy.get('#language').type('English');
    cy.get('#recognitionText').type('Recognized by E2E Standards');
    cy.get('[data-testid="next-wizard-button"]').click();

    // --- Step 4: Rules & Criteria ---
    cy.contains('Rules & Criteria').should('be.visible');
    cy.get('#eligibility').type('Minimum 60% in previous exams');
    cy.get('#passingCriteria').type('Must pass both papers individually');
    cy.get('#firstClass').clear().type('75');
    cy.get('#secondClass').clear().type('60');
    cy.get('#thirdClass').clear().type('40');
    cy.get('#failThreshold').clear().type('35');
    cy.get('[data-testid="next-wizard-button"]').click();

    // --- Step 5: Administrative Info (Final) ---
    cy.contains('Administrative Info').should('be.visible');
    cy.get('#signatoryName').type('John Doe');
    cy.get('#signatoryDesignation').type('Chief Test Officer');
    cy.get('#departmentName').type('E2E Dept');
    cy.get('#syllabusYear').type('2025');
    cy.get('#instructions').type('Read questions carefully before answering.');

    // Final Button should be "Create Exam"
    cy.get('[data-testid="next-wizard-button"]').should('contain', 'Create Exam');
    // cy.get('[data-testid="next-wizard-button"]').click(); // Uncomment to actually submit if API is ready
  });


});
