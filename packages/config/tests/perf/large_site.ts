import { promises as fs } from 'fs'
import { join } from 'path'

export const SITE_SIZE = {
  contexts: 50,
  plugins: 20,
  configRedirects: 300,
  configHeaders: 200,
  fileRedirects: 5000,
  fileHeaders: 1000,
  functions: 200,
  edgeFunctions: 100,
}

export const LARGE_SITE_BRANCH = 'feat/perf-7'
export const LARGE_SITE_CONTEXT = 'deploy-preview'

const range = (length: number): number[] => Array.from({ length }, (_, index) => index)

const contexts = (): string => {
  const exact = ['production', 'deploy-preview', 'branch-deploy', 'dev', 'staging', 'qa']
  const wildcards = range(10).map((index) => `feat/perf-${String(index)}*`)
  const branches = range(SITE_SIZE.contexts - exact.length - wildcards.length).map(
    (index) => `release-${String(index)}`,
  )
  return [...exact, ...wildcards, 'feat/*', ...branches]
    .slice(0, SITE_SIZE.contexts)
    .map(
      (name, index) => `[context."${name}"]
command = "npm run build:${String(index)}"
publish = "dist"

[context."${name}".environment]
CONTEXT_INDEX = "${String(index)}"
API_URL = "https://api-${String(index)}.example.com"
`,
    )
    .join('\n')
}

const plugins = (): string =>
  range(SITE_SIZE.plugins)
    .map(
      (index) => `[[plugins]]
package = "netlify-plugin-perf-${String(index)}"

[plugins.inputs]
level = ${String(index)}
paths = ["src/${String(index)}", "lib/${String(index)}"]
mode = "strict"
`,
    )
    .join('\n')

const configRedirects = (): string =>
  range(SITE_SIZE.configRedirects)
    .map(
      (index) => `[[redirects]]
from = "/toml-old/${String(index)}/*"
to = "/toml-new/${String(index)}/:splat"
status = ${index % 3 === 0 ? '200' : '301'}
force = ${String(index % 2 === 0)}
${index % 5 === 0 ? `conditions = { Country = ["us", "ca"], Language = ["en"] }\n` : ''}`,
    )
    .join('\n')

const configHeaders = (): string =>
  range(SITE_SIZE.configHeaders)
    .map(
      (index) => `[[headers]]
for = "/toml-assets/${String(index)}/*"

[headers.values]
Cache-Control = "public, max-age=${String(index * 60)}"
X-Frame-Options = "DENY"
`,
    )
    .join('\n')

const functions = (): string =>
  range(SITE_SIZE.functions)
    .map(
      (index) => `[functions."fn-${String(index)}"]
included_files = ["data/fn-${String(index)}/**"]
external_node_modules = ["sharp"]
${index % 10 === 0 ? 'schedule = "@daily"\n' : ''}`,
    )
    .join('\n')

const edgeFunctions = (): string =>
  range(SITE_SIZE.edgeFunctions)
    .map(
      (index) => `[[edge_functions]]
path = "/edge/${String(index)}/*"
function = "ef-${String(index)}"
`,
    )
    .join('\n')

const netlifyToml = (): string => `[build]
command = "npm run build"
publish = "dist"
functions = "netlify/functions"

[build.environment]
NODE_VERSION = "22"

[functions]
node_bundler = "esbuild"

${functions()}
${edgeFunctions()}
${plugins()}
${contexts()}
${configRedirects()}
${configHeaders()}`

const redirectsFile = (): string =>
  range(SITE_SIZE.fileRedirects)
    .map((index) => {
      const kind = index % 4
      if (kind === 0) return `/blog/${String(index)}/* /posts/${String(index)}/:splat 301`
      if (kind === 1) return `/shop/${String(index)} id=:id /store/${String(index)}/:id 302`
      if (kind === 2) return `/api/${String(index)}/* https://backend.example.com/${String(index)}/:splat 200!`
      return `/intl/${String(index)} /fr/${String(index)} 302 Country=fr Language=fr`
    })
    .join('\n')

const headersFile = (): string =>
  range(SITE_SIZE.fileHeaders)
    .map(
      (index) => `/static/${String(index)}/*
  Cache-Control: public, max-age=31536000, immutable
  X-Content-Type-Options: nosniff
  Access-Control-Allow-Origin: https://site-${String(index % 7)}.example.com`,
    )
    .join('\n')

export const writeLargeSite = async function (root: string): Promise<void> {
  await fs.mkdir(join(root, 'dist'), { recursive: true })
  await fs.mkdir(join(root, 'netlify/functions'), { recursive: true })
  await fs.writeFile(join(root, 'netlify.toml'), netlifyToml())
  await fs.writeFile(join(root, 'dist/_redirects'), redirectsFile())
  await fs.writeFile(join(root, 'dist/_headers'), headersFile())
}
