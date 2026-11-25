import shout from 'shout'

import type { Greeting } from './types.ts'

export const greet = (name: string): Greeting => ({ message: shout(`hello ${name}`) })
