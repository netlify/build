export const MIGRATION_DIR_PATTERN = /^\d+_[a-z0-9_-]+$/
export const MIGRATION_FILE_PATTERN = /^\d+_[a-z0-9_-]+\.sql$/

interface MissingSqlFileError {
  type: 'missing_sql_file'
  dirName: string
}

interface DuplicateMigrationNumberError {
  type: 'duplicate_migration_number'
  migrationNumber: string
  names: string[]
}

type ValidationError = MissingSqlFileError | DuplicateMigrationNumberError

interface ValidationResult {
  valid: true
  dirs: string[]
  files: string[]
}

interface ValidationFailure {
  valid: false
  errors: ValidationError[]
}

export const trackMigrationNumber = (numberToNames: Map<string, string[]>, name: string) => {
  const key = /^(\d+)_/.exec(name)![1].replace(/^0+/, '') || '0'
  const existing = numberToNames.get(key)
  if (existing) {
    existing.push(name)
  } else {
    numberToNames.set(key, [name])
  }
}

export const validateMigrations = (
  dirNames: string[],
  fileNames: string[],
  existingSqlFiles: Set<string>,
): ValidationResult | ValidationFailure => {
  const errors: ValidationError[] = []
  const matchingDirs: string[] = []
  const numberToNames = new Map<string, string[]>()

  for (const dirName of dirNames) {
    if (!MIGRATION_DIR_PATTERN.test(dirName)) {
      continue
    }

    matchingDirs.push(dirName)
    trackMigrationNumber(numberToNames, dirName)

    if (!existingSqlFiles.has(dirName)) {
      errors.push({ type: 'missing_sql_file', dirName })
    }
  }

  const matchingFiles: string[] = []
  for (const fileName of fileNames) {
    if (MIGRATION_FILE_PATTERN.test(fileName)) {
      matchingFiles.push(fileName)
      trackMigrationNumber(numberToNames, fileName)
    }
  }

  for (const [migrationNumber, names] of numberToNames) {
    if (names.length > 1) {
      errors.push({ type: 'duplicate_migration_number', migrationNumber, names: names.sort() })
    }
  }

  if (errors.length > 0) {
    return { valid: false, errors }
  }

  return {
    valid: true,
    dirs: matchingDirs.sort(),
    files: matchingFiles.sort(),
  }
}

export const formatValidationErrors = (errors: ValidationError[]): string => {
  const lines = errors.map((error) => {
    if (error.type === 'missing_sql_file') {
      return `  - "${error.dirName}/migration.sql" is missing.`
    }
    return `  - Duplicate migration number ${error.migrationNumber}: ${error.names.map((n) => `"${n}"`).join(', ')}`
  })

  return `Database migration validation failed:\n${lines.join('\n')}`
}
