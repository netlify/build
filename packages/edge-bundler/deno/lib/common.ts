import { load } from "https://deno.land/x/eszip@v0.37.0/loader.ts";
import { LoadResponse } from "https://deno.land/x/eszip@v0.37.0/mod.ts";
import * as path from "https://deno.land/std@0.178.0/path/mod.ts";
import { retryAsync } from "https://deno.land/x/retry@v2.0.0/mod.ts";
import { isTooManyTries } from "https://deno.land/x/retry@v2.0.0/retry/tooManyTries.ts";

const inlineModule = (specifier: string, content: string): LoadResponse => {
  return {
    content,
    headers: {
      "content-type": "application/typescript",
    },
    kind: "module",
    specifier,
  };
};

const loadFromVirtualRoot = async (
  specifier: string,
  virtualRoot: string,
  basePath: string,
) => {
  const basePathURL = path.toFileUrl(basePath).toString();
  const filePath = specifier.replace(virtualRoot.slice(0, -1), basePathURL);
  const file = await load(filePath);

  if (file === undefined) {
    throw new Error(`Could not find file: ${filePath}`);
  }

  return { ...file, specifier };
};

const loadWithRetry = (specifier: string, delay = 1000, maxTry = 3) => {
  if (!specifier.startsWith("https://")) {
    return load(specifier);
  }

  try {
    return retryAsync(() => load(specifier), {
      delay,
      maxTry,
    });
  } catch (error) {
    if (isTooManyTries(error)) {
      console.error(`Loading ${specifier} failed after ${maxTry} tries.`);
    }
    throw error;
  }
};

export { inlineModule, loadFromVirtualRoot, loadWithRetry };
