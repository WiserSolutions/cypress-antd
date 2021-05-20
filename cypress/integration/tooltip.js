import { render } from '../commands'
import { getTooltip, expectTooltip, shouldHaveTooltip } from '../../src/tooltip'

const renderTooltips = () =>
  render(({ React, antd: { Tooltip, Button }, icons: { UserOutlined, SettingOutlined } }) => (
    <>
      <Tooltip title="User Profile" placement="bottomLeft">
        <Button icon={<UserOutlined />} />
      </Tooltip>
      <Tooltip title="Settings" placement="bottomLeft">
        <Button icon={<SettingOutlined />} />
      </Tooltip>
    </>
  ))
const hover = (icon) => cy.get(`.anticon-${icon}`).closest('button').trigger('mouseover')

describe('getTooltip', () => {
  it('gets visible tooltip', () => {
    renderTooltips()
    hover('user')
    getTooltip().should('have.text', 'User Profile')
  })

  it('gets visible tooltip with specific text', () => {
    renderTooltips()
    hover('user')
    hover('setting')
    getTooltip('Settings').should('exist')
  })
})

describe('expectTooltip', () => {
  it('expects a visible tooltip with specific text', () => {
    renderTooltips()
    hover('user')
    expectTooltip('User Profile')
  })
})

describe('shouldHaveTooltip', () => {
  it('checks that an element has a tooltip', () => {
    renderTooltips()
    cy.get('button').eq(1).then(shouldHaveTooltip('Settings'))
  })
})

describe('inside `within`', () => {
  it('should work just as well', () => {
    renderTooltips()
    hover('user')
    cy.get('button')
      .eq(1)
      .within(() => {
        getTooltip('User Profile').should('exist')
        expectTooltip('User Profile')
        cy.root().then(shouldHaveTooltip('Settings'))
      })
  })
})
