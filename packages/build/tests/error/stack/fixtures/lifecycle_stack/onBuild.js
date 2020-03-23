const test = function () {
  console.log(new Error('test'))
  process.exit(2)
}

test()
