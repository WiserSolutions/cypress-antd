import mapValues from 'lodash/mapValues'
import pick from 'lodash/pick'

import { render } from '../commands'
import {
  FIELD_TYPE,
  getFormField,
  getFormInput,
  expectFormFieldValue,
  expectSelectValue,
  expectSelectPlaceholder,
  expectFormFieldError,
  expectFormFields,
  setInputValue,
  setSelectValue,
  setMultiselectValue,
  clearMultiselect,
  setFormFieldValue,
  setFormFieldValues,
  setTagsValue
} from '../../src/form'

const renderForm = () =>
  render(({ React, antd: { Form, Input, InputNumber, Select, Radio } }) => (
    <Form>
      <Form.Item label="Track Number" validateStatus="error" help="That's not a valid track number!">
        <InputNumber defaultValue={0} />
      </Form.Item>
      <Form.Item label="Track Name">
        <Input defaultValue="Unnamed" />
      </Form.Item>
      <Form.Item label="Description">
        <Input placeholder="Describe the track in your own terms." />
      </Form.Item>
      <Form.Item label="Genre">
        <Select mode="multiple" defaultValue={['rock', 'metal']}>
          <Select.Option key="rock">Rock</Select.Option>
          <Select.Option key="metal">Metal</Select.Option>
          <Select.Option key="classical">Classical</Select.Option>
          <Select.Option key="rap">Rap</Select.Option>
        </Select>
      </Form.Item>
      <Form.Item label="Style">
        <Radio.Group defaultValue="vocal">
          <Radio value="vocal">Vocal</Radio>
          <Radio value="instrumental">Instrumental</Radio>
          <Radio value="other">Other</Radio>
        </Radio.Group>
      </Form.Item>
      <Form.Item label="Duration">
        <InputNumber defaultValue={60} />
      </Form.Item>
      <Form.Item label="Restriction">
        <Radio.Group defaultValue="none">
          <Radio value="explicit">Explicit</Radio>
          <Radio value="tame">Fluffy</Radio>
          <Radio value="none">Unrated</Radio>
        </Radio.Group>
      </Form.Item>
      <Form.Item label="Scale">
        <Select defaultValue="other" allowClear>
          <Select.Option key="major">Major</Select.Option>
          <Select.Option key="minor">Minor</Select.Option>
          <Select.Option key="pentatonic">Pentatonic</Select.Option>
          <Select.Option key="other">Other</Select.Option>
        </Select>
      </Form.Item>
      <Form.Item label="Mood">
        <Select placeholder="None">
          <Select.Option key="happy">Happy</Select.Option>
          <Select.Option key="sad">Sad</Select.Option>
        </Select>
      </Form.Item>
      <Form.Item label="Tags">
        <Select mode="tags" defaultValue={['song']} />
      </Form.Item>
    </Form>
  ))

const fields = {
  trackNumber: { label: 'Track Number', type: FIELD_TYPE.NUMBER_INPUT },
  trackName: { label: 'Track Name' },
  description: { label: 'Description', placeholder: 'Describe the track in your own terms.' },
  genre: { label: 'Genre', type: FIELD_TYPE.MULTISELECT },
  style: { label: 'Style', type: FIELD_TYPE.RADIO },
  duration: { label: 'Duration', type: FIELD_TYPE.NUMBER_INPUT },
  restriction: { label: 'Restriction', type: FIELD_TYPE.RADIO },
  scale: { label: 'Scale', type: FIELD_TYPE.SELECT },
  mood: { label: 'Mood', type: FIELD_TYPE.SELECT, placeholder: 'None' },
  tags: { label: 'Tags', type: FIELD_TYPE.TAGS }
}
const { trackNumber, trackName, description, genre, duration, restriction, scale, mood, tags } = fields

const defaultValues = {
  trackNumber: 0,
  trackName: 'Unnamed',
  genre: ['Rock', 'Metal'],
  style: 'Vocal',
  duration: 60,
  restriction: 'Unrated',
  scale: 'Other',
  tags: ['song']
}

const defaultErrors = {
  trackNumber: "That's not a valid track number!"
}

const addPropertyToFields = (propKey, propValues) => fieldDefs =>
  mapValues(fieldDefs, (fieldDef, key) => ({ ...fieldDef, [propKey]: propValues[key] }))
const fieldsWithValues = addPropertyToFields('value', defaultValues)(fields)
const fieldsWithValuesAndErrors = addPropertyToFields('error', defaultErrors)(fieldsWithValues)

beforeEach(renderForm)

describe('selectors', () => {
  describe('getFormField', () => {
    it('finds all form fields', () => {
      getFormField()
        .eq(1)
        .should('have.text', 'Track Name')
    })

    it('finds form field by label', () => {
      getFormField(trackName).should('be.visible')
      getFormField({ label: 'Non-existent Field' }).should('not.exist')
    })
  })

  describe('getFormInput', () => {
    it('finds form input by type', () => {
      getFormInput().should('have.value', defaultValues.trackName)

      getFormInput({ type: FIELD_TYPE.MULTISELECT })
        .eq(0)
        .should('have.text', 'RockMetal ') // &nbsp;

      getFormInput({ type: FIELD_TYPE.RADIO })
        .eq(0)
        .find(':checked')
        .closest('label')
        .should('have.text', defaultValues.style)
    })

    it('finds form input by type and field label', () => {
      getFormInput(description).should('have.value', '')

      getFormInput(duration).should('have.value', String(defaultValues.duration))

      getFormInput({ label: 'Style' }).should('not.exist') // type mismatch

      getFormInput(restriction)
        .find(':checked')
        .closest('label')
        .should('have.text', defaultValues.restriction)
    })
  })
})

describe('assertions', () => {
  describe('expectSelectValue', () => {
    it('expects a select-box to have a specific value', () => {
      getFormField(scale).then(expectSelectValue(defaultValues.scale))
    })
  })

  describe('expectSelectPlaceholder', () => {
    it('expects a select-box to show a specific placeholder', () => {
      getFormField(mood).then(expectSelectPlaceholder('None'))
    })
  })

  describe('expectFormFieldValue', () => {
    it('expects a form field (identified by label and/or type) to have a specific value', () => {
      expectFormFieldValue(fieldsWithValues.trackName)

      expectFormFieldValue(fieldsWithValues.duration)

      expectFormFieldValue(fieldsWithValues.scale)

      expectFormFieldValue(fieldsWithValues.genre)

      expectFormFieldValue(fieldsWithValues.restriction)
    })

    it('expects a form field to show a specific placeholder', () => {
      expectFormFieldValue({
        ...description,
        placeholder: 'Describe the track in your own terms.'
      })

      expectFormFieldValue({
        ...mood,
        placeholder: 'None'
      })
    })
  })

  describe('expectFormFieldError', () => {
    it('expects a form field to have a specific validation hint', () => {
      expectFormFieldError({
        ...trackNumber,
        error: "That's not a valid track number!"
      })
    })
  })

  describe('expectFormFields', () => {
    it('expects selected form fields to have specific values/placeholders', () => {
      expectFormFields(fieldsWithValuesAndErrors)
    })

    it('supports an array of fields', () => {
      expectFormFields(Object.values(fieldsWithValuesAndErrors))
    })

    it('supports separately supplied `values`', () => {
      expectFormFields(fields, { values: defaultValues })
    })

    it('supports separately supplied `errors`', () => {
      expectFormFields([trackNumber, trackName], { errors: [defaultErrors.trackNumber] })
    })
  })
})

describe('interactions', () => {
  describe('setInputValue', () => {
    it('sets input value', () => {
      getFormInput(trackName)
        .then(setInputValue('White and Nerdy'))
        .should('have.value', 'White and Nerdy')
    })

    it('clears input value', () => {
      getFormInput(duration)
        .then(setInputValue())
        .should('have.value', '')
    })

    it('appends input value', () => {
      getFormInput(trackName)
        .then(setInputValue(' Track', { append: true }))
        .should('have.value', 'Unnamed Track')
    })
  })

  describe('setSelectValue', () => {
    it('sets select-box value', () => {
      getFormField(mood)
        .then(setSelectValue('Happy'))
        .then(expectSelectValue('Happy'))
    })

    it('clears select-box value', () => {
      getFormField(scale)
        .then(setSelectValue())
        .then(expectSelectValue())
    })

    it('works inside `within`', () => {
      getFormField(mood).within(() => {
        cy.root()
          .then(setSelectValue('Sad'))
          .then(expectSelectValue('Sad'))
      })
    })
  })

  describe('setMultiselectValue', () => {
    it('sets multiple selection select-box values', () => {
      getFormField(genre).then(setMultiselectValue(['Metal', 'Classical']))
      expectFormFieldValue({ ...genre, value: ['Metal', 'Classical'] })
    })

    it('clears multiple selection select-box values', () => {
      getFormField(genre).then(setMultiselectValue())
      expectFormFieldValue({ ...genre, value: [] })
    })

    it('selects additional values in multiple selection select-box', () => {
      getFormField(genre).then(setMultiselectValue(['Classical'], { append: true }))
      expectFormFieldValue({ ...genre, value: ['Rock', 'Metal', 'Classical'] })
    })
  })

  describe('setTagsValue', () => {
    const newTags = ['melodic', 'brainworm']

    it('sets tags-style select-box values', () => {
      getFormField(tags).then(setTagsValue(newTags))
      expectFormFieldValue({ ...tags, value: newTags })
    })

    it('clears tags-style select-box values', () => {
      getFormField(tags).then(setTagsValue())
      expectFormFieldValue({ ...tags, value: [] })
    })

    it('adds additional values to tags-style select-box', () => {
      getFormField(tags).then(setTagsValue([...defaultValues.tags, ...newTags]))
    })
  })

  describe('clearMultiselect', () => {
    it('clears multiple selection select-box values', () => {
      getFormField(genre).then(clearMultiselect())
      expectFormFieldValue({ ...genre, value: [] })
    })
  })

  describe('setFormFieldValue', () => {
    it('finds a form field and sets/clears its value', () => {
      const newTrackName = { ...trackName, value: 'Pretender' }
      setFormFieldValue(newTrackName)
      expectFormFieldValue(newTrackName)

      const newDuration = { ...duration, value: 269 }
      setFormFieldValue(newDuration)
      expectFormFieldValue(newDuration)

      const newScale = { ...scale, value: 'Major' }
      setFormFieldValue(newScale)
      expectFormFieldValue(newScale)

      const newGenre = { ...genre, value: ['Rock'] }
      setFormFieldValue(newGenre)
      expectFormFieldValue(newGenre)

      const newRestriction = { ...restriction, value: 'Fluffy' }
      setFormFieldValue(newRestriction)
      expectFormFieldValue(newRestriction)
    })
  })

  describe('setFormFieldValues', () => {
    const newValues = {
      trackName: 'Bleed It Out',
      duration: 164,
      scale: 'Major',
      genre: ['Rap', 'Rock'],
      restriction: 'Explicit'
    }
    const fieldsToModify = pick(fields, ['trackName', 'duration', 'scale', 'genre', 'restriction'])
    const fieldsWithNewValues = addPropertyToFields('value', newValues)(fieldsToModify)

    it('sets/clears values to/of selected form fields', () => {
      setFormFieldValues(fieldsWithNewValues)
      expectFormFields(fieldsWithNewValues)
    })

    it('supports array of fields', () => {
      setFormFieldValues(Object.values(fieldsWithNewValues))
      expectFormFields(fieldsWithNewValues)
    })

    it('supports separately supplied `values`', () => {
      setFormFieldValues(fieldsToModify, { values: newValues })
      expectFormFields(fieldsWithNewValues)
    })
  })
})
