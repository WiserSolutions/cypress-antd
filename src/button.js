export function getButton(label, options) {
  return cy.contains('button', label, options)
}
