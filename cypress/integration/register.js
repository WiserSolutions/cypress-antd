import { render } from '../commands'
import '../../src/register'

// tests just a few selected commands to verify the integrity of registration logic
describe('register (alternate entry point)', () => {
  it('registers parent commands', () => {
    render(({ React, antd: { Button, Card, Table, Tooltip } }) => (
      <Card title="Queen Singles" extra={<Button>Like Them!</Button>}>
        <Table
          dataSource={[
            { id: 1, name: "Now I'm Here", album: 'Sheer Heart Attack', duration: '4:12' },
            { id: 2, name: 'Bohemian Rhapsody', album: 'A Night at the Opera', duration: '5:55' },
            { id: 3, name: 'Bicycle Race', album: 'Jazz', duration: '3:01' },
            { id: 4, name: "Don't Stop Me Now", album: 'Jazz', duration: '3:29' }
          ]}
          columns={[
            { dataIndex: 'id', title: 'ID' },
            {
              dataIndex: 'name',
              title: 'Name',
              // eslint-disable-next-line react/display-name
              render: (name, { album }) => (
                <Tooltip title={album}>
                  <span>{name}</span>
                </Tooltip>
              )
            },
            { dataIndex: 'duration', title: 'Duration' }
          ]}
          rowKey="id"
          pagination={false}
        />
      </Card>
    ))
    cy.getCardTitle().should('have.text', 'Queen Singles')
    cy.getButton('Like Them!').should('be.visible')
    cy.getButton('Hate Them!').should('not.exist')
    cy.expectTableRows([['1', "Now I'm Here", '4:12'], [, , '5:55'], [], [, "Don't Stop Me Now"]], { scroll: false })
    cy.getTableCell(1, 1, { scroll: false })
      .find('span')
      .trigger('mouseover')
    cy.getTooltip().should('have.text', 'A Night at the Opera')
  })

  it.only('registers child commands', () => {
    render(({ React, antd: { Form, Input, Tooltip, Button, Dropdown, Menu, Radio } }) => (
      <Form>
        <Form.Item
          label={
            <Tooltip title="…is a bit more complicated" placement="topLeft">
              <span>Command Name</span>
            </Tooltip>
          }
        >
          <Input placeholder="Go on, type something…" />
        </Form.Item>
        <Form.Item label="Type">
          <Radio.Group>
            <Radio value="parent">Parent command</Radio>
            <Radio value="child">Child command</Radio>
          </Radio.Group>
        </Form.Item>
        <Dropdown
          overlay={
            <Menu>
              <Menu.Item>Foo</Menu.Item>
              <Menu.Item>Bar</Menu.Item>
            </Menu>
          }
        >
          <Button icon="plus">Add Field</Button>
        </Dropdown>
      </Form>
    ))
    cy.contains('span', 'Command Name').shouldHaveTooltip('…is a bit more complicated')
    cy.getFormInput({ label: 'Command Name' }).setInputValue('setInputValue')
    cy.getFormField({ label: 'Type' }).setRadioValue('Child command')
    cy.getButton('Add Field').openDropdown()
    cy.contains('Foo').should('be.visible')
    cy.getButton('Add Field').closeDropdown()
    cy.expectDropdownToClose()
  })
})
