import { render } from '../commands'
import { getPopover, showPopover, hidePopover } from '../../src/popover'

const renderPopover = ({ title = 'Dummy Popover Title', content = 'Dummy popover content…', visible } = {}) =>
  render(({ React, antd: { Popover } }) => (
    <Popover title={title} content={content} {...(visible ? { visible } : {})} placement="topLeft">
      <span id="toggle">Lorem ipsum…</span>
    </Popover>
  ))
const getToggle = () => cy.get('#toggle')

describe('getPopover', () => {
  it('finds visible `Popover`', () => {
    getPopover().should('not.exist')
    renderPopover({ title: 'We all live', content: '…in a yellow submarine.', visible: true })
    getPopover().should('have.text', 'We all live…in a yellow submarine.')
  })
})

describe('showPopover', () => {
  const test = () => {
    renderPopover()
    getPopover().should('not.exist')
    getToggle().then(showPopover())
    getPopover().should('exist')
  }

  it('should make the `Popover` show up', test)

  it('works on virtual clock', () => {
    cy.clock()
    test()
  })
})

describe('hidePopover', () => {
  const test = () => {
    renderPopover()
    getToggle().then(showPopover()).then(hidePopover())
    getPopover().should('not.exist')
  }

  it('should make the `Popover` disappear', test)

  it('works on virtual clock', () => {
    cy.clock()
    test()
  })
})

describe('inside `within`', () => {
  it('works just as well', () => {
    renderPopover()
    getToggle().within(() => {
      cy.root().then(showPopover())
      getPopover().should('exist')
      cy.root().then(hidePopover())
    })
  })
})
