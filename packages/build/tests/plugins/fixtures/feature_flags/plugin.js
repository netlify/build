import { appendFileSync } from  "fs"

const systemLog = "/dev/fd/4" // 🪄 magic ✨

export const onBuild = function ({ featureFlags }) {
  appendFileSync(systemLog, "some system-facing logs\n")
  console.log(JSON.stringify(featureFlags))
}
