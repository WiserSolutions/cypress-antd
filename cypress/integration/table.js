import { render } from '../commands'
import {
  SORT_ORDER,
  getTable,
  getTableColumnHeader,
  getTableColumnSorter,
  getTableFiltersDropdownToggle,
  getTableRows,
  getTableRow,
  getTableCell,
  sortTableBy,
  filterTableBy,
  toggleBulkRowSelection,
  toggleRowSelection,
  expectTableRowCount,
  expectTableRows,
  expectTableSortedBy,
  getTableColumnHeaders,
  expectTableColumnCount,
  expectTableColumnHeaders,
  getTableHeader,
  getTableScrollContainer,
  getTableBody,
  getTableLoadingIndicator
} from '../../src/table'

const data = [
  { id: 1, name: 'Intro', duration: '0:22' },
  { id: 2, name: 'Apocalypse Please', duration: '4:12' },
  { id: 3, name: 'Time Is Running Out', duration: '3:56' },
  { id: 4, name: 'Sing for Absolution', duration: '4:54' },
  { id: 5, name: 'Stockholm Syndrome', duration: '4:58' },
  { id: 6, name: 'Falling Away with You', duration: '4:40' },
  { id: 7, name: 'Interlude', duration: '0:37' },
  { id: 8, name: 'Hysteria', duration: '3:47' },
  { id: 9, name: 'Blackout', duration: '4:22' },
  { id: 10, name: 'Butterflies & Hurricanes', duration: '5:01' },
  { id: 11, name: 'The Small Print', duration: '3:28' },
  { id: 12, name: 'Endlessly', duration: '3:49' },
  { id: 13, name: 'Thoughts of a Dying Atheist', duration: '3:11' },
  { id: 14, name: 'Ruled by Secrecy', duration: '4:54' }
]

const sortAlphabetically = key => (a, b, sortOrder) => a[key].localeCompare(b[key]) * (sortOrder === 'ascend' ? 1 : -1)

const defaultColumns = [
  { dataIndex: 'id', title: 'Track #', fixed: true },
  {
    dataIndex: 'name',
    title: 'Name',
    sorter: sortAlphabetically('name'),
    filters: data.map(({ name }) => ({ text: name, value: name })),
    onFilter: (value, record) => record.name === value
  },
  { dataIndex: 'duration', title: 'Duration' }
]

const [idLabel, nameLabel, durationLabel] = defaultColumns.map(({ title }) => title)

const preset = {
  simple: { columns: defaultColumns.slice(1), rowSelection: false },
  scroll: { scroll: { y: 300 } },
  loading: { loading: true }
}

const rowText = ({ id, name, duration }) => [id, name, duration].join('')

const renderTable = ({ columns = defaultColumns, rowSelection = { fixed: true }, scroll, ...props } = {}) =>
  render(({ React, antd: { Table } }) => {
    const App = () => (
      <Table
        dataSource={data}
        columns={columns}
        rowSelection={rowSelection || null}
        pagination={false}
        scroll={scroll}
        rowKey="id"
        {...props}
      />
    )
    return <App />
  })

const getSelectedTableRows = options => getTableRows(options).filter('.ant-table-row-selected')

describe('getTable', () => {
  it('finds a simple table', () => {
    renderTable(preset.simple)
    getTable().find('tbody > tr:first-child > td:first-child').should('have.text', data[0].name)
  })

  it('finds a scrolling table', () => {
    renderTable(preset.scroll)
    // in a scroll-enabled table the first row is a hidden "measure row"
    getTable().find('tbody > tr:nth-child(2) > td:nth-child(3)').should('have.text', data[0].name)
  })
})

describe('getTableHeader', () => {
  it('finds table header in a simple table', () => {
    renderTable(preset.simple)
    getTableHeader().find('tr:first-child > th:first-child').should('have.text', preset.simple.columns[0].title)
  })

  it('finds the header of a scrolling table', () => {
    renderTable(preset.scroll)
    // first column is row selection
    getTableHeader().find('tr:first-child > th:nth-child(4)').should('have.text', defaultColumns[2].title)
  })
})

describe('getTableScrollContainer', () => {
  it('finds scroll container of a scrolling table', () => {
    renderTable(preset.scroll)
    getTableScrollContainer().scrollTo('bottom')
    getTable().find('tbody > tr:last-child').should('be.visible')
  })
})

describe('getTableBody', () => {
  it('finds body of a simple table', () => {
    renderTable(preset.simple)
    getTableBody().find('tr:first-child > td:first-child').should('have.text', data[0].name)
  })

  it('finds body of a scrolling table', () => {
    renderTable(preset.scroll)
    // in a scroll-enabled table the first row is a hidden "measure row"
    getTableBody().find('tr:nth-child(2) > td:nth-child(3)').should('have.text', data[0].name)
  })
})

describe('getTableColumnHeaders', () => {
  it('finds all column headers', () => {
    renderTable()
    getTableColumnHeaders().then(headers =>
      defaultColumns.forEach(({ title }, idx) => cy.wrap(headers).eq(idx).should('have.text', title))
    )
  })
})

describe('getTableColumnHeader', () => {
  beforeEach(renderTable)

  it('finds column header by index', () => {
    getTableColumnHeader(1).should('have.text', nameLabel)
  })

  it('finds column header by label', () => {
    getTableColumnHeader(durationLabel).filter(':nth-child(4)').should('be.visible')
  })
})

describe('getTableColumnSorter', () => {
  beforeEach(renderTable)

  it('finds column sorter by column index', () => {
    getTableColumnSorter(0).should('not.exist')
    getTableColumnSorter(1).should('be.visible')
  })

  it('finds column sorter by column label', () => {
    getTableColumnSorter(idLabel).should('not.exist')
    getTableColumnSorter(nameLabel).should('be.visible').click({ force: true }).should('have.class', 'active')
  })

  it('finds column sorter for specific sort order', () => {
    getTableColumnSorter(1).click({ force: true })
    getTableColumnSorter(1, { sortOrder: SORT_ORDER.DESCENDING }).should('not.have.class', 'active')
  })
})

describe('getTableFiltersDropdownToggle', () => {
  it('finds column filters drop-down toggle', () => {
    renderTable()
    getTableFiltersDropdownToggle(2).should('not.exist')
    getTableFiltersDropdownToggle(1).should('be.visible')
  })
})

describe('getTableRows', () => {
  it('finds table rows in a simple table', () => {
    renderTable(preset.simple)
    getTableRows().should('have.length', data.length)
    getTableRows().eq(1).find('td').eq(0).should('have.text', data[1].name)
  })

  it('finds table rows in a scrolling table', () => {
    renderTable(preset.scroll)
    getTableRows().should('have.length', data.length)
    getTableRows().eq(1).find('td').eq(1).should('have.text', data[1].id)
    getTableRows().eq(1).find('td').eq(2).should('have.text', data[1].name)
  })
})

describe('getTableRow', () => {
  it('finds table row by index', () => {
    renderTable()
    getTableRow(3).should('have.text', rowText(data[3]))
  })

  it('finds table row by index in a scrolling table', () => {
    renderTable(preset.scroll)
    getTableRow(5).should('have.text', rowText(data[5]))
  })
})

describe('getTableCell', () => {
  beforeEach(renderTable)

  it('finds table cell by coordinates', () => {
    getTableCell(2, 2).should('have.text', data[2].duration)
  })

  it('finds fixed column cell by coordinates', () => {
    getTableCell(4, 0, { fixed: 'left' }).should('be.visible').and('have.text', String(data[4].id))
  })
})

describe('getTableLoadingIndicator', () => {
  it('finds loading indicator', () => {
    renderTable({ loading: true })
    getTableLoadingIndicator().should('be.visible')
  })

  it("doesn't find anything if table is not loading", () => {
    renderTable()
    getTableLoadingIndicator().should('not.exist')
  })
})

describe('sortTableBy', () => {
  beforeEach(renderTable)

  it('sorts table by column', () => {
    sortTableBy(nameLabel)
    getTableCell(0, 1).should('have.text', 'Apocalypse Please')
  })

  it('sorts in descending order when used a second time', () => {
    sortTableBy(nameLabel)
    sortTableBy(nameLabel)
    getTableCell(data.length - 1, 1).should('have.text', 'Time Is Running Out')
  })
})

describe('filterTableBy', () => {
  it('filters table by column values', () => {
    const [, second, , , fifth] = data
    renderTable()

    // filter table
    filterTableBy(nameLabel, [second.name, fifth.name])
    getTableRows().should('have.text', [rowText(second), rowText(fifth)].join(''))
    getTableFiltersDropdownToggle(nameLabel).should('have.class', 'active')

    // reset filters
    filterTableBy(nameLabel, [])
    getTableRows().should('have.length', data.length)
    getTableFiltersDropdownToggle(nameLabel).should('not.have.class', 'active')
  })
})

describe('toggleRowSelection', () => {
  it('toggles row selection', () => {
    renderTable()
    toggleRowSelection(7)
    getSelectedTableRows().find('td:nth-child(3)').should('have.text', data[7].name)
  })
})

describe('toggleBulkRowSelection', () => {
  it('toggles selection of all rows', () => {
    renderTable()
    toggleBulkRowSelection()
    getSelectedTableRows().should('have.length', data.length)
    toggleRowSelection(6)
    getSelectedTableRows().should('have.length', data.length - 1)
  })
})

describe('expectTableColumnCount', () => {
  it('expects the table to have a specific number of columns', () => {
    renderTable()
    expectTableColumnCount(defaultColumns.length)
  })
})

describe('expectTableColumnHeaders', () => {
  beforeEach(renderTable)

  it('expect the table to have specific column labels', () => {
    expectTableColumnHeaders(defaultColumns.map(({ title }) => title))
  })

  it('checks only the provided headers', () => {
    expectTableColumnHeaders([, defaultColumns[1].title])
  })
})

describe('expectTableRowCount', () => {
  it('expects the table to have specific number of rows', () => {
    renderTable()
    expectTableRowCount(data.length)
  })
})

describe('expectTableSortedBy', () => {
  beforeEach(renderTable)

  it('expects the table not to be sorted', () => {
    expectTableSortedBy(null)
  })

  it('expects the table to be sorted by a specific column', () => {
    sortTableBy(1)
    expectTableSortedBy(1)
  })

  it('expects descending sort order', () => {
    sortTableBy(nameLabel)
    sortTableBy(nameLabel)
    expectTableSortedBy(nameLabel, { sortOrder: SORT_ORDER.DESCENDING })
  })
})

describe('expectTableRows', () => {
  it('expects specific table content', () => {
    renderTable()
    expectTableRows([
      [String(data[0].id), data[0].name, data[0].duration],
      [, data[1].name],
      [],
      [, , data[3].duration]
    ])
  })
})
