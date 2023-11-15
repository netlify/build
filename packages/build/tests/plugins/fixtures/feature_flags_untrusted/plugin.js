import { appendFileSync } from  "fs"

const isSystemLogAccessible = () => {
  try {
    appendFileSync("/dev/fd/4", "some system-facing logs")
    return true
  } catch (error) {
    return false
  }
}

export const onBuild = function ({ featureFlags }) {
  if (isSystemLogAccessible()) {
    throw new Error("System log shouldn't be acessible from untrusted plugins")
  }
  console.log("typeof featureflags:", typeof featureFlags)
}
