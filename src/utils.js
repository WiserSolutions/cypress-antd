import snakeCase from 'lodash/snakeCase'

// region: Logging

export const MUTE = { log: false }

const mute = options => Object.assign({}, options, MUTE)

function log(name, message = '', { log: shouldLog = true } = {}) {
  if (shouldLog) {
    cy.wrap({ name, displayName: snakeCase(name), message }, MUTE).then(Cypress.log)
  }
}

export function logAndMute(name, message, options = { log: true }) {
  log(name, message, options)
  return mute(options)
}

// endregion
// region: Clock

export const getClock = callback =>
  cy.wrap([], MUTE).then(function () {
    callback(this.clock)
  })

export const tickIfOnClock = ({ tickInterval = 100 } = {}) =>
  getClock(clock => {
    if (clock) clock.tick(tickInterval)
  })

// endregion
// region: Macros

export const triggerAliased =
  (commandName, eventName, defaultOptions = {}) =>
  options =>
  $el => {
    const opts = logAndMute(commandName, '', options)
    cy.wrap($el, MUTE).trigger(eventName, { ...defaultOptions, ...opts })
  }

export const expectVisibleText = selector => expectedText =>
  selector().should('be.visible').and('have.text', expectedText)

// endregion
