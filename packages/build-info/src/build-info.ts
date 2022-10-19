export class BuildInfo {
  public repositoryRoot: string

  constructor(
    /** This is an absolute path to the repository */
    repositoryRoot: string = process.cwd(),
    /** Is a relative path from the repository root to the sub packages (mostly used inside mono repositories) */
    packagePath?: string,
  ) {
    // const absoluteProjectDir = resolve(rootDir, projectDir)
    // // If a relative absolute path is given we rely on cwd
    // const absoluteRootDir = rootDir ? resolve(cwd(), rootDir) : undefined
    // // We only pass through the root dir if it was provided and is actually different
    // // from the project dir
    // const validRootDir = absoluteRootDir && absoluteRootDir !== absoluteProjectDir ? absoluteRootDir : undefined
    // // If rootDir equals projectDir we'll be getting the projectDir package.json
    // // Later on if we also need the projectDir package.json we can check for it
    // // and only perform one resolution
    // const rootPackageJson = await getPackageJson(rootDir || projectDir)
    // return {
    //   projectDir: absoluteProjectDir,
    //   rootDir: validRootDir,
    //   rootPackageJson,
    // }
  }

  toJSON() {
    return {}
  }
}
