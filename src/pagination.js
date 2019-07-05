import { logAndMute } from './utils'
import { chooseSelectDropdownOption } from './form'

export function selectPageSize(size, options) {
  const opts = logAndMute('selectPageSize', size, options)
  cy.get('.ant-pagination-options-size-changer', opts).click(opts)
  chooseSelectDropdownOption(`${size} / page`, opts)
}

export function selectPage(page, options) {
  const opts = logAndMute('selectPage', page, options)
  cy.contains('.ant-pagination-item', page, opts).click(opts)
}
