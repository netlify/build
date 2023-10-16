export type Integration = {
  slug: string
  version?: string
  has_build?: boolean
  dev?: {
    path: string
  }
}
