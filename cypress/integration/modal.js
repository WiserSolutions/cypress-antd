import { render } from '../commands'
import {
  getModal,
  getModalTitle,
  getModalBody,
  getModalAction,
  expectModalToOpen,
  expectModalToClose,
  expectModalTitle,
  expectModalText,
  expectModalActions,
  closeModal,
  resolveModal
} from '../../src/modal'

const renderModal = ({
  title = 'Dummy Modal Title',
  content = 'Dummy modal content…',
  defaultVisible = false,
  actions
} = {}) =>
  render(({ React, antd: { Modal, Button } }) => {
    const App = () => {
      const [visible, setVisible] = React.useState(defaultVisible)
      const [toggleText, setToggleText] = React.useState('Open Modal')
      return (
        <>
          <Button id="toggle" onClick={() => setVisible(true)}>
            {toggleText}
          </Button>
          <Modal
            visible={visible}
            onCancel={() => setVisible(false)}
            onOk={() => {
              setToggleText('Open Modal Again')
              setVisible(false)
            }}
            title={title}
            footer={actions && actions.map(action => <Button key={action}>{action}</Button>)}
          >
            {content}
          </Modal>
        </>
      )
    }
    return <App />
  })
const getToggle = () => cy.get('#toggle')

describe('getModal', () => {
  it('finds active `Modal`', () => {
    renderModal()
    getModal().should('not.exist')
    getToggle().click()
    getModal().should('exist')
  })
})

describe('getModalTitle', () => {
  it('finds active `Modal`s title', () => {
    renderModal({ defaultVisible: true, title: 'Breaking News' })
    getModalTitle().should('have.text', 'Breaking News')
  })
})

describe('getModalBody', () => {
  it('finds active `Modal`s body', () => {
    renderModal({ defaultVisible: true, content: "… is dictators' favorite pastime." })
    getModalBody().should('have.text', "… is dictators' favorite pastime.")
  })
})

describe('getModalAction', () => {
  it('finds modal action by label', () => {
    renderModal({ defaultVisible: true })
    getModalAction('Cancel').should('exist')
    getModalAction('Non-existent').should('not.exist')
  })
})

describe('expectModalToOpen & expectModalToClose', () => {
  it('expects a `Modal` to appear/disappear', () => {
    renderModal()
    getToggle().click()
    expectModalToOpen()
    getModalAction('Cancel').click()
    expectModalToClose()
  })
})

describe('expectModalText', () => {
  it('expects a `Modal` to have specific content', () => {
    renderModal({ defaultVisible: true, content: 'Here we are, born to be kings…' })
    expectModalText('Here we are, born to be kings…')
  })
})

describe('expectModalActions', () => {
  it('expects `Modal` to have specific actions', () => {
    renderModal({ defaultVisible: true, actions: ['Might', 'Magic'] })
    expectModalActions(['Might', 'Magic'])
  })
})

describe('closeModal', () => {
  it('closes a `Modal` using the close icon in the corner', () => {
    renderModal({ defaultVisible: true })
    closeModal()
    expectModalToClose()
  })
})

describe('resolveModal', () => {
  it('resolves `Modal` with a specific action', () => {
    renderModal({ defaultVisible: true })
    resolveModal('OK')
    expectModalToClose()
    getToggle().should('have.text', 'Open Modal Again')
  })
})

describe('inside `within`', () => {
  it('works just as well', () => {
    renderModal({ title: 'Strength Comes', content: '… from within.' })
    getToggle().within(() => {
      cy.root().click()
      expectModalToOpen()
      expectModalTitle('Strength Comes')
      expectModalText('… from within.')
      expectModalActions(['Cancel', 'OK'])
      closeModal()
      expectModalToClose()
    })
  })
})
