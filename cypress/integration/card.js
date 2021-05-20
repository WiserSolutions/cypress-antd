import { render } from '../commands'
import { getCardTitle, getCardContent, getCardActions } from '../../src/card'

const renderCard = ({ title = 'Dummy Card Title', content = 'Dummy card content…', extra = undefined }) =>
  render(({ React, antd: { Card, Button } }) => (
    <Card title={title} extra={extra && <Button>{extra}</Button>}>
      {content}
    </Card>
  ))

describe('getCardTitle', () => {
  it('finds `Card` title', () => {
    renderCard({ title: 'Fool' })
    getCardTitle().should('have.text', 'Fool')
  })
})

describe('getCardContent', () => {
  it('finds `Card` content', () => {
    renderCard({ content: 'All along the watchtower…' })
    getCardContent().should('have.text', 'All along the watchtower…')
  })
})

describe('getCardActions', () => {
  it('finds extra `Card` content, usually actions', () => {
    renderCard({ extra: 'Wait for the Sun' })
    getCardActions().find('button').should('have.text', 'Wait for the Sun')
  })
})
