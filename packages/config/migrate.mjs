import { globby } from 'globby'
import { rename } from 'fs/promises'
const files = await globby('tests/**/*.ts')

// console.log(files)

// for (const file of files) {
//   rename(file, file.replace('.ts', '.js'))
// }
