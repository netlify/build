// @ts-expect-error execa can only be imported by using a default import
import { execa } from 'execa'

export const shellUtils = { runCommand: execa }
