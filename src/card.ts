export function getCardTitle() {
  return cy.get('.ant-card-head-title')
}

export function getCardContent() {
  return cy.get('.ant-card-body')
}

export function getCardActions() {
  return cy.get('.ant-card-extra')
}
