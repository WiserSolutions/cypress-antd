import ReactDOM from 'react-dom'

export function render(content) {
  cy.window().then(({ document }) => {
    ReactDOM.render(content, document.querySelector('#root'))
  })
}
