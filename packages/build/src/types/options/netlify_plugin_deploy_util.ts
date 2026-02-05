export interface NetlifyPluginDeployUtilEnv {
  add(
    key: string,
    value: string,
    options?: { isSecret?: boolean; scopes?: ['builds' | 'functions' | 'post_processing' | 'runtime'][] },
  ): this
}

export interface NetlifyPluginDeployUtil {
  readonly env: NetlifyPluginDeployUtilEnv
}
