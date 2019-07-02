import { snakeCase } from 'lodash'

export const MUTE = { log: false }

export const mute = options => Object.assign({}, options, MUTE)

export function log(name, message = '', options = { log: true }) {
  if (options.log) {
    cy.wrap({ name, displayName: snakeCase(name), message }, MUTE).then(Cypress.log)
  }
}

export function logAndMute(name, message, options = { log: true }) {
  log(name, message, options)
  return mute(options)
}

export const expectVisibleText = selector => expectedText =>
  selector()
    .should('be.visible')
    .and('have.text', expectedText)
