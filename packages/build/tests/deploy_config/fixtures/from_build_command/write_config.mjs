import {promises as fs} from "fs"
import {resolve} from "path"

const writeConfig = async () => {
  const configDirectory = resolve(".netlify", "deploy", "v1")

  await fs.mkdir(configDirectory, {recursive: true})
  await fs.copyFile("seed.json", resolve(configDirectory, "config.json"))
}

writeConfig()