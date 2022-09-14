interface DeclarationWithPath {
  function: string
  path: string
}

interface DeclarationWithPattern {
  function: string
  pattern: string
}

type Declaration = DeclarationWithPath | DeclarationWithPattern

export { Declaration, DeclarationWithPath, DeclarationWithPattern }
