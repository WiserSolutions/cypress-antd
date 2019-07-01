import React from 'react'
import { Card, Button } from 'antd'

import { render } from '../commands'
import { getCardTitle, getCardContent, getCardActions } from '../../src/card'

describe('getCardHeading', () => {
  it('finds `Card` heading', () => {
    render(<Card title="Fool">Dummy card content…</Card>)
    getCardTitle().should('have.text', 'Fool')
  })
})

describe('getCardContent', () => {
  it('finds `Card` content', () => {
    render(<Card title="Dummy card title">All along the watchtower…</Card>)
    getCardContent().should('have.text', 'All along the watchtower…')
  })
})

describe('getCardActions', () => {
  it('finds extra `Card` content, usually actions', () => {
    render(
      <Card title="Dummy card title" extra={<Button>Wait for the Sun</Button>}>
        Dummy card content…
      </Card>
    )
    getCardActions()
      .find('button')
      .should('have.text', 'Wait for the Sun')
  })
})
