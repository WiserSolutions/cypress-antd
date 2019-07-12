import { absoluteRoot } from '@wisersolutions/cypress-without'
import pickBy from 'lodash/pickBy'

import { logAndMute } from './utils'

const find = (selector, text, options) => (text ? cy.contains(selector, text, options) : cy.get(selector, options))

export const getNotification = options => {
  const opts = logAndMute('getNotification', '', options)
  return absoluteRoot(opts).find('.ant-notification-notice:visible')
}

export const getNotificationTitle = ({ text, ...options } = {}) =>
  find('.ant-notification-notice:visible .ant-notification-notice-message', text, options)

export const getNotificationBody = ({ text, ...options } = {}) =>
  find('.ant-notification-notice:visible .ant-notification-notice-description', text, options)

export const expectNotification = ({ title, body, ...options } = {}) => {
  const opts = logAndMute('expectNotification', JSON.stringify(pickBy({ title, body }, Boolean)), options)
  getNotification(options).should('exist')
  if (title) {
    const title = getNotificationTitle({ text: title, ...opts }).should('exist')
    if (body) title.next(opts).should('have.text', body)
  } else if (body) {
    getNotificationBody({ text: body, ...opts }).should('exist')
  }
}
