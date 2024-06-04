export enum BundleFormat {
  ESZIP2 = 'eszip2',
  JS = 'js',
}

export interface Bundle {
  extension: string
  format: BundleFormat
  hash: string
}
