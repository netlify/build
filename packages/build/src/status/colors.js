import { stripVTControlCharacters } from 'node:util'

// Remove colors from statuses
export const removeStatusesColors = function (statuses) {
  return statuses.map(removeStatusColors)
}

const removeStatusColors = function (status) {
  const attributes = COLOR_ATTRIBUTES.map((attribute) => removeAttrColor(status, attribute))
  return Object.assign({}, status, ...attributes)
}

const COLOR_ATTRIBUTES = ['title', 'summary', 'text']

const removeAttrColor = function (status, attribute) {
  const value = status[attribute]
  if (value === undefined) {
    return {}
  }

  const valueA = stripVTControlCharacters(value)
  return { [attribute]: valueA }
}
