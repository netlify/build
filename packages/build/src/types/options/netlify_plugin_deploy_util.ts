export interface NetlifyPluginDeployUtilEnv {
  add(key: string, value: string, options?: { isSecret?: boolean }): this
}

export interface NetlifyPluginDeployUtil {
  readonly env: NetlifyPluginDeployUtilEnv
}
