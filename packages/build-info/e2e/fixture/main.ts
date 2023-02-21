import { GithubProvider, WebFS } from '../../src/browser/file-system.js'
import { detectPackageManager } from '../../src/package-managers/detect-package-manager.js'
import { Project } from '../../src/project.js'
import { detectWorkspaces } from '../../src/workspaces/detect-workspace.js'

declare const window: Window & {
  fs: WebFS
  project: typeof Project
  detectPackageManager: typeof detectPackageManager
  detectWorkspace: typeof detectWorkspaces
}

window.project = Project
window.detectPackageManager = detectPackageManager
window.detectWorkspace = detectWorkspaces

window.fs = new WebFS(new GithubProvider('netlify/build'))
