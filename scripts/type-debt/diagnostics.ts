/**
 * Type-check one package under extra compiler flags, grouped by file, error code
 * or enclosing function, and optionally compared against a committed baseline.
 *
 * Build workspace dependencies first (`npx lerna run build`); otherwise
 * unresolved `@netlify/*` imports show up as TS2307 and skew every count.
 *
 *   node scripts/type-debt/diagnostics.ts <package> [--<compilerFlag> ...]
 *        [--by file|code|function] [--baseline <path> [--update]]
 *
 * The baseline is keyed by file and error code, not a total: correct typing
 * often *raises* a package's count, so a total-count ratchet would block it.
 * A PR that legitimately adds errors runs `--update` and the diff is reviewed.
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import ts from 'typescript'

const [pkg, ...args] = process.argv.slice(2)
if (!pkg) {
  throw new Error(
    'usage: diagnostics.ts <package> [--<compilerFlag> ...] [--by file|code|function] [--baseline <path> [--update]]',
  )
}

const pkgDir = resolve(dirname(fileURLToPath(import.meta.url)), '../../packages', pkg)
// tsconfig.json in some packages has no `include` and pulls in malformed test fixtures.
const configPath = ['tsconfig.build.json', 'tsconfig.json'].map((name) => join(pkgDir, name)).find(existsSync)
if (!configPath) throw new Error(`no tsconfig in ${pkgDir}`)

const valueOf = (flag: string) => {
  const i = args.indexOf(flag)
  return i === -1 ? undefined : args[i + 1]
}
const groupBy = valueOf('--by') ?? 'file'
const baselinePath = valueOf('--baseline')
const update = args.includes('--update')
const ownFlags = new Set(['--by', '--baseline', '--update', groupBy, baselinePath])
const compilerFlags = Object.fromEntries(
  args.filter((arg) => arg.startsWith('--') && !ownFlags.has(arg)).map((arg) => [arg.slice(2), true]),
)

const config = ts.getParsedCommandLineOfConfigFile(
  configPath,
  { ...compilerFlags, noEmit: true },
  {
    ...ts.sys,
    onUnRecoverableConfigFileDiagnostic: (diagnostic) => {
      throw new Error(ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n'))
    },
  },
)
if (!config) throw new Error(`could not parse ${configPath}`)

const program = ts.createProgram(config.fileNames, { ...config.options, composite: false })
const diagnostics = ts
  .getPreEmitDiagnostics(program)
  .filter((d) => d.file?.fileName.startsWith(`${pkgDir}/`) && !d.file.fileName.includes('/node_modules/'))

// Not in the public API typings, but stable across TypeScript 5.x.
const { getTokenAtPosition } = ts as unknown as {
  getTokenAtPosition: (file: ts.SourceFile, position: number) => ts.Node
}

const enclosingFunction = (diagnostic: ts.Diagnostic): string => {
  let node = getTokenAtPosition(diagnostic.file!, diagnostic.start!)
  while (!ts.isFunctionLike(node) && !ts.isSourceFile(node)) node = node.parent
  const file = relative(pkgDir, diagnostic.file!.fileName)
  if (ts.isSourceFile(node)) return `${file} (module scope)`
  const { line } = diagnostic.file!.getLineAndCharacterOfPosition(node.getStart())
  const named = node as ts.Node & { name?: ts.Node }
  const parent = node.parent as ts.Node & { name?: ts.Node }
  const name = named.name?.getText() ?? (ts.isVariableDeclaration(parent) ? parent.name.getText() : '<anonymous>')
  return `${file}:${String(line + 1)} ${name}`
}

const keyFor = (diagnostic: ts.Diagnostic) => {
  if (groupBy === 'code') return `TS${String(diagnostic.code)}`
  if (groupBy === 'function') return enclosingFunction(diagnostic)
  return relative(pkgDir, diagnostic.file!.fileName)
}

const counts = new Map<string, number>()
for (const diagnostic of diagnostics) counts.set(keyFor(diagnostic), (counts.get(keyFor(diagnostic)) ?? 0) + 1)

console.log(
  `${pkg} (${relative(pkgDir, configPath)}${Object.keys(compilerFlags)
    .map((f) => ` --${f}`)
    .join(
      '',
    )}): ${String(diagnostics.length)} errors in ${String(counts.size)} ${groupBy === 'code' ? 'codes' : `${groupBy}s`}`,
)
for (const [key, count] of [...counts].sort((a, b) => b[1] - a[1]).slice(0, 40)) {
  console.log(`${String(count).padStart(6)}  ${key}`)
}

type Baseline = Partial<Record<string, Partial<Record<string, number>>>>

const compareWithBaseline = (path: string) => {
  const current: Baseline = {}
  for (const diagnostic of diagnostics) {
    const entry = (current[relative(pkgDir, diagnostic.file!.fileName)] ??= {})
    const code = `TS${String(diagnostic.code)}`
    entry[code] = (entry[code] ?? 0) + 1
  }

  if (update || !existsSync(path)) {
    const sorted = Object.fromEntries(
      Object.keys(current)
        .sort()
        .map((file) => [file, current[file]]),
    )
    writeFileSync(path, `${JSON.stringify(sorted, null, 2)}\n`)
    console.log(`\nwrote ${path}`)
    return
  }

  const baseline = JSON.parse(readFileSync(path, 'utf8')) as Baseline
  const regressions: string[] = []
  const improvements: string[] = []
  for (const file of new Set([...Object.keys(current), ...Object.keys(baseline)])) {
    for (const code of new Set([...Object.keys(current[file] ?? {}), ...Object.keys(baseline[file] ?? {})])) {
      const now = current[file]?.[code] ?? 0
      const before = baseline[file]?.[code] ?? 0
      const change = `${file} ${code}: ${String(before)} -> ${String(now)}`
      if (now > before) regressions.push(change)
      if (now < before) improvements.push(change)
    }
  }
  if (improvements.length > 0) console.log(`\nimproved (run with --update to lock in):\n  ${improvements.join('\n  ')}`)
  if (regressions.length > 0) {
    console.error(
      `\nnew errors (fix them, or run with --update and justify the diff in review):\n  ${regressions.join('\n  ')}`,
    )
    process.exitCode = 1
  }
}

if (baselinePath) compareWithBaseline(baselinePath)
