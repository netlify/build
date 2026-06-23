import { URLPattern } from 'urlpattern-polyfill'

// Exposing internal property that the `URLPattern` polyfill class is using.
type ExtendedURLPattern = URLPattern & { regexp: Record<string, RegExp> }

export const getRegexpFromURLPatternPath = (path: string) => {
  const pattern = new URLPattern({ pathname: path }) as ExtendedURLPattern

  return pattern.regexp.pathname.source
}
