import { createContext } from 'async-fp'
import { LogLevel, logLevels } from 'standard-log'
import { createSaveSpec } from '../spec/createSaveSpec'
import { createSimulateSpec } from '../spec/createSimulateSpec'
import { Spec } from '../spec/types'
import { createTestHarness } from './createTestHarness'
import { ensureDirNotExists, ensureFileNotExists } from './ensures'
import { SequenceHandler, TestHarness } from './types'

const context = createContext<Spec.Context>()

/**
 * Run spec in both save and simulate mode
 */
const testDuo: TestSpecFn = (...args: any[]) => {
  const { specName, options, handler } = resolveTestSpecFnArgs(args)
  if (options) {
    testSave(specName, options, handler)
    testSimulate(specName, options, handler)
  }
  else {
    testSave(specName, handler)
    testSimulate(specName, handler)
  }
}

const testSave: TestSpecFn = (...args: any[]) => {
  const { specName, options, handler } = resolveTestSpecFnArgs(args)
  const title = `${specName}: save`
  handler(title, createTestSpec(createSaveSpec, specName, options))
}

const testSimulate: TestSpecFn = (...args: any[]) => {
  const { specName, options, handler } = resolveTestSpecFnArgs(args)
  const title = `${specName}: simulate`
  handler(title, createTestSpec(createSimulateSpec, specName, options))
}


/**
 * Runs save and simulate in different sequence.
 */
const testSequence: TestSpecFn<SequenceHandler> = (...args: any[]) => {
  const { specName, options, handler } = resolveTestSpecFnArgs<SequenceHandler>(args)
  handler(specName, {
    save: createTestSpec(createSaveSpec, specName, options),
    simulate: createTestSpec(createSimulateSpec, specName, options)
  })
}

function createTestSpec(specFn: typeof createSaveSpec, specName: string, options: Spec.Options = { timeout: 3000 }): Spec {
  let s: Spec
  const initState: { enableLog: boolean, logLevel?: LogLevel } = { enableLog: false }
  return Object.assign(
    (subject: any) => getSpec(initState).then(s => s(subject)),
    {
      done: () => getSpec(initState).then(s => s.done()),
      enableLog: (level: LogLevel = logLevels.all) => {
        if (s) s.enableLog(level)
        else {
          initState.enableLog = true
          initState.logLevel = level
        }
      },
      getSpecRecord: () => s.getSpecRecord(),
    })

  async function getSpec(initState: { enableLog: boolean, logLevel?: LogLevel }) {
    if (s) return s
    // eslint-disable-next-line require-atomic-updates
    s = await specFn(context, specName, '', options)
    if (initState.enableLog) {
      s.enableLog(initState.logLevel)
    }

    return s
  }
}

export function resolveTestSpecFnArgs<H = Spec.Handler>(args: any[]): { specName: string, options: Spec.Options | undefined, handler: H } {
  if (args.length === 3) {
    return { specName: args[0], options: args[1], handler: args[2] }
  }
  else {
    return { specName: args[0], options: undefined, handler: args[1] }
  }
}

export type TestSpecFn<H = Spec.Handler> = {
  (specName: string, handler: H): void,
  (specName: string, options: Spec.Options, handler: H): void,
}

export type Incubator = {
  save: TestSpecFn<Spec.Handler<Spec>>,
  simulate: TestSpecFn<Spec.Handler<Spec>>,
  duo: TestSpecFn<Spec.Handler<Spec>>,
  sequence: TestSpecFn<SequenceHandler<Spec>>,
  start: (options?: TestHarness.Options | undefined) => Promise<void>,
  ensureDirNotExists: (dirpath: string) => void,
  ensureFileNotExists: (filepath: string) => void,
}

export const incubator = {
  save: testSave,
  simulate: testSimulate,
  duo: testDuo,
  sequence: testSequence,
  start: (options?: TestHarness.Options) => {
    return createTestHarness(context, options).start()
  },
  ensureDirNotExists,
  ensureFileNotExists
} as Incubator

