import { logAndMute, MUTE, tickIfOnClock } from './utils'
import { absoluteRoot } from '@hon2a/cypress-without'

export const getPopover = () => absoluteRoot().find('.ant-popover:visible')

export const showPopover = options => $el => {
  const opts = logAndMute('showPopover', '', options)
  cy.wrap($el, MUTE).trigger('mouseover', { force: true, ...opts })
  return tickIfOnClock(opts).then(() => $el)
}

export const hidePopover = options => $el => {
  const opts = logAndMute('hidePopover', '', options)
  cy.wrap($el, MUTE).trigger('mouseover', { force: true, ...opts })
  return tickIfOnClock(opts).then(() => $el)
}
