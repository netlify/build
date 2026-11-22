import { readFileSync } from 'fs'

export const seed = JSON.parse(readFileSync(new URL('./seed.json', import.meta.url), 'utf-8'))
