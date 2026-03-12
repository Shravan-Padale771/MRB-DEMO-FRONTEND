import React from 'react'
import StudentDashboard from './StudentDashboard'

describe('<StudentDashboard />', () => {
  it('renders', () => {
    // see: https://on.cypress.io/mounting-react
    cy.mount(<StudentDashboard />)
  })
})