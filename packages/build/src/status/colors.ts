import { stripVTControlCharacters } from 'node:util'

import type { Status } from './add.js'

type ColoredStatus = Pick<Status, 'title' | 'summary' | 'text'>

// Remove colors from statuses
export const removeStatusesColors = function <T extends ColoredStatus>(statuses: T[]): T[] {
  return statuses.map(removeStatusColors)
}

const removeStatusColors = function <T extends ColoredStatus>(status: T): T {
  const attributes = COLOR_ATTRIBUTES.map((attribute) => removeAttrColor(status, attribute))
  return attributes.reduce<T>((statusA, attribute) => ({ ...statusA, ...attribute }), { ...status })
}

const COLOR_ATTRIBUTES = ['title', 'summary', 'text'] as const

const removeAttrColor = function (status: ColoredStatus, attribute: keyof ColoredStatus): ColoredStatus {
  const value = status[attribute]
  if (value === undefined) {
    return {}
  }

  const valueA = stripVTControlCharacters(value)
  return { [attribute]: valueA }
}
