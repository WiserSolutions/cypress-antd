import { getNotification, expectNotification, getNotificationTitle, getNotificationBody } from '../../src/notification'

const renderNotification = ({
  type = 'info',
  title = 'Dummy Notification Title',
  content = 'Dummy notification content…'
} = {}) =>
  cy.window().then(({ antd: { notification } }) => {
    notification[type]({ message: title, description: content })
  })

describe('getNotification', () => {
  it('finds active notification', () => {
    getNotification().should('not.exist')
    renderNotification({ title: 'Born to be…', content: '…notified!' })
    getNotification().should('have.text', 'Born to be……notified!')
  })
})

describe('getNotificationTitle', () => {
  it('finds title of active notification', () => {
    getNotificationTitle().should('not.exist')
    renderNotification({ title: 'Love of My Life' })
    getNotificationTitle().should('have.text', 'Love of My Life')
  })

  it('finds notification title with specific text', () => {
    const title = 'Love of my life'
    renderNotification()
    renderNotification({ title })
    getNotificationTitle({ text: title }).should('have.text', title)
    getNotificationTitle({ text: "You've stolen my love" }).should('not.exist')
  })
})

describe('getNotificationBody', () => {
  it('finds body of active notification', () => {
    getNotificationBody().should('not.exist')
    renderNotification({ content: 'Unsustainable' })
    getNotificationBody().should('have.text', 'Unsustainable')
  })

  it('finds notification body with specific text', () => {
    const body = 'An economy based on endless growth is'
    renderNotification()
    renderNotification({ content: body })
    getNotificationBody({ text: body }).should('have.text', body)
    getNotificationBody({ text: 'Unsustainable' }).should('not.exist')
  })
})

describe('expectNotification', () => {
  it('expects any notification', () => {
    renderNotification()
    expectNotification()
  })

  it('expects notification with specific title', () => {
    renderNotification({ title: 'Still Alive' })
    expectNotification({ title: 'Still Alive' })
  })

  it('expects notification with specific body', () => {
    renderNotification({ content: "…and I'm stickin' it to myself." })
    expectNotification({ body: "…and I'm stickin' it to myself." })
  })

  it('expects notification with specific title and body', () => {
    const title = 'Never gonna give you up'
    const body = 'Never gonna let you down'
    renderNotification({ title, content: body })
    expectNotification({ title, body })
  })
})
