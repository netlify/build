export interface MetadataFile {
  bootstrap_version?: string
  branch?: string
  version: number
}

export const getMetadataFile = (bootstrapVersion?: string, branch?: string): MetadataFile => ({
  bootstrap_version: bootstrapVersion,
  branch,
  version: 1,
})
