#!/usr/bin/env node
import { promises as fs } from 'fs'
import { resolve } from 'path'

import { execa } from 'execa'
import { globby } from 'globby'

const CI_MACHINES = 4

const measureDurations = async () => {
  const { default: config } = await import(resolve('ava.config.js'))
  const testFiles = await globby(config.files)

  const durations = new Map()
  for (const testFile of testFiles) {
    const startTime = performance.now()
    const { stdout } = await execa('ava', [testFile], { preferLocal: true, reject: false, verbose: 'full' })
    console.log(stdout)
    const endTime = performance.now()

    const duration = endTime - startTime
    console.log(`Test file '${testFile}' finished running in ${duration} milliseconds.`)
    durations.set(testFile, duration)
  }

  return durations
}

const distributeToMachines = (durations) => {
  const filesMachines = new Map()

  // we implement a greedy algorithm to distribute the tests to the CI machines
  const descendingDurations = [...durations.entries()].sort(([, duration1], [, duration2]) => duration2 - duration1)
  const machinesSums = new Array(CI_MACHINES).fill(0)
  for (const [file, duration] of descendingDurations) {
    const machine = machinesSums.indexOf(Math.min(...machinesSums))
    machinesSums[machine] += duration
    filesMachines.set(file, { machine, duration })
  }

  return filesMachines
}

const getOrder = (filesMachines) => {
  const orderArray = [...filesMachines.entries()]
    .sort(([file1, { machine: machine1 }], [file2, { machine: machine2 }]) => {
      if (machine1 === machine2) {
        return file1.localeCompare(file2)
      }
      return machine1 - machine2
    })
    .map(([file, { machine }], index) => ({ file, order: index, machine }))

  return Object.fromEntries(orderArray.map(({ file, order, machine }) => [file, { order, machine }]))
}

const main = async () => {
  const durations = await measureDurations()
  const filesMachines = distributeToMachines(durations)
  const order = getOrder(filesMachines)

  await fs.writeFile('tests-metadata.json', `${JSON.stringify(order, null, 2)}\n`)
}

main()
