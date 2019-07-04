import { spec, Spec } from './spec';

export type KomondorTestHandler = (title: string, spec: <T>(subject: T) => Promise<Spec<T>>) => void | Promise<any>

export function testTrio(description: string, handler: KomondorTestHandler) {
  testLive(description, handler)
  testSave(description, handler)
  testSimulate(description, handler)
}

export function testLive(description: string, handler: KomondorTestHandler) {
  handler(`${description}: live`, s => spec.live(description, s))
}

export function testSave(description: string, handler: KomondorTestHandler) {
  handler(`${description}: save`, s => spec.save(description, s))
}

export function testSimulate(description: string, handler: KomondorTestHandler) {
  handler(`${description}: simulate`, s => spec.simulate(description, s))
}

export const komondorTest = {
  live: testLive,
  save: testSave,
  simulate: testSimulate,
  trio: testTrio
}
