export interface MinimalHeader {
  for: string
  values: Record<string, string>
}

export interface Header extends MinimalHeader {
  forRegExp: RegExp
}
