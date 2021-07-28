import forEach from 'lodash/forEach'
import isEmpty from 'lodash/isEmpty'
import isUndefined from 'lodash/isUndefined'
import merge from 'lodash/merge'
import isArray from 'lodash/isArray'
import mapValues from 'lodash/mapValues'
import map from 'lodash/map'
import isNumber from 'lodash/isNumber'
import isObject from 'lodash/isObject'

import { ifOnClock, logAndMute, MUTE, tickIfOnClock } from './utils'
import { absoluteRoot } from '@hon2a/cypress-without'

export const FIELD_TYPE = {
  INPUT: 'input',
  NUMBER_INPUT: 'number',
  SELECT: 'select',
  MULTISELECT: 'multiselect',
  TAGS: 'tags',
  RADIO: 'radio'
}
const { INPUT, NUMBER_INPUT, SELECT, MULTISELECT, TAGS, RADIO } = FIELD_TYPE

const { $ } = Cypress

const on = $el => cy.wrap($el, MUTE)

const unsupportedFieldType = type => new Error(`Field type "${type}" is not supported!`)

// region:Selection

const getSelectValuePart = (scope, options) => scope.find('.ant-select-selector', options)
const getSelectSearchPart = (scope, options) => scope.find('.ant-select-selection-search-input', options)

export function getFormField({ label, ...options } = {}) {
  const opts = logAndMute('getFormField', label, options)
  return cy
    .get('.ant-form-item', opts)
    .then(field =>
      isUndefined(label) ? field : field.filter((idx, el) => $(el).children('.ant-form-item-label').text() === label)
    )
}

export function getFormInput({ label, type = FIELD_TYPE.INPUT, ...options } = {}) {
  const opts = logAndMute('getFormInput', [label, type].filter(Boolean).join(', '), options)
  const scope = label ? getFormField({ label, ...opts }) : cy.root()
  switch (type) {
    case INPUT:
      return scope.find('.ant-input', opts)
    case NUMBER_INPUT:
      return scope.find('.ant-input-number-input', opts)
    case SELECT:
    case MULTISELECT:
    case TAGS:
      return getSelectValuePart(scope, opts)
    case RADIO:
      return scope.find('.ant-radio-group', opts)
    default:
      throw unsupportedFieldType(type)
  }
}

// endregion
// region:Assertions

export const expectSelectValue = (expectedValue, options) => $el => {
  const opts = logAndMute('expectSelectValue', expectedValue, options)
  on($el)
    .find('.ant-select-selection-item', opts)
    .should(...(expectedValue ? ['have.text', expectedValue] : ['not.exist']))
}

export const expectMultiSelectValue = (expectedValues, options) => $el => {
  expectedValues.forEach(val =>
    on($el).contains('.ant-select-selection-item-content', val, options).should('be.visible')
  )
}

export const expectSelectPlaceholder = (expectedPlaceholder, options) => $el => {
  const opts = logAndMute('expectSelectPlaceholder', expectedPlaceholder, options)
  on($el)
    .find('.ant-select-selection-placeholder', opts)
    .should(...(expectedPlaceholder ? ['have.text', expectedPlaceholder] : ['not.exist']))
}

export function expectFormFieldValue({
  label,
  type = FIELD_TYPE.INPUT,
  value,
  placeholder,
  scrollIntoView = true,
  ...options
}) {
  const shouldExpectValue = Boolean((!isObject(value) || !isEmpty(value)) && (isNumber(value) || value))
  const shouldExpectPlaceholder = Boolean(!shouldExpectValue && placeholder)
  const opts = logAndMute(
    'expectFieldValue',
    `${label}: ${shouldExpectValue ? value : '<empty>'}${placeholder ? ` (${placeholder})` : ''}`,
    options
  )
  const getInput = () => getFormInput({ label, type, ...opts })

  if (scrollIntoView) getInput().scrollIntoView(opts)

  switch (type) {
    case INPUT:
    case NUMBER_INPUT:
      getInput().should('have.value', isUndefined(value) ? '' : String(value))
      return
    case SELECT:
      getInput().then(expectSelectValue(value, opts))
      if (shouldExpectPlaceholder) getInput().then(expectSelectPlaceholder(placeholder, opts))
      return
    case MULTISELECT:
    case TAGS:
      if (shouldExpectPlaceholder) getInput().then(expectSelectPlaceholder(placeholder, opts))
      if (shouldExpectValue) getInput().then(expectMultiSelectValue(value, opts))
      return
    case RADIO:
      getInput().contains('.ant-radio-wrapper', value, opts).should('have.class', 'ant-radio-wrapper-checked')
      return
    default:
      throw unsupportedFieldType(type)
  }
}

export function expectFormFieldError({ error: expectedHint, label, ...options }) {
  const opts = logAndMute('expectFieldError', `${label}: ${expectedHint}`, options)
  getFormInput({ label, ...opts })
    .parents('.ant-form-item-control', opts)
    .find('.ant-form-item-explain', opts)
    .should('have.text', expectedHint)
}

const mergeFields = (fields, additionalProps) => {
  const [empty, mapPropValues] = isArray(fields) ? [[], map] : [{}, mapValues]
  return merge(
    empty,
    fields,
    ...Object.entries(additionalProps)
      .filter(([, values]) => values)
      .map(([key, values]) => mapPropValues(values, value => ({ [key]: value })))
  )
}

export function expectFormFields(fields, { values, errors, ...options } = {}) {
  const mergedFields = mergeFields(fields, { value: values, error: errors })
  forEach(mergedFields, ({ value, placeholder, error, ...fieldSelector }) => {
    if (!isUndefined(value) || !isUndefined(placeholder))
      expectFormFieldValue({ ...options, value, placeholder, ...fieldSelector })
    if (error) expectFormFieldError({ ...options, error, ...fieldSelector })
  })
}

// endregion
// region:Interaction

const dropdownSelector =
  '.ant-select-dropdown:not(.ant-select-dropdown-hidden):not(.ant-slide-up-leave):not(.ant-slide-down-leave):not(.ant-slice-up-appear):not(.ant-slide-down-appear)'

export const getSelectDropdown = options => absoluteRoot(options).find(dropdownSelector, options)

const scrollToToVerticalPosition = scrollTo => {
  if (scrollTo === 'top') return 0
  if (scrollTo === 'bottom') return Number.MAX_SAFE_INTEGER
  if (isNumber(scrollTo)) return scrollTo
  throw new Error('Vertical `scrollTo` must be either `top`, `bottom`, or a number!')
}
export const scrollSelectDropdown = (scrollTo, options) => {
  // h4ck: some processing needs to finish before it's possible to interact with the list, it's unclear what
  cy.wait(100) // eslint-disable-line cypress/no-unnecessary-waiting
  getSelectDropdown(options)
    .find('.rc-virtual-list-holder', options)
    .then($el => $el[0].scrollTo({ top: scrollToToVerticalPosition(scrollTo) }))
}

const unlockSelectDropdownOptions = options =>
  getSelectDropdown(options).then($el => $el.css({ 'pointer-events': 'all' }))

export function chooseSelectDropdownOption(value, options) {
  const opts = logAndMute('chooseSelectOption', value, options)
  ifOnClock(() => unlockSelectDropdownOptions(opts))
  absoluteRoot(opts).contains(`${dropdownSelector} .ant-select-item-option`, value, opts).click(opts)
}

export function expectSelectDropdownToClose(options) {
  getSelectDropdown(options).should('not.exist')
}

export const setInputValue =
  (value, { append, ...options } = {}) =>
  $el => {
    if (value) on($el).type(append ? value : `{selectall}${value}`, options)
    else on($el).clear(options)
  }

export const setSelectValue =
  (value, { scrollTo, ...options } = {}) =>
  $el => {
    if (value) {
      getSelectValuePart(on($el), options).click(options)
      tickIfOnClock(options)
      tickIfOnClock(options)
      if (scrollTo) {
        scrollSelectDropdown(scrollTo, options)
        tickIfOnClock(options)
      }
      chooseSelectDropdownOption(value, options)
      tickIfOnClock(options)
      expectSelectDropdownToClose(options)
    } else {
      on($el).find('.ant-select-clear', options).click(options)
    }
    return on($el)
  }

export const clearMultiselect = options => $el =>
  getSelectValuePart(on($el), options).then($field => {
    const removalButtons = $field.find('.ant-select-selection-item-remove')
    if (removalButtons.length) {
      cy.wrap(removalButtons, options).click({ ...options, multiple: true })
    }
  })

export const closeMultiselectOptions = options => $el => getSelectSearchPart(on($el), options).type('{esc}')

export const setMultiselectValue =
  (values = [], { append, scrollTo: scrollTos, ...options } = {}) =>
  $el => {
    if (!append) clearMultiselect(options)($el)

    getSelectValuePart(on($el), options).click(options)
    tickIfOnClock(options)
    tickIfOnClock(options)
    values.forEach((value, idx) => {
      if (scrollTos) {
        const scrollTo = isArray(scrollTos) ? scrollTos[idx] : scrollTos
        if (scrollTo) {
          scrollSelectDropdown(scrollTo, options)
          tickIfOnClock(options)
        }
      }
      chooseSelectDropdownOption(value, options)
    })
    closeMultiselectOptions(options)($el)

    tickIfOnClock(options)
    expectSelectDropdownToClose(options)
  }

export const setTagsValue =
  (values = [], { append, ...options } = {}) =>
  $el => {
    if (!append) clearMultiselect(options)($el)

    getSelectValuePart(on($el), options).click(options)
    values.forEach(value => getSelectSearchPart(on($el), options).type(`${value}{enter}`))
    closeMultiselectOptions(options)($el)

    tickIfOnClock(options)
    expectSelectDropdownToClose(options)
  }

export const setRadioValue = (value, options) => $el =>
  on($el).contains('.ant-radio-wrapper', value, options).click(options)

export function setFormFieldValue({ label, type = FIELD_TYPE.INPUT, value, ...options }) {
  const opts = logAndMute('setFieldValue', `${label}: ${value}`, options)
  const getField = () => getFormField({ label, ...opts })
  const getInput = () => getFormInput({ label, type, ...opts })

  getField().scrollIntoView(opts)

  switch (type) {
    case INPUT:
    case NUMBER_INPUT:
      getInput().then(setInputValue(isNumber(value) ? String(value) : value, opts))
      return
    case SELECT:
      getField().then(setSelectValue(value, opts))
      return
    case MULTISELECT:
      getField().then(setMultiselectValue(value, opts))
      return
    case TAGS:
      getField().then(setTagsValue(value, opts))
      return
    case RADIO:
      getInput().then(setRadioValue(value, opts))
      return
    default:
      throw unsupportedFieldType(type)
  }
}

export const setFormFieldValues = (fields, { values, ...options } = {}) => {
  const mergedFields = mergeFields(fields, { value: values })
  forEach(mergedFields, field => {
    if (!isUndefined(field.value)) setFormFieldValue({ ...options, ...field })
  })
}

// endregion
