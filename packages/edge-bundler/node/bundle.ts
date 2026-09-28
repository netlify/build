export enum BundleFormat {
  ESZIP2 = 'eszip2',
  TARBALL = 'tar',
}

export interface Bundle {
  extension: string
  format: BundleFormat
  hash: string

  // Tarball only. Whether the bundle's import map has entries beyond the
  // defaults every bundle gets.
  customImportMap?: boolean

  // Tarball only. Whether `deno install --vendor` wrote a `vendor/manifest.json`,
  // which it does when a remote module needs headers recorded (e.g. a redirect,
  // or a URL with a query string).
  vendorManifest?: boolean
}
