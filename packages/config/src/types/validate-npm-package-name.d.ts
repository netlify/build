declare module 'validate-npm-package-name' {
  interface ValidationResult {
    validForNewPackages: boolean
    validForOldPackages: boolean
    warnings?: string[]
    errors?: string[]
  }

  export default function validateNpmPackageName(name: string): ValidationResult
}
