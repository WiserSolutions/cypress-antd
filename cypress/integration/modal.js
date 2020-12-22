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
  resolveModal,
  getModalConfirmTitle,
  getModalConfirmBody,
  getModalConfirmAction,
  expectModalConfirmTitle,
  expectModalConfirmText,
  expectModalConfirmActions,
  confirmModalConfirm,
  resolveModalConfirm,
  cancelModalConfirm
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

const renderModalConfirm = ({
  title = 'Dummy Modal Title',
  content = 'Dummy modal content…',
  okText = 'Ok',
  cancelText = 'Cancel',
  okResult = 'confirmed',
  cancelResult = 'canceled'
} = {}) =>
  render(({ React, antd: { Modal } }) => {
    const App = () => {
      const [result, setResult] = React.useState('')
      React.useEffect(() => {
        Modal.confirm({
          title,
          content,
          okText,
          cancelText,
          onOk: () => setResult(okResult),
          onCancel: () => setResult(cancelResult)
        })
      }, [])
      return <div id="result">{result}</div>
    }
    return <App />
  })
const getModalConfirmResult = () => cy.get('#result')

describe('general functionality', () => {
  describe('getModal', () => {
    it('finds active `Modal`', () => {
      renderModal()
      getModal().should('not.exist')
      getToggle().click()
      getModal().should('exist')
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
})

describe('`Modal` component', () => {
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
})

describe('`Modal.confirm` helper', () => {
  describe('getModalConfirmTitle', () => {
    it('finds `Modal.confirm`s title', () => {
      renderModalConfirm({ title: 'Really?' })
      getModalConfirmTitle().should('have.text', 'Really?')
    })
  })

  describe('getModalConfirmBody', () => {
    it('finds `Modal.confirm`s body', () => {
      renderModalConfirm({ content: 'It might hurt!' })
      getModalConfirmBody().should('have.text', 'It might hurt!')
    })
  })

  describe('getModalConfirmAction', () => {
    it('finds `Modal.confirm`s action by label', () => {
      renderModalConfirm()
      getModalConfirmAction('Cancel').should('exist')
      getModalConfirmAction('Non-existent').should('not.exist')
    })
  })

  describe('expectModalConfirmTitle', () => {
    it('expects `Modal.confirm` to have a specific title', () => {
      renderModalConfirm({ title: 'Are you … sure?' })
      expectModalConfirmTitle('Are you … sure?')
    })
  })

  describe('expectModalConfirmText', () => {
    it('expects `Modal.confirm` to have a specific text', () => {
      renderModalConfirm({ content: 'Caution strongly advised.' })
      expectModalConfirmText('Caution strongly advised.')
    })
  })

  describe('expectModalConfirmActions', () => {
    it('expects `Modal.confirm` to have specific actions', () => {
      renderModalConfirm({ okText: 'Yeah!', cancelText: 'Nah' })
      expectModalConfirmActions(['Nah', 'Yeah!'])
    })
  })

  describe('resolveModalConfirm', () => {
    it('confirms `Modal.confirm` by label', () => {
      renderModalConfirm({ okText: 'Do It', okResult: 'Done' })
      resolveModalConfirm('Do It')
      getModalConfirmResult().should('have.text', 'Done')
    })

    it('cancels `Modal.confirm` by label', () => {
      renderModalConfirm({ cancelText: 'Get Lost', cancelResult: 'Got Lost' })
      resolveModalConfirm('Get Lost')
      getModalConfirmResult().should('have.text', 'Got Lost')
    })
  })

  describe('confirmModalConfirm', () => {
    it('confirms `Modal.confirm`', () => {
      renderModalConfirm({ okText: 'Go Ahead!', okResult: 'Coolio.' })
      confirmModalConfirm()
      getModalConfirmResult().should('have.text', 'Coolio.')
    })
  })

  describe('cancelModalConfirm', () => {
    it('cancels `Modal.confirm`', () => {
      renderModalConfirm({ cancelText: "Don't Do It!", cancelResult: 'Ooof.' })
      cancelModalConfirm()
      getModalConfirmResult().should('have.text', 'Ooof.')
    })
  })
})
