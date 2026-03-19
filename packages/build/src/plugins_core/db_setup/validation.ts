export const MIGRATION_DIR_PATTERN = /^\d+_[a-z0-9_-]+$/
export const MIGRATION_FILE_PATTERN = /^\d+_[a-z0-9_-]+\.sql$/

interface ValidationError {
  type: 'missing_sql_file'
  dirName: string
}

interface ValidationResult {
  valid: true
  dirs: string[]
  files: string[]
}

interface ValidationFailure {
  valid: false
  errors: ValidationError[]
}

export const validateMigrations = (
  dirNames: string[],
  fileNames: string[],
  existingSqlFiles: Set<string>,
): ValidationResult | ValidationFailure => {
  const errors: ValidationError[] = []
  const matchingDirs: string[] = []

  for (const dirName of dirNames) {
    if (!MIGRATION_DIR_PATTERN.test(dirName)) {
      continue
    }

    matchingDirs.push(dirName)

    if (!existingSqlFiles.has(dirName)) {
      errors.push({ type: 'missing_sql_file', dirName })
    }
  }

  if (errors.length > 0) {
    return { valid: false, errors }
  }

  const matchingFiles: string[] = []
  for (const fileName of fileNames) {
    if (MIGRATION_FILE_PATTERN.test(fileName)) {
      matchingFiles.push(fileName)
    }
  }

  return {
    valid: true,
    dirs: [...matchingDirs].sort(),
    files: [...matchingFiles].sort(),
  }
}

export const formatValidationErrors = (errors: ValidationError[]): string => {
  const lines = errors.map((error) => {
    return `  - "${error.dirName}/migration.sql" is missing.`
  })

  return `Database migration validation failed:\n${lines.join('\n')}`
}
