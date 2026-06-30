export enum BundleFormat {
  ESZIP2 = 'eszip2',
  TARBALL = 'tar',
}

export interface Bundle {
  extension: string
  format: BundleFormat
  hash: string
}
