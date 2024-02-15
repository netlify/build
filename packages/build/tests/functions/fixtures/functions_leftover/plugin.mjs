import { mkdir, writeFile, rm } from "fs/promises";
import { resolve } from "path";

export const onPreDev =  async ({ constants }) => {
  await Promise.all([
    mkdir(resolve(constants.INTERNAL_FUNCTIONS_SRC), {
      recursive: true
    }),
    mkdir(resolve(constants.INTERNAL_EDGE_FUNCTIONS_SRC), {
      recursive: true
    })
  ])

  const functionSource = `export default async () => new Response("Hello from an internal function");`;
  
  const edgeFunctionPath = resolve(
    constants.INTERNAL_EDGE_FUNCTIONS_SRC,
    "from-plugin.mjs"
  );
  await writeFile(edgeFunctionPath, functionSource);

  const serverlessFunctionPath = resolve(
    constants.INTERNAL_FUNCTIONS_SRC,
    "from-plugin.mjs"
  );
  await writeFile(serverlessFunctionPath, functionSource);
};