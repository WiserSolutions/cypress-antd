export function render(getContent) {
  cy.window().then(({ document, React, ReactDOM, antd }) => {
    const container = document.querySelector('#root')
    ReactDOM.render(getContent({ container, React, antd }), container)
  })
}
