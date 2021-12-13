import forEach from 'lodash/forEach'
import isEmpty from 'lodash/isEmpty'
import isUndefined from 'lodash/isUndefined'
import merge from 'lodash/merge'
import isArray from 'lodash/isArray'
import mapValues from 'lodash/mapValues'
import map from 'lodash/map'
import isNumber from 'lodash/isNumber'
import isObject from 'lodash/isObject'

import { ifOnClock, logAndMute, MUTE, tickIfOnClock, TickOptions } from './utils'
import { absoluteRoot } from '@hon2a/cypress-without'
import { CommonOptions, Label } from './types'

type FieldType = 'input' | 'number' | 'select' | 'multiselect' | 'tags' | 'radio'
export const FIELD_TYPE = {
  INPUT: 'input' as FieldType,
  NUMBER_INPUT: 'number' as FieldType,
  SELECT: 'select' as FieldType,
  MULTISELECT: 'multiselect' as FieldType,
  TAGS: 'tags' as FieldType,
  RADIO: 'radio' as FieldType
}
const { INPUT, NUMBER_INPUT, SELECT, MULTISELECT, TAGS, RADIO } = FIELD_TYPE

const { $ } = Cypress

const on = ($el: JQuery) => cy.wrap($el, MUTE)

const unsupportedFieldType = (type: string) => new Error(`Field type "${type}" is not supported!`)

// region:Selection

const getSelectValuePart = <Subject>(scope: Cypress.Chainable<Subject>, options?: CommonOptions) =>
  scope.find('.ant-select-selector', options)
const getSelectSearchPart = <Subject>(scope: Cypress.Chainable<Subject>, options?: CommonOptions) =>
  scope.find('.ant-select-selection-search-input', options)

type FormFieldOptions = { label?: string }
export function getFormField({ label, ...options }: FormFieldOptions & CommonOptions = {}) {
  const opts = logAndMute('getFormField', label, options)
  return cy
    .get('.ant-form-item', opts)
    .then(field =>
      isUndefined(label) ? field : field.filter((idx, el) => $(el).children('.ant-form-item-label').text() === label)
    )
}

type FormInputOptions = FormFieldOptions & { type?: FieldType }
export function getFormInput({ label, type = FIELD_TYPE.INPUT, ...options }: FormInputOptions & CommonOptions = {}) {
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

export const expectSelectValue = (expectedValue?: string, options?: CommonOptions) => ($el: JQuery) => {
  const opts = logAndMute('expectSelectValue', expectedValue, options)
  const found = on($el).find('.ant-select-selection-item', opts)
  if (expectedValue) found.should('have.text', expectedValue)
  else found.should('not.exist')
}

export const expectMultiSelectValue = (expectedValues: string[], options?: CommonOptions) => ($el: JQuery) => {
  expectedValues.forEach(val =>
    on($el).contains('.ant-select-selection-item-content', val, options).should('be.visible')
  )
}

export const expectSelectPlaceholder = (expectedPlaceholder?: string, options?: CommonOptions) => ($el: JQuery) => {
  const opts = logAndMute('expectSelectPlaceholder', expectedPlaceholder, options)
  const found = on($el).find('.ant-select-selection-placeholder', opts)
  if (expectedPlaceholder) found.should('have.text', expectedPlaceholder)
  else found.should('not.exist')
}

type FormFieldValueOptions = FormInputOptions & {
  value?: string | number | string[]
  placeholder?: string
  scrollIntoView?: boolean
}
export function expectFormFieldValue({
  label,
  type = FIELD_TYPE.INPUT,
  value,
  placeholder,
  scrollIntoView = true,
  ...options
}: FormFieldValueOptions & CommonOptions) {
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
      getInput().then(expectSelectValue(isUndefined(value) ? '' : String(value), opts))
      if (shouldExpectPlaceholder) getInput().then(expectSelectPlaceholder(placeholder, opts))
      return
    case MULTISELECT:
    case TAGS:
      if (shouldExpectPlaceholder) getInput().then(expectSelectPlaceholder(placeholder, opts))
      if (shouldExpectValue)
        getInput().then(expectMultiSelectValue((isArray(value) ? value : [value]).map(String), opts))
      return
    case RADIO:
      getInput().contains('.ant-radio-wrapper', String(value), opts).should('have.class', 'ant-radio-wrapper-checked')
      return
    default:
      throw unsupportedFieldType(type)
  }
}

export function expectFormFieldError({
  error: expectedHint,
  label,
  ...options
}: { error: string } & FormFieldOptions & CommonOptions) {
  const opts = logAndMute('expectFieldError', `${label}: ${expectedHint}`, options)
  getFormInput({ label, ...opts })
    .parents('.ant-form-item-control', opts)
    .find('.ant-form-item-explain', opts)
    .should('have.text', expectedHint)
}

// h4ck: shit-typed because it's internal and I don't have the time to properly type it
function mergeFields(fields: any, additionalProps: any) {
  const [empty, mapPropValues]: [object, (collection: any, mapper: (value: any) => any) => any] = isArray(fields)
    ? [[], map]
    : [{}, mapValues]
  return merge(
    empty,
    fields,
    ...Object.entries(additionalProps)
      .filter(([, values]) => values)
      .map(([key, values]) => mapPropValues(values, value => ({ [key]: value })))
  )
}

type FormFieldValueOrErrorOptions = Partial<{ error?: string } & FormFieldValueOptions>

export function expectFormFields(
  fields: FormFieldValueOrErrorOptions[] | Record<string, FormFieldValueOrErrorOptions>,
  {
    values,
    errors,
    ...options
  }: (
    | { values?: (string | number | string[])[]; errors?: string[] }
    | { values?: Record<string, string | number | string[]>; errors?: Record<string, string> }
  ) &
    CommonOptions = {}
) {
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

export const getSelectDropdown = (options?: CommonOptions) => absoluteRoot(options).find(dropdownSelector, options)

type ScrollPosition = 'top' | 'bottom' | number
const scrollToToVerticalPosition = (scrollTo: ScrollPosition) => {
  if (scrollTo === 'top') return 0
  if (scrollTo === 'bottom') return Number.MAX_SAFE_INTEGER
  if (isNumber(scrollTo)) return scrollTo
  throw new Error('Vertical `scrollTo` must be either `top`, `bottom`, or a number!')
}
export const scrollSelectDropdown = (scrollTo: ScrollPosition, options?: CommonOptions) => {
  // h4ck: some processing needs to finish before it's possible to interact with the list, it's unclear what
  cy.wait(100) // eslint-disable-line cypress/no-unnecessary-waiting
  getSelectDropdown(options)
    .find('.rc-virtual-list-holder', options)
    .then($el => $el[0].scrollTo({ top: scrollToToVerticalPosition(scrollTo) }))
}

const unlockSelectDropdownOptions = (options?: CommonOptions) =>
  getSelectDropdown(options).then($el => $el.css({ 'pointer-events': 'all' }))

export function chooseSelectDropdownOption(value: Label, options?: CommonOptions) {
  const opts = logAndMute('chooseSelectOption', value.toString(), options)
  ifOnClock(() => unlockSelectDropdownOptions(opts))
  absoluteRoot(opts).contains(`${dropdownSelector} .ant-select-item-option`, value, opts).click(opts)
}

export function expectSelectDropdownToClose(options?: CommonOptions) {
  getSelectDropdown(options).should('not.exist')
}

export const setInputValue =
  (value: string, { append, ...options }: { append?: boolean } & CommonOptions = {}) =>
  ($el: JQuery) => {
    if (value) on($el).type(append ? value : `{selectall}${value}`, options)
    else on($el).clear(options)
  }

export const setSelectValue =
  (value?: Label, { scrollTo, ...options }: { scrollTo?: ScrollPosition } & TickOptions & CommonOptions = {}) =>
  ($el: JQuery) => {
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

export const clearMultiselect = (options?: CommonOptions) => ($el: JQuery) =>
  getSelectValuePart(on($el), options).then($field => {
    const removalButtons = $field.find('.ant-select-selection-item-remove')
    if (removalButtons.length) {
      cy.wrap(removalButtons, options).click({ ...options, multiple: true })
    }
  })

export const closeMultiselectOptions = (options?: CommonOptions) => ($el: JQuery) =>
  getSelectSearchPart(on($el), options).type('{esc}')

export const setMultiselectValue =
  (
    values: Label[] = [],
    {
      append,
      scrollTo: scrollTos,
      ...options
    }: { append?: boolean; scrollTo?: ScrollPosition | ScrollPosition[] } & TickOptions & CommonOptions = {}
  ) =>
  ($el: JQuery) => {
    if (!append) clearMultiselect(options)($el)
    if (isEmpty(values)) return

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
  (values: Label[] = [], { append, ...options }: { append?: boolean } & TickOptions & CommonOptions = {}) =>
  ($el: JQuery) => {
    if (!append) clearMultiselect(options)($el)
    if (isEmpty(values)) return

    getSelectValuePart(on($el), options).click(options)
    values.forEach(value => getSelectSearchPart(on($el), options).type(`${value}{enter}`))
    closeMultiselectOptions(options)($el)

    tickIfOnClock(options)
    expectSelectDropdownToClose(options)
  }

export const setRadioValue = (value: Label, options?: CommonOptions) => ($el: JQuery) =>
  on($el).contains('.ant-radio-wrapper', value, options).click(options)

export function setFormFieldValue({
  label,
  type = FIELD_TYPE.INPUT,
  value,
  ...options
}: FormFieldValueOptions & CommonOptions) {
  const opts = logAndMute('setFieldValue', `${label}: ${value}`, options)
  const getField = () => getFormField({ label, ...opts })
  const getInput = () => getFormInput({ label, type, ...opts })

  getField().scrollIntoView(opts)

  switch (type) {
    case INPUT:
    case NUMBER_INPUT:
      if (isArray(value) || value === undefined) throw new Error('Input `value` must be a single string or number.')
      getInput().then(setInputValue(isNumber(value) ? String(value) : value, opts))
      return
    case SELECT:
      if (isArray(value)) throw new Error('Select `value` must be a `Label`.')
      getField().then(setSelectValue(value, opts))
      return
    case MULTISELECT:
      if (!isArray(value)) throw new Error('Multiselect `value` must be an array of `Label`s.')
      getField().then(setMultiselectValue(value, opts))
      return
    case TAGS:
      if (!isArray(value)) throw new Error('Multiselect `value` must be an array of `Label`s.')
      getField().then(setTagsValue(value, opts))
      return
    case RADIO:
      if (isArray(value) || value === undefined) throw new Error('Select `value` must be a `Label`.')
      getInput().then(setRadioValue(value, opts))
      return
    default:
      throw unsupportedFieldType(type)
  }
}

export const setFormFieldValues = (
  fields: FormFieldValueOrErrorOptions[] | Record<string, FormFieldValueOrErrorOptions>,
  {
    values,
    ...options
  }: ({ values?: (string | number | string[])[] } | { values?: Record<string, string | number | string[]> }) &
    CommonOptions = {}
) => {
  const mergedFields = mergeFields(fields, { value: values })
  forEach(mergedFields, field => {
    if (!isUndefined(field.value)) setFormFieldValue({ ...options, ...field })
  })
}

// endregion
