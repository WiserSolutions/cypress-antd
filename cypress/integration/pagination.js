import { render } from '../commands'
import { selectNextPage, selectPage, selectPageSize, selectPrevPage } from '../../src/pagination'

const renderPagination = (initialPage = 1) =>
  render(({ React, antd: { Pagination } }) => {
    const App = () => {
      const [page, setPage] = React.useState(initialPage)
      const [pageSize, setPageSize] = React.useState(10)
      return (
        <>
          <Pagination
            current={page}
            onChange={setPage}
            showSizeChanger
            pageSize={pageSize}
            onShowSizeChange={(currentPage, newPageSize) => setPageSize(newPageSize)}
            total={200}
          />
          <div id="values">
            {page}, {pageSize}
          </div>
        </>
      )
    }
    return <App />
  })
const getValues = () => cy.get('#values')

describe('selectPage', () => {
  it('selects current page', () => {
    renderPagination()
    getValues().should('have.text', '1, 10')
    selectPage(3)
    getValues().should('have.text', '3, 10')
  })
})

describe('selectPrevPage', () => {
  it('selects previous page', () => {
    renderPagination(3)
    getValues().should('have.text', '3, 10')
    selectPrevPage()
    getValues().should('have.text', '2, 10')
  })
})

describe('selectNextPage', () => {
  it('selects next page', () => {
    renderPagination(2)
    getValues().should('have.text', '2, 10')
    selectNextPage()
    getValues().should('have.text', '3, 10')
  })
})

describe('selectPageSize', () => {
  it('selects page size', () => {
    renderPagination()
    selectPageSize(50)
    getValues().should('have.text', '1, 50')
  })
})
