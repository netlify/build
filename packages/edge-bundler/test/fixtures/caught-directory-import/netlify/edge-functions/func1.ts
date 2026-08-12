// Importing a directory is unsupported in Deno (ERR_UNSUPPORTED_DIR_IMPORT).
// `deno info` still reports the directory as an errored module reachable via a
// runtime (code) edge, so it can end up in the list of source files to bundle.
// The import is caught, so the function itself is fine, but tarball generation
// used to throw EISDIR when copying the directory. Guard against that.
try {
  await import('../../models')
} catch (error) {
  console.error('Error importing directory but we continue anyway:', error)
}

export default function Handler() {
  return new Response('ok')
}

export const config = {
  path: '/*',
}
