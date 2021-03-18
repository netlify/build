'use strict'

const module1 = require('@netlify/imaginary-module-one')
const module3 = require('@netlify/imaginary-module-three')
const module2 = require('@netlify/imaginary-module-two')

module.exports = () => [module1, module2, module3]
