import { logAndMute, MUTE, tickIfOnClock } from './utils'

export const getPopover = () => cy.get('.ant-popover:visible')

export const showPopover = options => $el => {
  const opts = logAndMute('showPopover', '', options)
  cy.wrap($el, MUTE).trigger('mouseover', { force: true, ...opts })
  tickIfOnClock().then(() => $el)
}

export const hidePopover = options => $el => {
  const opts = logAndMute('hidePopover', '', options)
  cy.wrap($el, MUTE).trigger('mouseover', { force: true, ...opts })
  tickIfOnClock().then(() => $el)
}
