import { logAndMute } from './utils'

export const getNotification = ({ title, body, ...options } = {}) => {
  const opts = logAndMute(
    'getNotification',
    title || body
      ? [['title', title], ['body', body]]
          .filter(([, value]) => value)
          .map(([key, value]) => `${key}: ${value}`)
          .join(', ')
      : '',
    options
  )
  const { $ } = Cypress
  return cy.root(opts).then(root =>
    $(root)
      .find('.ant-notification-notice:visible')
      .filter((idx, el) => {
        if (title) {
          const actualTitle = $(el)
            .find('.ant-notification-notice-message')
            .text()
          if (actualTitle !== title) return false
        }
        if (body) {
          const actualBody = $(el)
            .find('.ant-notification-notice-description')
            .text()
          if (actualBody !== body) return false
        }
        return true
      })
  )
}

export const getNotificationTitle = options => getNotification(options).find('.ant-notification-notice-message')

export const getNotificationBody = options => getNotification(options).find('.ant-notification-notice-description')

export const expectNotification = options => getNotification(options).should('exist')
