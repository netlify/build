import filterObj from 'filter-obj'

// Remove falsy values from object
export const removeFalsy = function (obj) {
  return filterObj(obj, isDefined)
}

const isDefined = function (key, value) {
  return value !== undefined && value !== ''
}
