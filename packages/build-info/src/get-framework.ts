import { Framework } from './frameworks/framework.js'
import { FrameworkName, frameworks } from './frameworks/index.js'
import { Project } from './project.js'

/** Return some information about a framework used by a project. */
export async function getFramework(frameworkId: FrameworkName, project: Project): Promise<Framework> {
  const frameworkList = frameworks.map((Framework) => new Framework(project))
  const framework = frameworkList.find(({ id }) => id === frameworkId)

  if (framework) {
    return framework
  }

  const frameworkIds = frameworkList
    .map(({ id }) => id)
    .sort()
    .join(', ')
  throw new Error(`Invalid framework "${frameworkId}". It should be one of: ${frameworkIds}`)
}
