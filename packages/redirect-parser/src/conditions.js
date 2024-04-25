// Normalize conditions
export const normalizeConditions = function (rawConditions) {
  const caseNormalizedConditions = normalizeConditionCases(rawConditions)
  const listNormalizedConditions = normalizeConditionLists(caseNormalizedConditions)
  return listNormalizedConditions
}

// Conditions can optionally be capitalized
const normalizeConditionCases = function (conditions) {
  return CONDITION_CAPITALIZED_PROPS.reduce(normalizeConditionCase, conditions)
}

const CONDITION_CAPITALIZED_PROPS = [
  { name: 'role', capitalizedName: 'Role' },
  { name: 'language', capitalizedName: 'Language' },
  { name: 'country', capitalizedName: 'Country' },
]

const normalizeConditionCase = function (conditions, { name, capitalizedName }) {
  const { [capitalizedName]: capitalizedProp, [name]: prop = capitalizedProp, ...conditionsA } = conditions
  return prop === undefined ? conditionsA : { ...conditionsA, [capitalizedName]: prop }
}

// Some `conditions` are array of strings.
// In `_redirects`, they are comma-separated lists instead.
const normalizeConditionLists = function (conditions) {
  return CONDITION_LIST_PROPS.reduce(normalizeConditionList, conditions)
}

const CONDITION_LIST_PROPS = ['Role', 'Language', 'Country']

const normalizeConditionList = function (conditions, name) {
  return typeof conditions[name] === 'string'
    ? { ...conditions, [name]: conditions[name].trim().split(CONDITION_LIST_REGEXP) }
    : conditions
}

const CONDITION_LIST_REGEXP = /\s*,\s*/gu
