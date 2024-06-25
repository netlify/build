import { cp } from 'node:fs/promises'
import { resolve } from "node:path"

await cp(resolve("frameworks_api_seed"), resolve(".netlify/v1"), { recursive: true })
