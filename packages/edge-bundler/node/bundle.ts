export enum BundleFormat {
  TARBALL = 'tar',
}

export interface Bundle {
  extension: string
  format: BundleFormat
  hash: string
}
