export const onBuild = function ({ featureFlags, systemLog }) {
  systemLog("some system-facing logs")
  console.log(JSON.stringify(featureFlags))
}
