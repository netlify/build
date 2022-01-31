interface DeclarationWithPath {
  handler: string
  path: string
}

interface DeclarationWithPattern {
  handler: string
  pattern: string
}

type Declaration = DeclarationWithPath | DeclarationWithPattern

export { Declaration, DeclarationWithPath, DeclarationWithPattern }
