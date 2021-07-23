import { ifOnClock, logAndMute, MUTE, tickIfOnClock } from './utils'
import { absoluteRoot } from '@wisersolutions/cypress-without'

export const getPopover = options => absoluteRoot(options).find('.ant-popover:visible', options)

const forceShowPopover = options =>
  absoluteRoot(options)
    .find('.ant-popover')
    .then($el => $el.css({ 'pointer-events': 'all', opacity: 1 }))
const forceHidePopover = options =>
  absoluteRoot(options)
    .find('.ant-popover')
    .then($el => $el.css({ 'pointer-events': 'none', opacity: 0 }))

export const showPopover = options => $el => {
  const opts = logAndMute('showPopover', '', options)
  cy.wrap($el, MUTE).trigger('mouseover', { force: true, ...opts })
  tickIfOnClock(opts)
  ifOnClock(() => forceShowPopover(opts))
  return tickIfOnClock(opts).then(() => $el)
}

export const hidePopover = options => $el => {
  const opts = logAndMute('hidePopover', '', options)
  cy.wrap($el, MUTE).trigger('mouseover', { force: true, ...opts })
  tickIfOnClock(opts)
  ifOnClock(() => forceHidePopover(opts))
  return tickIfOnClock(opts).then(() => $el)
}
