export type Header = {
  for: string
  forRegExp?: RegExp
  values: {
    [key: string]: string
  }
}
