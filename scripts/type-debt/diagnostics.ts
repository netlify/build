// Build workspace dependencies first (`npx lerna run build`), or unresolved `@netlify/*` imports show up
// as TS2307 and skew every count.
import { existsSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import ts from 'typescript'

const [pkg, ...args] = process.argv.slice(2)
if (!pkg) {
  throw new Error('usage: diagnostics.ts <package> [--<compilerFlag> ...] [--by file|code|function]')
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
const ownFlags = new Set(['--by', groupBy])
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
