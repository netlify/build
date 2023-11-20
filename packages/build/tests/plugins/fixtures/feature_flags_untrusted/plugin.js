export const onBuild = function ({ featureFlags, systemLog }) {
  if (systemLog) {
    throw new Error("System log shouldn't be acessible from untrusted plugins")
  }
  console.log("typeof featureflags:", typeof featureFlags)
}
