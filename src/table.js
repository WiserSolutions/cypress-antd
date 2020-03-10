import isUndefined from 'lodash/isUndefined'
import isNumber from 'lodash/isNumber'
import isNil from 'lodash/isNil'
import get from 'lodash/get'

import { logAndMute } from './utils'
import { absoluteRoot } from '@wisersolutions/cypress-without'

const { $ } = Cypress

export const SORT_ORDER = {
  ASCENDING: 'asc',
  DESCENDING: 'desc'
}

/**
 * Get table or rather a table part. Ant Design table can actually consist of up to 3 tables:
 *  - base columns (possibly scrolling)
 *  - left-fixed columns
 *  - right-fixed columns
 * which are rendered so as to create an illusion that there's just one table with some fixed columns. The headers and
 * contents of fixed columns duplicate the content rendered in the base table, so accessing it requires specifically
 * targeting the "fixed columns table", otherwise the base table content gets targeted (but can't be interacted with,
 * because it's covered with the fixed columns table).
 *
 * @note All of the above applies only if the table either has scroll or at least a single fixed column (most of the
 *  useful tables have scroll, so that assumption is made here as well). Use `scroll: false` for tables where neither
 *  applies (those are truly singular).
 *
 * @param options.fixed {'right'|'left'}
 */
export function getTable({ scroll = true, fixed, ...options } = {}) {
  return scroll
    ? cy.get(fixed ? `.ant-table-fixed-${fixed === true ? 'left' : fixed}` : '.ant-table-scroll', options)
    : cy.get('.ant-table-content')
}

export function getTableRowSelectionHeader(options) {
  return getTable(options).find('.ant-table-thead > tr > th.ant-table-selection-column', options)
}

export function getTableColumnHeaders(options) {
  return getTable(options).find('.ant-table-thead > tr > th:not(.ant-table-selection-column)')
}

export function getTableColumnHeader(columnIdxOrLabel, options) {
  return isNumber(columnIdxOrLabel)
    ? getTableColumnHeaders(options).eq(columnIdxOrLabel)
    : getTable(options).contains('.ant-table-thead > tr > th', columnIdxOrLabel, options)
}

export function getTableColumnSorter(columnIdxOrLabel, { sortOrder = SORT_ORDER.ASCENDING, ...options } = {}) {
  return getTableColumnHeader(columnIdxOrLabel, options).find(
    `.ant-table-column-sorter-${sortOrder === SORT_ORDER.DESCENDING ? 'down' : 'up'}`,
    options
  )
}

export function getTableFiltersDropdownToggle(columnIdxOrLabel, options) {
  return getTableColumnHeader(columnIdxOrLabel, options).find('.anticon-filter', options)
}

export function getTableBody(options) {
  return getTable(options).find('.ant-table-body', options)
}

export function getTableRows(options) {
  return getTable(options).find('tbody > tr', options)
}

export function getTableRow(rowIdx = 0, options) {
  return getTableRows(options).eq(rowIdx, options)
}

export function getTableRowSelectionCell(rowIdx = 0, options) {
  return getTableRow(rowIdx, options).find('td.ant-table-selection-column', options)
}

export function getTableCell(rowIdx = 0, colIdx = 0, options) {
  return getTableRow(rowIdx, options)
    .find('td:not(.ant-table-selection-column)', options)
    .eq(colIdx, options)
}

export function expectTableColumnCount(count, options) {
  const opts = logAndMute('expectTableColumnCount', count, options)
  return getTableColumnHeaders(opts).should('have.length', count)
}

export function expectTableColumnHeaders(expectedColumnsHeaders, options) {
  const opts = logAndMute('expectTableColumnHeaders', expectedColumnsHeaders.join(', '), options)
  getTableColumnHeaders(opts).should(headers =>
    expectedColumnsHeaders.forEach(
      (expectedHeader, idx) =>
        !isUndefined(expectedHeader) && expect(get(headers[idx], 'textContent')).to.equal(expectedHeader)
    )
  )
}

export function expectTableRowCount(count, options) {
  const opts = logAndMute('expectTableRowCount', count, options)
  getTableRows(opts).should('have.length', count)
}

export function expectTableRows(expectedRows, options) {
  const opts = logAndMute(
    'expectTableRows',
    expectedRows.map(expectedCellValues => expectedCellValues.join(', ')).join('\n'),
    options
  )
  getTableRows(opts).should(rows =>
    expectedRows.forEach((expectedCellValues, rowIdx) =>
      expectedCellValues.forEach(
        (value, cellIdx) =>
          !isUndefined(value) &&
          expect(get($(rows[rowIdx]).children(':not(.ant-table-selection-column)')[cellIdx], 'textContent')).to.equal(
            value
          )
      )
    )
  )
}

export function expectTableSortedBy(columnIdxOrLabel, options = {}) {
  const shouldNotBeSorted = isNil(columnIdxOrLabel)
  const opts = logAndMute(
    'expectTableSortedBy',
    shouldNotBeSorted
      ? 'none (unsorted)'
      : `${columnIdxOrLabel}, ${options.sortOrder === SORT_ORDER.DESCENDING ? 'descending' : 'ascending'}`,
    options
  )
  if (shouldNotBeSorted) cy.get('.ant-table-column-sorter.on').should('not.exist')
  else getTableColumnSorter(columnIdxOrLabel, opts).should('have.class', 'on')
}

/**
 * Direct sort order selection is not supported by `Table`. Clicking on an unsorted column sorts it in ascending order.
 * Clicking on a column sorted in ascending order sorts in descending order. Clicking on descending-sorted column
 * removes the sorting. This function has to be used in a similar fashion.
 */
export function sortTableBy(columnIdxOrLabel, options) {
  const opts = logAndMute('sortTableBy', columnIdxOrLabel, options)
  getTableColumnHeader(columnIdxOrLabel, opts)
    .find('.ant-table-column-sorters', opts)
    .click(opts)
}

export function filterTableBy(columnIdxOrLabel, values, options) {
  const opts = logAndMute('filterTableBy', `${columnIdxOrLabel}: ${values.join(', ')}`, options)
  getTableFiltersDropdownToggle(columnIdxOrLabel, opts).click()
  absoluteRoot(opts)
    .find('.ant-table-filter-dropdown:visible')
    .within(() => {
      values.forEach(value => cy.contains('.ant-dropdown-menu-item', value).click())
      cy.get(`.ant-table-filter-dropdown-link${values.length ? '.confirm' : '.clear'}`).click()
      cy.root().should('not.be.visible')
    })
}

export function toggleRowSelection(rowIdx, options) {
  const opts = logAndMute('toggleRowSelection', rowIdx, options)
  getTableRowSelectionCell(rowIdx, opts)
    .find('input[type=checkbox]', opts)
    .click(opts)
}

export function toggleBulkRowSelection(options) {
  const opts = logAndMute('toggleBulkSelection', undefined, options)
  getTableRowSelectionHeader(opts)
    .find('input[type=checkbox]', opts)
    .click(opts)
}
