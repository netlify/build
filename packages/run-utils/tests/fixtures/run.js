import { argv } from 'process'

import { runCommand } from '../../lib/main.js'

const [, , command, options] = argv
const optionsA = options === undefined ? options : JSON.parse(options)
runCommand(command, optionsA)
