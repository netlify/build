/**
 * @deprecated
 * This are the legacy options for listFrameworks, to preserve the same functionality
 */
interface LegacyOptions {
  projectDir?: string
  nodeVersion?: string
}

/**
 * @deprecated
 * Legacy endpoint to preserve the same behavior for now
 * Return all the frameworks used by a project.
 */
export const listFrameworks = async function (opts: LegacyOptions = {}): Promise<Framework[]> {
  // new Project(new Node())
}
