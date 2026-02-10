export const MIGRATION_DIR_PATTERN = /^\d{10}_[a-z0-9-]+$/

interface ValidationError {
  type: 'invalid_dir_name' | 'missing_sql_file'
  dirName: string
}

interface ValidationResult {
  valid: true
  dirs: string[]
}

interface ValidationFailure {
  valid: false
  errors: ValidationError[]
}

export const validateMigrationDirs = (
  dirNames: string[],
  existingSqlFiles: Set<string>,
): ValidationResult | ValidationFailure => {
  const errors: ValidationError[] = []

  for (const dirName of dirNames) {
    if (!MIGRATION_DIR_PATTERN.test(dirName)) {
      errors.push({ type: 'invalid_dir_name', dirName })
      continue
    }

    if (!existingSqlFiles.has(dirName)) {
      errors.push({ type: 'missing_sql_file', dirName })
    }
  }

  if (errors.length > 0) {
    return { valid: false, errors }
  }

  const sorted = [...dirNames].sort()
  return { valid: true, dirs: sorted }
}

export const formatValidationErrors = (errors: ValidationError[]): string => {
  const lines = errors.map((error) => {
    if (error.type === 'invalid_dir_name') {
      return `  - "${error.dirName}" does not match the required pattern "<10-digit-timestamp>_<slug>" (e.g. "1700000000_create-users"). Slugs must be lowercase alphanumeric with hyphens.`
    }
    return `  - "${error.dirName}/migration.sql" is missing.`
  })

  return `Database migration validation failed:\n${lines.join('\n')}`
}
