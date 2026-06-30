import { Fixture } from './fixture.js'
import test from 'ava'

export class AvaFixture extends Fixture {
  constructor(path: string) {
    super(test.meta.file, path)
  }
}
