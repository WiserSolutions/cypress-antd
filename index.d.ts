/// <reference path="node_modules/cypress/types/index.d.ts" />

declare module '@hon2a/cypress-antd' {
  export function getButton(label: string, options?: Parameters<Cypress.Chainable['contains']>[2]): Cypress.Chainable
}
