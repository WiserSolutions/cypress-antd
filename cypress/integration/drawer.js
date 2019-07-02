import { render } from '../commands'
import {
  getDrawer,
  getDrawerTitle,
  expectDrawerTitle,
  closeDrawer,
  expectDrawerToOpen,
  expectDrawerToClose
} from '../../src/drawer'

const renderDrawer = ({
  title = 'Dummy Drawer Title',
  content = 'Dummy drawer content…',
  defaultVisible = false
} = {}) =>
  render(({ React, antd: { Drawer, Button } }) => {
    const App = () => {
      const [visible, setVisible] = React.useState(defaultVisible)
      return (
        <>
          <Button id="open-drawer" onClick={() => setVisible(true)}>
            Open Drawer
          </Button>
          <Drawer visible={visible} title={title} onClose={() => setVisible(false)}>
            {content}
          </Drawer>
        </>
      )
    }
    return <App />
  })
const getToggle = () => cy.get('#open-drawer')

describe('getDrawer', () => {
  it('finds open `Drawer`', () => {
    renderDrawer({ defaultVisible: true })
    getDrawer().should('exist')
  })
})

describe('getDrawerTitle', () => {
  it('finds `Drawer` title', () => {
    renderDrawer({ defaultVisible: true, title: 'Here Lie Skeletons' })
    getDrawerTitle().should('have.text', 'Here Lie Skeletons')
  })
})

describe('expectDrawerTitle', () => {
  it('expects `Drawer` title to be visible and have specific text', () => {
    renderDrawer({ defaultVisible: true, title: 'Not for Drawing' })
    expectDrawerTitle('Not for Drawing')
  })
})

describe('closeDrawer', () => {
  it('closes the open drawer', () => {
    renderDrawer({ defaultVisible: true })
    closeDrawer()
    getDrawer().should('not.exist')
  })
})

describe('expectDrawerTo(Open|Close)', () => {
  it('waits for a drawer to (dis)appear', () => {
    renderDrawer()
    getToggle().click()
    expectDrawerToOpen()
    closeDrawer()
    expectDrawerToClose()
  })
})

describe('inside `within`', () => {
  it('works just as well', () => {
    renderDrawer()
    getToggle()
      .click()
      .within(() => {
        expectDrawerToOpen()
        closeDrawer()
        expectDrawerToClose()
      })
  })
})
