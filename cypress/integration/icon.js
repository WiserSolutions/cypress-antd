import { render } from '../commands'
import { getIcon } from '../../src/icon'

describe('getIcon', () => {
  it('finds an icon by its name (what used to be `type` in Ant Design 3.x)', () => {
    render(({ React, icons: { AntDesignOutlined } }) => <AntDesignOutlined />)
    getIcon('ant-design').should('exist')
    getIcon('heart').should('not.exist')
  })
})
