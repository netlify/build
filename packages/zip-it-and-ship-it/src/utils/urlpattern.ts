import { URLPattern } from 'urlpattern-polyfill'

export class ExtendedURLPattern extends URLPattern {
  declare regexp: Record<string, RegExp>
}
