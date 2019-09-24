function hasDependency(name, pkg) {
  const { dependencies, devDependencies } = pkg
  const hasItInDeps = dependencies && dependencies[name]
  const hasItInDevDeps = devDependencies && devDependencies[name]
  if (!hasItInDeps && !hasItInDevDeps) {
    return false
  }
  return true
}
