import { absoluteRoot } from '@wisersolutions/cypress-without'

export const getDrawer = options => absoluteRoot(options).find('.ant-drawer:visible', options)
export const getDrawerTitle = options => getDrawer(options).find('.ant-drawer-title', options)

export const closeDrawer = options =>
  getDrawer(options)
    .find('.ant-drawer-close', options)
    .click(options)

export const expectDrawerTitle = expectedText => getDrawerTitle().should('have.text', expectedText)

export const expectDrawerToOpen = () => getDrawer().should('exist')
export const expectDrawerToClose = () =>
  absoluteRoot()
    .find('.ant-drawer')
    .should('not.be.visible')
