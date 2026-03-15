describe('ExamManager Direct Validation', () => {
  it('validates Step 1 Basic Info, Step 2 Dates, and Step 2 Papers', () => {
    cy.visit('/admin');
    cy.contains('Exams').click();
    
    // --- STEP 1: Basic Info ---
    cy.get('#exam_code').clear();
    cy.get('#exam_name').clear();
    cy.get('[data-testid="next-wizard-button"]').click();
    cy.get('[data-testid="error-exam_code"]').should('contain', 'Exam Code is required');
    cy.get('#exam_code').type('E2E_VAL_003');
    cy.get('#exam_name').type('E2E Full Validation');
    cy.get('#exam_fees').type('{selectall}700');
    cy.get('[data-testid="next-wizard-button"]').click();

    // --- STEP 2: Dates & Schedule ---
    cy.contains('Dates & Schedule').should('be.visible');
    const today = new Date().toISOString().split('T')[0];
    const nextMonth = new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0];
    cy.get('#application_start_date').clear().type(today);
    cy.get('#application_end_date').clear().type(nextMonth);
    cy.get('#exam_start_date').clear().type(nextMonth);
    cy.get('#exam_end_date').clear().type(nextMonth);
    cy.get('[data-testid="next-wizard-button"]').click();

    // --- STEP 3: Papers Configuration ---
    cy.contains('Papers Configuration').should('be.visible');

    // 1. Dynamic Rendering: Enter 3 papers
    cy.get('#no_of_papers').type('{selectall}3');
    cy.get('#paper_0_name').should('be.visible');
    cy.get('#paper_1_name').should('be.visible');
    cy.get('#paper_2_name').should('be.visible');
    cy.get('#paper_3_name').should('not.exist');

    // 2. Clear a paper name and check error
    cy.get('#paper_0_name').clear();
    cy.get('[data-testid="next-wizard-button"]').click();
    cy.get('[data-testid="error-paper_0_name"]').should('contain', 'Required');
    cy.get('#paper_0_name').type('Paper 1');

    // 3. Test Oral Marks
    cy.contains('Include Oral Exam').click();
    cy.get('#oralMarks').should('be.visible').clear();
    cy.get('[data-testid="next-wizard-button"]').click();
    cy.get('[data-testid="error-oralMarks"]').should('contain', 'Oral Marks is required');
    cy.get('#oralMarks').type('50');

    // 4. Test Project Marks
    cy.contains('Include Project Work').click();
    cy.get('#projectMarks').should('be.visible').clear();
    cy.get('[data-testid="next-wizard-button"]').click();
    cy.get('[data-testid="error-projectMarks"]').should('contain', 'Project Marks is required');
    cy.get('#projectMarks').type('50');

    // Fill other paper names to proceed
    cy.get('#paper_1_name').type('Paper 2');
    cy.get('#paper_2_name').type('Paper 3');
    cy.get('[data-testid="next-wizard-button"]').click();

    // --- STEP 4: Exam Identity ---
    cy.contains('Exam Identity').should('be.visible');
    cy.get('#examFullTitle').clear();
    cy.get('[data-testid="next-wizard-button"]').click();
    cy.get('[data-testid="error-examFullTitle"]').should('contain', 'Full Title is required');
    
    // Fill required
    cy.get('#examFullTitle').type('Identity Full Title');
    cy.get('#conductingBody').clear();
    cy.get('[data-testid="next-wizard-button"]').click();
    cy.get('[data-testid="error-conductingBody"]').should('contain', 'Body is required');
    cy.get('#conductingBody').type('E2E Body');
    cy.get('#board').type('E2E Board');
    cy.get('#examLevel').type('E2E Level');
    cy.get('#language').type('E2E Language');
    cy.get('[data-testid="next-wizard-button"]').click();

    // --- STEP 5: Rules & Criteria ---
    cy.contains('Rules & Criteria').should('be.visible');
    cy.get('#eligibility').clear();
    cy.get('[data-testid="next-wizard-button"]').click();
    cy.get('[data-testid="error-eligibility"]').should('contain', 'Eligibility is required');
    cy.get('#eligibility').type('E2E Eligibility');
    cy.get('#passingCriteria').type('E2E Passing');
    cy.get('#firstClass').type('{selectall}350');
    cy.get('#secondClass').type('{selectall}250');
    cy.get('#thirdClass').type('{selectall}175');
    cy.get('#failThreshold').type('{selectall}174');
    cy.get('[data-testid="next-wizard-button"]').click();

    // --- STEP 6: Administrative Info ---
    cy.contains('Administrative Info').should('be.visible');
    cy.get('#signatoryName').clear();
    cy.get('[data-testid="next-wizard-button"]').click();
    cy.get('[data-testid="error-signatoryName"]').should('contain', 'Signatory Name is required');
    cy.get('#signatoryName').type('E2E Signatory');
    cy.get('#signatoryDesignation').type('E2E Designation');
    cy.get('#departmentName').type('E2E Dept');
    cy.get('#syllabusYear').type('2026-2027');
    cy.get('#instructions').type('E2E Instructions');
    
    // Final button check
    cy.get('[data-testid="next-wizard-button"]').should('contain', 'Create Exam');
  });
});
