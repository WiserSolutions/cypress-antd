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
  expectTableSortedBy
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

const renderTable = ({ columns = defaultColumns, rowSelection = { fixed: true } } = {}) =>
  render(({ React, antd: { Table } }) => {
    const App = () => {
      return (
        <Table dataSource={data} columns={columns} rowSelection={rowSelection || null} pagination={false} rowKey="id" />
      )
    }
    return <App />
  })

const getSelectedTableRows = options => getTableRows(options).filter('.ant-table-row-selected')

describe('getTable', () => {
  it('finds a simple table', () => {
    renderTable({ columns: defaultColumns.slice(1), rowSelection: false })
    getTable({ scroll: false })
      .find('tbody > tr:first-child > td:first-child')
      .should('have.text', data[0].name)
  })

  it('finds the main body of a scrolling table', () => {
    renderTable()
    getTable()
      .find('tbody > tr:first-child > td:nth-child(3)')
      .should('have.text', data[0].name)
  })

  it('finds left-fixed columns table part', () => {
    renderTable()
    getTable({ fixed: 'left' })
      .find('tbody > tr:first-child > td:nth-child(2)')
      .should('have.text', String(data[0].id))
  })
})

describe('getTableColumnHeader', () => {
  beforeEach(renderTable)

  it('finds column header by index', () => {
    getTableColumnHeader(2).should('have.text', nameLabel)
  })

  it('finds column header by label', () => {
    getTableColumnHeader(durationLabel)
      .filter(':nth-child(4)')
      .should('be.visible')
  })
})

describe('getTableColumnSorter', () => {
  beforeEach(renderTable)

  it('finds column sorter by column index', () => {
    getTableColumnSorter(1).should('not.exist')
    getTableColumnSorter(2).should('be.visible')
  })

  it('finds column sorter by column label', () => {
    getTableColumnSorter(idLabel, { fixed: 'left' }).should('not.exist')
    getTableColumnSorter(nameLabel)
      .should('be.visible')
      .click()
      .should('have.class', 'on')
  })

  it('finds column sorter for specific sort order', () => {
    getTableColumnSorter(2).click()
    getTableColumnSorter(2, { sortOrder: SORT_ORDER.DESCENDING }).should('not.have.class', 'on')
  })
})

describe('getTableFiltersDropdownToggle', () => {
  it('finds column filters drop-down toggle', () => {
    renderTable()
    getTableFiltersDropdownToggle(3).should('not.exist')
    getTableFiltersDropdownToggle(2)
      .should('be.visible')
      .and('have.class', 'anticon-filter')
  })
})

describe('getTableRows', () => {
  beforeEach(renderTable)

  it('finds table rows', () => {
    getTableRows().should('have.length', data.length)
  })

  it('finds fixed column rows', () => {
    getTableRows({ fixed: 'left' }).should('have.text', data.map(({ id }) => id).join(''))
  })
})

describe('getTableRow', () => {
  beforeEach(renderTable)

  it('finds table row by index', () => {
    const { id, name, duration } = data[3]
    getTableRow(3).should('have.text', `${id}${name}${duration}`)
  })

  it('finds fixed column(s) row by index', () => {
    getTableRow(5, { fixed: 'left' }).should('have.text', String(data[5].id))
  })
})

describe('getTableCell', () => {
  beforeEach(renderTable)

  it('finds table cell by coordinates', () => {
    getTableCell(2, 3).should('have.text', data[2].duration)
  })

  it('finds fixed column cell by coordinates', () => {
    getTableCell(4, 1, { fixed: 'left' })
      .should('be.visible')
      .and('have.text', String(data[4].id))
  })
})

describe('sortTableBy', () => {
  beforeEach(renderTable)

  it('sorts table by column', () => {
    sortTableBy(nameLabel)
    getTableCell(0, 2).should('have.text', 'Apocalypse Please')
  })

  it('sorts in descending order when used a second time', () => {
    sortTableBy(nameLabel)
    sortTableBy(nameLabel)
    getTableCell(data.length - 1, 2).should('have.text', 'Time Is Running Out')
  })
})

describe('filterTableBy', () => {
  it('filters table by column values', () => {
    const [, second, , , fifth] = data
    renderTable()
    filterTableBy(nameLabel, [second.name, fifth.name])
    getTableRows({ fixed: 'left' }).should('have.text', [second.id, fifth.id].join(''))
    getTableFiltersDropdownToggle(nameLabel).should('have.class', 'ant-table-filter-selected')
  })
})

describe('toggleRowSelection', () => {
  it('toggles row selection', () => {
    renderTable()
    toggleRowSelection(7, { fixed: true })
    getSelectedTableRows()
      .find('td:nth-child(3)')
      .should('have.text', data[7].name)
  })
})

describe('toggleBulkRowSelection', () => {
  it('toggles selection of all rows', () => {
    renderTable()
    toggleBulkRowSelection({ fixed: true })
    getSelectedTableRows().should('have.length', data.length)
    toggleRowSelection(6, { fixed: true })
    getSelectedTableRows().should('have.length', data.length - 1)
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
    sortTableBy(2)
    expectTableSortedBy(2)
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
      [, String(data[0].id), data[0].name, data[0].duration],
      [, , data[1].name],
      [],
      [, , , data[3].duration]
    ])
  })
})
