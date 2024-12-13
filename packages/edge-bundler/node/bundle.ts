export enum BundleFormat {
  ESZIP2 = 'eszip2',
  JS = 'js',
  TARBALL = 'tar',
}

export interface Bundle {
  extension: string
  format: BundleFormat
  hash: string
}
