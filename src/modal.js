import { absoluteRoot } from '@wisersolutions/cypress-without'

import { logAndMute } from './utils'

export const getModal = options => absoluteRoot().find('.ant-modal:visible', options)

export const getModalTitle = options => getModal(options).find('.ant-modal-title', options)

export const getModalBody = options => getModal(options).find('.ant-modal-body', options)

export const getModalAction = (label, options) =>
  getModal(options).find('.ant-modal-footer', options).contains('button', label, options)

export const getModalConfirmTitle = options => getModal(options).find('.ant-modal-confirm-title', options)

export const getModalConfirmBody = options => getModal(options).find('.ant-modal-confirm-content', options)

const getModalConfirmButtons = options => getModal(options).find('.ant-modal-confirm-btns', options)

export const getModalConfirmAction = (label, options) =>
  getModalConfirmButtons(options).contains('button', label, options)

export const getModalConfirmCancel = options => getModalConfirmButtons(options).find('.ant-btn:not(.ant-btn-primary)')

export const getModalConfirmOk = options => getModalConfirmButtons(options).find('.ant-btn-primary')

export const expectModalTitle = (expectedTitle, options) => getModalTitle(options).should('have.text', expectedTitle)

export const expectModalText = (expectedText, options) => getModalBody(options).should('have.text', expectedText)

export function expectModalActions(labels, options) {
  const opts = logAndMute('expectModalActions', labels.join(', '), options)
  labels.forEach(label => getModalAction(label, opts).should('be.visible'))
}

export const expectModalConfirmTitle = (expectedTitle, options) =>
  getModalConfirmTitle(options).should('have.text', expectedTitle)

export const expectModalConfirmText = (expectedText, options) =>
  getModalConfirmBody(options).should('have.text', expectedText)

export function expectModalConfirmActions(labels, options) {
  const opts = logAndMute('expectModalConfirmActions', labels.join(', '), options)
  labels.forEach(label => getModalConfirmAction(label, opts).should('be.visible'))
}

export const expectModalToOpen = options => getModal(options).should('exist')

export const expectModalToClose = options => {
  absoluteRoot().find('.ant-modal-mask:not(.ant-modal-mask-hidden)', options).should('not.exist')
  absoluteRoot().find('.ant-modal', options).should('not.be.visible')
}

export const closeModal = options => getModal(options).find('.ant-modal-close-x', options).click(options)

export function resolveModal(label, options) {
  const opts = logAndMute('resolveModal', label, options)
  getModalAction(label, opts).click(opts)
}

export function resolveModalConfirm(label, options) {
  const opts = logAndMute('resolveModalConfirm', label, options)
  getModalConfirmAction(label, opts).click(opts)
}

export const confirmModalConfirm = options => getModalConfirmOk(options).click(options)

export const cancelModalConfirm = options => getModalConfirmCancel(options).click(options)
