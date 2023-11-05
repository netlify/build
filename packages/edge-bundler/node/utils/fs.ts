import path from 'path'

/**
 * Returns all the directories obtained by traversing `inner` and its parents
 * all the way to `outer`, inclusive.
 */
export const pathsBetween = (inner: string, outer: string, paths: string[] = []): string[] => {
  const parent = path.dirname(inner)

  if (inner === outer || inner === parent) {
    return [...paths, outer]
  }

  return [inner, ...pathsBetween(parent, outer)]
}
