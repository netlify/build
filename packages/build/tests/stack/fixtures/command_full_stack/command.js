import { exit } from 'process'

const test = function () {
  console.log(new Error('test'))
  exit(2)
}

test()
