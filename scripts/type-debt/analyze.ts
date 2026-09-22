// Reports `all`, `value` (no `import type`) and `emitted` (from `lib/` or `dist/`) graphs, as they disagree
// a lot: tsc also drops imports only used as types, so only `emitted` decides evaluation order.
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import ts from 'typescript'

const PACKAGES = resolve(dirname(fileURLToPath(import.meta.url)), '../../packages')

type Graph = Map<string, Set<string>>

const isOwnSource = (pkgDir: string, file: string) =>
  file.startsWith(`${pkgDir}/`) &&
  !file.endsWith('.d.ts') &&
  !/\/(node_modules|tests?|test-d|fixtures)\//.test(relative(pkgDir, file))

const configFor = (pkgDir: string): string | undefined =>
  ['tsconfig.build.json', 'tsconfig.json'].map((name) => join(pkgDir, name)).find(existsSync)

const sourceGraphs = (pkgDir: string) => {
  const configPath = configFor(pkgDir)
  if (!configPath) return undefined
  const config = ts.getParsedCommandLineOfConfigFile(
    configPath,
    {},
    { ...ts.sys, onUnRecoverableConfigFileDiagnostic: () => {} },
  )
  if (!config) return undefined
  const files = config.fileNames.filter((f) => isOwnSource(pkgDir, f))
  const known = new Set(files)
  const host = ts.createCompilerHost(config.options)
  const all: Graph = new Map()
  const value: Graph = new Map()

  for (const file of files) {
    all.set(file, new Set())
    value.set(file, new Set())
    const source = ts.createSourceFile(file, readFileSync(file, 'utf8'), ts.ScriptTarget.ESNext, true)
    const add = (specifier: string, typeOnly: boolean) => {
      if (!specifier.startsWith('.')) return
      const target = ts.resolveModuleName(specifier, file, config.options, host).resolvedModule?.resolvedFileName
      if (!target || !known.has(target)) return
      all.get(file)!.add(target)
      if (!typeOnly) value.get(file)!.add(target)
    }
    for (const statement of source.statements) {
      if (ts.isImportDeclaration(statement) && ts.isStringLiteral(statement.moduleSpecifier)) {
        const clause = statement.importClause
        const bindings = clause?.namedBindings
        const everySpecifierIsType =
          !clause?.name &&
          bindings !== undefined &&
          ts.isNamedImports(bindings) &&
          bindings.elements.length > 0 &&
          bindings.elements.every((element) => element.isTypeOnly)
        add(statement.moduleSpecifier.text, clause?.phaseModifier === ts.SyntaxKind.TypeKeyword || everySpecifierIsType)
      } else if (
        ts.isExportDeclaration(statement) &&
        statement.moduleSpecifier &&
        ts.isStringLiteral(statement.moduleSpecifier)
      ) {
        add(statement.moduleSpecifier.text, statement.isTypeOnly)
      }
    }
    source.forEachChild(function visit(node): void {
      if (ts.isCallExpression(node) && node.expression.kind === ts.SyntaxKind.ImportKeyword) {
        const argument = node.arguments.at(0)
        if (argument && ts.isStringLiteral(argument)) add(argument.text, false)
      }
      node.forEachChild(visit)
    })
  }
  return { files, all, value }
}

const walkJs = (dir: string): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) return walkJs(path)
    return entry.name.endsWith('.js') ? [path] : []
  })

// Specifiers are read with a regex: emitted code is uniform enough, and it avoids resolving `lib/`.
const emittedGraph = (pkgDir: string): Graph | undefined => {
  const libDir = ['lib', 'dist'].map((name) => join(pkgDir, name)).find(existsSync)
  if (!libDir) return undefined
  const files = walkJs(libDir)
  const known = new Set(files)
  const graph: Graph = new Map()
  for (const file of files) {
    const targets = new Set<string>()
    for (const match of readFileSync(file, 'utf8').matchAll(/^\s*(?:import|export)\b[^'"]*?['"](\.[^'"]+)['"]/gm)) {
      const target = resolve(dirname(file), match[1])
      if (known.has(target)) targets.add(target)
    }
    graph.set(file, targets)
  }
  return graph
}

/** Tarjan's algorithm; returns components with more than one module, largest first. */
const cycles = (graph: Graph): string[][] => {
  let counter = 0
  const index = new Map<string, number>()
  const low = new Map<string, number>()
  const stack: string[] = []
  const onStack = new Set<string>()
  const components: string[][] = []
  const visit = (node: string) => {
    index.set(node, counter)
    low.set(node, counter)
    counter += 1
    stack.push(node)
    onStack.add(node)
    for (const next of graph.get(node) ?? []) {
      if (!index.has(next)) {
        visit(next)
        low.set(node, Math.min(low.get(node)!, low.get(next)!))
      } else if (onStack.has(next)) {
        low.set(node, Math.min(low.get(node)!, index.get(next)!))
      }
    }
    if (low.get(node) !== index.get(node)) return
    const component: string[] = []
    let member: string
    do {
      member = stack.pop()!
      onStack.delete(member)
      component.push(member)
    } while (member !== node)
    if (component.length > 1) components.push(component)
  }
  for (const node of graph.keys()) if (!index.has(node)) visit(node)
  return components.sort((a, b) => b.length - a.length)
}

/** Conversion order: convert a .js file after the .js files it imports, so their types flow into it. */
const waves = (graph: Graph, jsFiles: string[]): string[][] => {
  const remaining = new Set(jsFiles)
  const result: string[][] = []
  while (remaining.size > 0) {
    const wave = [...remaining].filter(
      (file) => ![...graph.get(file)!].some((dep) => dep !== file && remaining.has(dep)),
    )
    // Inside a cycle nothing is "first"; take the rest as one wave.
    const next = wave.length > 0 ? wave : [...remaining]
    result.push(next.sort())
    for (const file of next) remaining.delete(file)
  }
  return result
}

const describe = (components: string[][], base: string) =>
  components.length === 0
    ? 'none'
    : components
        .map(
          (c) =>
            `${String(c.length)} [${c
              .map((f) => relative(base, f))
              .sort()
              .join(', ')}]`,
        )
        .join('; ')

const selected = process.argv.slice(2)
const packages = readdirSync(PACKAGES).filter((name) => selected.length === 0 || selected.includes(name))

for (const name of packages) {
  const pkgDir = join(PACKAGES, name)
  const graphs = sourceGraphs(pkgDir)
  if (!graphs) continue
  const jsFiles = graphs.files.filter((file) => file.endsWith('.js'))
  const loc = jsFiles.reduce((total, file) => total + readFileSync(file, 'utf8').split('\n').length, 0)
  console.log(`\n${name}: ${String(graphs.files.length)} modules, ${String(jsFiles.length)} .js (${String(loc)} loc)`)

  const summarize = (label: string, graph: Graph | undefined, base: string) => {
    if (!graph) {
      console.log(`  ${label.padEnd(8)} not built (run \`npx lerna run build\`)`)
      return
    }
    const found = cycles(graph)
    const sizes = found.map((c) => c.length).join(', ') || 'none'
    console.log(`  ${label.padEnd(8)} cycles: ${sizes}`)
    if (label === 'emitted' && found.length > 0) console.log(`           ${describe(found, base)}`)
  }
  summarize('all', graphs.all, pkgDir)
  summarize('value', graphs.value, pkgDir)
  summarize('emitted', emittedGraph(pkgDir), pkgDir)

  if (jsFiles.length > 0) {
    waves(graphs.all, jsFiles).forEach((wave, i) => {
      console.log(`  wave ${String(i + 1)}: ${wave.map((file) => relative(pkgDir, file)).join(' ')}`)
    })
  }
}
