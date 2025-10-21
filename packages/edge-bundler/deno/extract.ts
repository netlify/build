import { loadESZIP } from 'https://deno.land/x/eszip@v0.55.2/eszip.ts'

const [functionPath, destPath] = Deno.args

const eszip = await loadESZIP(functionPath)

await eszip.extract(destPath)
