import { render } from '../commands'
import {
  openDropdown,
  selectDropdownItem,
  closeDropdown,
  getDropdown,
  expectDropdownToOpen,
  expectDropdownToClose,
} from '../../src/dropdown'
import { getButton } from '../../src/button'

const renderDropdown = () =>
  render(({ React, antd: { Dropdown, Menu, Button }, icons: { DownOutlined } }) => {
    const App = () => {
      const [lastSelectedItem, setLastSelectedItem] = React.useState(null)
      return (
        <>
          <Dropdown
            overlay={
              <Menu onClick={({ key }) => setLastSelectedItem(key)}>
                <Menu.Item key="first">First item</Menu.Item>
                <Menu.Item key="second">Second item</Menu.Item>
              </Menu>
            }
          >
            <Button>
              Hover Me <DownOutlined />
            </Button>
          </Dropdown>
          <span id="last-selected" style={{ marginLeft: 16 }}>
            {lastSelectedItem}
          </span>
        </>
      )
    }
    return <App />
  })
const getToggle = () => getButton('Hover Me')

describe('openDropdown & closeDropdown', () => {
  it('opens/closes a drop-down menu', () => {
    renderDropdown()
    getToggle().then(openDropdown())
    cy.contains('First item').should('be.visible')
    getToggle().then(closeDropdown())
    cy.contains('First item').should('not.be.visible')
  })
})

describe('getDropdown', () => {
  it('finds open drop-down menu', () => {
    renderDropdown()
    getToggle().then(openDropdown())
    getDropdown().should('have.text', 'First itemSecond item')
  })
})

describe('selectDropdownItem', () => {
  it('selects a drop-down menu item', () => {
    renderDropdown()
    getToggle().then(openDropdown())
    selectDropdownItem('Second item')
    cy.get('#last-selected').should('have.text', 'second')
  })
})

describe('expectDropdownToOpen & expectDropdownToClose', () => {
  it('waits for a drop-down menu to open/close', () => {
    renderDropdown()
    getToggle().then(openDropdown())
    expectDropdownToOpen()
    selectDropdownItem('First item')
    expectDropdownToClose()
  })
})

describe('inside a `within`', () => {
  it('works just as well', () => {
    renderDropdown()
    getToggle().within(() => {
      cy.root().then(openDropdown())
      expectDropdownToOpen()
      selectDropdownItem('First item')
      expectDropdownToClose()
    })
  })
})
