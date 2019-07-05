import { render } from '../commands'
import { selectPage, selectPageSize } from '../../src/pagination'

const renderPagination = () =>
  render(({ React, antd: { Pagination } }) => {
    const App = () => {
      const [page, setPage] = React.useState(0)
      const [pageSize, setPageSize] = React.useState(10)
      return (
        <>
          <Pagination
            page={page}
            onChange={setPage}
            showSizeChanger
            pageSize={pageSize}
            onShowSizeChange={(currentPage, newPageSize) => setPageSize(newPageSize)}
            total={200}
          />
          <div id="values">
            {page + 1}, {pageSize}
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
    getValues().should('have.text', '4, 10')
  })
})

describe('selectPageSize', () => {
  it('selects page size', () => {
    renderPagination()
    selectPageSize(30)
    getValues().should('have.text', '1, 30')
  })
})
