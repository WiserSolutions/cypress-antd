import { absoluteRoot } from '@wisersolutions/cypress-without'

export const MESSAGE_TYPE = {
  INFO: 'notice',
  WARNING: 'warning',
  SUCCESS: 'success',
  ERROR: 'error',
  LOADING: 'loading'
}

export const getMessage = (type, options) =>
  absoluteRoot(options).find(`.ant-message${type ? `-${type}` : ''}:visible`, options)

export const expectMessage = (text, type, options) => getMessage(type, options).should('contain', text)
