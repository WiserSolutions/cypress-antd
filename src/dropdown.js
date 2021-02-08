import { absoluteRoot } from '@wisersolutions/cypress-without'

import { logAndMute, triggerAliased } from './utils'

export const getDropdown = options => absoluteRoot(options).find('.ant-dropdown:not(.ant-dropdown-hidden)', options)

export const getDropdownItem = (label, options) =>
  getDropdown(options).contains('.ant-dropdown-menu-item', label, options)

export const selectDropdownItem = (label, options) =>
  getDropdownItem(label, logAndMute('selectDropdownItem', label, options)).click()

export const openDropdown = triggerAliased('openDropdown', 'mouseover')

export const closeDropdown = triggerAliased('closeDropdown', 'mouseout')

export const expectDropdownToOpen = options => getDropdown(options).should('exist')

export const expectDropdownToClose = options => getDropdown(options).should('not.exist')
