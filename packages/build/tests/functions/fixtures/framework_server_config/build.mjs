import { mkdir, writeFile } from "node:fs/promises"

await mkdir(".netlify/v1/server", { recursive: true })

await writeFile(
  ".netlify/v1/server/index.mjs",
  `export default async () => new Response("hello from the framework server")`,
)

const config = {
  server: {
    path: ["/app/*", "/api/*"],
    region: "fra",
    scale: { min: 1, max: 10 },
    size: "large",
  },
}

await writeFile(".netlify/v1/config.json", JSON.stringify(config))
