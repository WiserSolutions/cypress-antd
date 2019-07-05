import { render } from '../commands'
import { getPopconfirm, expectPopconfirm, confirmPopconfirm, cancelPopconfirm } from '../../src/popconfirm'

const renderPopconfirm = ({ content = 'Dummy popover content…' } = {}) =>
  render(({ React, antd: { Popconfirm, Button } }) => {
    const App = () => {
      const [result, setResult] = React.useState(null)
      return (
        <>
          <Popconfirm
            title={content}
            placement="topLeft"
            onConfirm={() => setResult('Confirmed')}
            onCancel={() => setResult('Canceled')}
          >
            <Button id="toggle">Click Me</Button>
          </Popconfirm>
          <div id="result">{result}</div>
        </>
      )
    }
    return <App />
  })
const getToggle = () => cy.get('#toggle')
const getResult = () => cy.get('#result')

describe('getPopconfirm', () => {
  it('finds visible `Popconfirm`', () => {
    renderPopconfirm({ content: "The kids aren't all-right." })
    getPopconfirm().should('not.exist')
    getToggle().click()
    getPopconfirm().should('have.text', "The kids aren't all-right.CancelOK")
  })
})

describe('expectPopconfirm', () => {
  it('expects visible `Popconfirm` with specific text', () => {
    renderPopconfirm({ content: 'Dancing in the desert, blowing up the sunshine' })
    getToggle().click()
    expectPopconfirm('Dancing in the desert, blowing up the sunshine')
  })
})

describe('confirmPopconfirm', () => {
  it('resolves `Popconfirm` with confirmation', () => {
    renderPopconfirm()
    getToggle().click()
    confirmPopconfirm()
    getResult().should('have.text', 'Confirmed')
  })
})

describe('cancelPopconfirm', () => {
  it('resolves `Popconfirm` with rejection', () => {
    renderPopconfirm()
    getToggle().click()
    cancelPopconfirm()
    getResult().should('have.text', 'Canceled')
  })
})

describe('inside `within`', () => {
  it('works just as well', () => {
    renderPopconfirm({ content: 'Birdhouse in your soul?' })
    getToggle().within(() => {
      cy.root().click()
      getPopconfirm().should('exist')
      expectPopconfirm('Birdhouse in your soul?')
      confirmPopconfirm()
    })
    getResult().should('have.text', 'Confirmed')
  })
})
