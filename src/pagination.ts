import { logAndMute } from './utils'
import { chooseSelectDropdownOption } from './form'

export function selectPageSize(size: string | number, options?: Partial<Cypress.Loggable>) {
  const opts = logAndMute('selectPageSize', size.toString(), options)
  cy.get('.ant-pagination-options-size-changer', opts).click(opts)
  chooseSelectDropdownOption(`${size} / page`, opts)
}

export function selectPage(page: string | number, options?: Partial<Cypress.Loggable>) {
  const opts = logAndMute('selectPage', page.toString(), options)
  cy.contains('.ant-pagination-item', page, opts).click(opts)
}

export function selectPrevPage(options?: Partial<Cypress.Loggable>) {
  const opts = logAndMute('selectPrevPage', '', options)
  cy.get('.ant-pagination-prev', opts).click(opts)
}

export function selectNextPage(options?: Partial<Cypress.Loggable>) {
  const opts = logAndMute('selectNextPage', '', options)
  cy.get('.ant-pagination-next', opts).click(opts)
}
