import { env } from 'process'

const BOOTSTRAP_LATEST =
  'https://dinosaurs:are-the-future!@623c91447947b7000844416d--edge-bootstrap.netlify.app/index.ts'

const getBootstrapURL = () => env.NETLIFY_EDGE_BOOTSTRAP ?? BOOTSTRAP_LATEST

export const getBootstrapImport = () => `import { boot } from "${getBootstrapURL()}";`
