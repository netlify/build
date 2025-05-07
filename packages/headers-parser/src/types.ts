export interface MinimalHeader {
  for: string
  values: {
    [key: string]: string
  }
}

export interface Header extends MinimalHeader {
  forRegExp: RegExp
}
