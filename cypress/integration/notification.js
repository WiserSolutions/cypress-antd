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

  it('finds notification by title', () => {
    renderNotification()
    getNotification({ title: 'Synergy!' }).should('not.exist')
    renderNotification({ type: 'success', title: 'Synergy!' })
    getNotification({ title: 'Synergy!' }).should('exist')
  })

  it('finds notification by body', () => {
    renderNotification()
    getNotification({ body: 'Who needs you?' }).should('not.exist')
    renderNotification({ type: 'warn', content: 'Who needs you?' })
    getNotification({ body: 'Who needs you?' }).should('exist')
  })

  it('finds notification by both title and body', () => {
    const title = 'Soffit panels, circuit brakers, vacuum cleaners, coffee makers'
    const body = 'Calculators, generators, matching salt and pepper shakers'
    renderNotification({ title })
    renderNotification({ content: body })
    getNotification({ title, body }).should('not.exist')
    renderNotification({ title, content: body })
    getNotification({ title, body }).should('exist')
  })
})

describe('getNotificationTitle', () => {
  it('finds title of specific notification', () => {
    const title = 'Love of my life'
    const body = "don't leave me"
    renderNotification({ title, content: body })
    getNotificationTitle({ body }).should('have.text', title)
  })
})

describe('getNotificationBody', () => {
  it('finds body of specific notification', () => {
    const title = 'Unsustainable'
    const body = 'An economy based on endless growth is'
    renderNotification({ title, content: body })
    getNotificationBody({ title }).should('have.text', body)
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
