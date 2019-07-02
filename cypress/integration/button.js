import { render } from '../commands'
import { getButton } from '../../src/button'

describe('getButton', () => {
  it('finds a `Button` by label', () => {
    render(({ React, antd: { Button } }) => <Button>Click Me</Button>)
    getButton('Click Me').should('exist')
    getButton('Non-existent').should('not.exist')
  })
})
