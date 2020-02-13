import { createStore } from 'global-store'
import { config } from './types'
import { AsyncContext } from 'async-fp'
import { Spec } from '@mocktomata/framework'

export type NodeJSStore = {
  // context needs to be save in the store because there maybe multiple versions of `mocktomata`
  // is loaded, thus the initializer may be called multiple times.
  context?: AsyncContext<Spec.Context>,
  config: config.Options
}

export const store = createStore<NodeJSStore>({
  moduleName: 'mocktomata',
  key: 'f6d1823b-b529-473e-ab84-17cada707ef9',
  version: '7.0.0',
  initializer: current => ({
    config: {},
    ...current
  })
})
