import { expectVisibleText } from './utils'

export const getDrawer = () => cy.get('.ant-drawer:visible')
export const getDrawerTitle = () => getDrawer().find('.ant-drawer-title')

export const closeDrawer = () => cy.get('.ant-drawer-close').click()

export const expectDrawerTitle = expectVisibleText(getDrawerTitle)

export const expectDrawerToOpen = () => getDrawer().should('exist')
export const expectDrawerToClose = () => getDrawer().should('not.exist')
