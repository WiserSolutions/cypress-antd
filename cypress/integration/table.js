import { render } from '../commands'
import { getTable } from '../../src/table'

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

const defaultColumns = [
  { dataIndex: 'id', title: 'Track #', fixed: true },
  { dataIndex: 'name', title: 'Name' },
  { dataIndex: 'duration', title: 'Duration' }
]

const renderTable = ({ columns = defaultColumns } = {}) =>
  render(({ React, antd: { Table } }) => {
    const App = () => {
      return <Table dataSource={data} columns={columns} />
    }
    return <App />
  })

describe('getTable', () => {
  it('finds a simple table', () => {
    renderTable({ columns: defaultColumns.slice(1) })
    getTable({ scroll: false })
      .find('tbody > tr:first-child > td:first-child')
      .should('have.text', data[0].name)
  })

  it('finds the main body of a scrolling table', () => {
    renderTable()
    getTable()
      .find('tbody > tr:first-child > td:nth-child(2)')
      .should('have.text', data[0].name)
  })

  it('finds left-fixed columns table part', () => {
    renderTable()
    getTable({ fixed: 'left' })
      .find('tbody > tr:first-child > td:first-child')
      .should('have.text', String(data[0].id))
  })
})
