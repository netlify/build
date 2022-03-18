import { env } from 'process'

const BOOTSTRAP_LATEST =
  'https://dinosaurs:are-the-future!@62337d29c8edd9000870ec20--edge-bootstrap.netlify.app/index.ts'

const getBootstrapURL = () => env.NETLIFY_EDGE_BOOTSTRAP ?? BOOTSTRAP_LATEST

export const getBootstrapImport = () => `import { boot } from "${getBootstrapURL()}";`
