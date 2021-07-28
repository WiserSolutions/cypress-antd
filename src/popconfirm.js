import { logAndMute } from './utils'
import { absoluteRoot } from '@hon2a/cypress-without'

export const getPopconfirm = options => absoluteRoot().find('.ant-popover:visible', options)

export const expectPopconfirm = (text, options) => {
  const opts = logAndMute('expectPopconfirm', '', options)
  getPopconfirm(opts).find('.ant-popover-message-title', opts).should('contain', text)
}

const resolvePopconfirm = (buttonIdx, options) =>
  getPopconfirm(options).find('.ant-popover-buttons button', options).eq(buttonIdx, options).click(options)

export const confirmPopconfirm = options => resolvePopconfirm(1, logAndMute('confirmPopconfirm', '', options))
export const cancelPopconfirm = options => resolvePopconfirm(0, logAndMute('cancelPopconfirm', '', options))
