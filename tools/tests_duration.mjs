/* eslint-disable node/no-unpublished-import */
import { promises as fs } from 'fs'

import { execa } from 'execa'
import { globby } from 'globby'

import config from '../ava.config.js'

const CI_MACHINES = 3

const measureDuration = async () => {
  const testFiles = await globby(config.files)

  const result = {
    totalDuration: 0,
    durations: new Map(),
  }
  // eslint-disable-next-line fp/no-loops
  for (const testFile of testFiles) {
    const startTime = performance.now()
    const { stdout } = await execa('ava', [testFile], { preferLocal: true, reject: false })
    console.log(stdout)
    const endTime = performance.now()

    const duration = endTime - startTime
    console.log(`Test file '${testFile}' finished running in ${duration} milliseconds.`)
    result.durations.set(testFile, duration)
    // eslint-disable-next-line fp/no-mutation
    result.totalDuration += duration
  }

  return result
}

const distributeToMachines = ({ durations, totalDuration }) => {
  const budget = totalDuration / CI_MACHINES
  const filesMachines = new Map()

  const state = {
    currentBudget: 0,
    currentMachine: 0,
  }
  // eslint-disable-next-line fp/no-loops
  for (const [file, duration] of durations.entries()) {
    if (state.currentBudget + duration > budget) {
      state.currentBudget = 0
      state.currentMachine += 1
    }
    state.currentBudget += duration
    filesMachines.set(file, { machine: state.currentMachine, duration })
  }

  return { filesMachines }
}

const getOrder = ({ filesMachines }) => {
  // eslint-disable-next-line fp/no-mutating-methods
  const orderArray = [...filesMachines.entries()]
    .sort(([file1, { machine: machine1 }], [file2, { machine: machine2 }]) => {
      if (machine1 === machine2) {
        return file1.localeCompare(file2)
      }
      return machine1 - machine2
    })
    .map(([file, { machine }], index) => ({ file, order: index, machine }))

  return { order: Object.fromEntries(orderArray.map(({ file, order, machine }) => [file, { order, machine }])) }
}

const main = async () => {
  const { durations, totalDuration } = await measureDuration()
  const { filesMachines } = distributeToMachines({ durations, totalDuration })
  const { order } = getOrder({ filesMachines })

  await fs.writeFile('tests-metadata.json', `${JSON.stringify(order, null, 2)}\n`)
}

main()

/* eslint-enable node/no-unpublished-import */
