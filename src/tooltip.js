import { absoluteRoot } from '@wisersolutions/cypress-without'

export const getTooltip = (text, options) =>
  text
    ? absoluteRoot().contains('.ant-tooltip:visible', text, options)
    : absoluteRoot().find('.ant-tooltip:visible', options)

export const expectTooltip = (text, options) => getTooltip(text, options).should('exist')

export const shouldHaveTooltip = (text, options = {}) => $el => {
  cy.wrap($el).trigger('mouseover', { force: true, ...options })
  expectTooltip(text, options)
  cy.wrap($el).trigger('mouseout', { force: true, ...options })
  getTooltip(text).should('not.exist')
}
