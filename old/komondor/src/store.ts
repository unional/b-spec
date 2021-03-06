import { SpecMode } from 'komondor-plugin'
import { KomondorOptions, GivenMode } from './interfaces'

export interface GivenHandlerEntry {
  clause: string | RegExp,
  handler: any,
  invoked?: true
}

let specDefaultMode: SpecMode | undefined
let specOverrides: { mode: SpecMode, filter: string | RegExp }[] = []
let givenEntries: GivenHandlerEntry[] = []
let envDefaultMode: GivenMode | undefined
let envOverrides: { mode: SpecMode, filter: string | RegExp }[] = []
const defaultOptions = {}
let options: KomondorOptions = { ...defaultOptions }

export let store = {
  artifacts: {},
  defaultArtifacts: {},
  defaultMode: undefined as SpecMode | undefined,
  scenarioOverrides: [] as { mode: SpecMode, filter: string | RegExp }[],
  specDefaultMode,
  specOverrides,
  steps: [] as {
    clause: string,
    handler: Function,
    regex?: RegExp,
    valueTypes?: string[]
  }[],
  givenEntries,
  envDefaultMode,
  envOverrides,
  options
}

// for testing only
export function resetStore() {
  store.artifacts = {}
  store.defaultArtifacts = {}
  store.defaultMode = undefined
  store.scenarioOverrides = []
  store.specDefaultMode = undefined
  store.specOverrides = []
  store.givenEntries = []
  store.steps = []
  store.envDefaultMode = undefined
  store.envOverrides = []
  store.options = {}
}
