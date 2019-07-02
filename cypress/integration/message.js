import { render } from '../commands'
import { getMessage, expectMessage, MESSAGE_TYPE } from '../../src/message'

const renderMessage = (content, type = 'info') =>
  cy.window().then(({ antd: { message } }) => {
    message[type](content)
  })

describe('getMessage', () => {
  it('finds a message', () => {
    renderMessage('We come in peas!')
    getMessage().should('have.text', 'We come in peas!')
  })

  it('finds a specific type of message', () => {
    renderMessage('We come in warts!')
    getMessage(MESSAGE_TYPE.WARNING).should('not.exist')
    renderMessage('Surrender all cake!', 'warn')
    getMessage(MESSAGE_TYPE.WARNING).should('have.text', 'Surrender all cake!')
  })
})

describe('expectMessage', () => {
  it('expects a specific message', () => {
    renderMessage('Looking for Waldo…', 'loading')
    expectMessage('Looking for Waldo…')
    expectMessage('Looking for Waldo…', MESSAGE_TYPE.LOADING)
  })
})

describe('inside `within`', () => {
  it('works just as well', () => {
    render(({ React }) => <div id="context">Dummy content…</div>)
    renderMessage('Just chilling out here…')
    cy.get('#context').within(() => {
      getMessage().should('exist')
      expectMessage('Just chilling out here…')
    })
  })
})
