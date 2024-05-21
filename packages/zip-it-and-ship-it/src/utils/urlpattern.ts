import { URLPattern } from 'urlpattern-polyfill'

export class ExtendedURLPattern extends URLPattern {
  regexp: Record<string, RegExp>
}
