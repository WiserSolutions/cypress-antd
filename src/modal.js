import { absoluteRoot } from '@wisersolutions/cypress-without'

import { logAndMute } from './utils'

export const getModal = options => absoluteRoot().find('.ant-modal:visible', options)

export const getModalTitle = options => getModal(options).find('.ant-modal-title', options)

export const getModalBody = options => getModal(options).find('.ant-modal-body', options)

export const getModalAction = (label, options) =>
  getModal(options)
    .find('.ant-modal-footer', options)
    .contains('button', label, options)

export const expectModalTitle = (expectedTitle, options) => getModalTitle(options).should('have.text', expectedTitle)

export const expectModalText = (expectedText, options) => getModalBody(options).should('have.text', expectedText)

export function expectModalActions(labels, options) {
  const opts = logAndMute('expectModalActions', labels.join(', '), options)
  labels.forEach(label => getModalAction(label, opts).should('be.visible'))
}

export const expectModalToOpen = options => getModal(options).should('exist')

export const expectModalToClose = options => getModal(options).should('not.exist')

export const closeModal = options =>
  getModal(options)
    .find('.ant-modal-close-x', options)
    .click(options)

export function resolveModal(label, options) {
  const opts = logAndMute('resolveModal', label, options)
  getModalAction(label, opts).click(opts)
}
