import { logAndMute, MUTE } from './utils'

export const getDropdown = options => cy.get('.ant-dropdown:visible', options)

export const getDropdownItem = (label, options) =>
  getDropdown(options).contains('.ant-dropdown-menu-item', label, options)

export const selectDropdownItem = (label, options) =>
  getDropdownItem(label, logAndMute('selectDropdownItem', label, options)).click()

export const openDropdown = options => $el => {
  const opts = logAndMute('openDropdown', '', options)
  cy.wrap($el, MUTE).trigger('mouseover', opts)
}

export const closeDropdown = options => $el => {
  const opts = logAndMute('closeDropdown', '', options)
  cy.wrap($el, MUTE).trigger('mouseout', opts)
}

export const expectDropdownToOpen = options => getDropdown(options).should('exist')

export const expectDropdownToClose = options => getDropdown(options).should('not.exist')
