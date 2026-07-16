export interface NetlifyPluginDeployUtilEnv {
  add(
    key: string,
    value: string,
    options?: { isSecret?: boolean; scopes?: ('functions' | 'post_processing' | 'runtime')[] },
  ): this
}

export interface NetlifyPluginDeployUtil {
  readonly env: NetlifyPluginDeployUtilEnv
}
