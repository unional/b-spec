import { spec } from './spec';
import { Spec } from './spec/types';

export function testTrio(description: string, handler: ((title: string, spec: <T>(subject: T) => Promise<Spec<T>>) => void | Promise<any>)) {
  testLive(description, handler)
  testSave(description, handler)
  testSimulate(description, handler)
}

export function testLive(description: string, handler: ((title: string, spec: <T>(subject: T) => Promise<Spec<T>>) => void | Promise<any>)) {
  handler(`${description}: live`, s => spec.live(description, s))
}

export function testSave(description: string, handler: ((title: string, spec: <T>(subject: T) => Promise<Spec<T>>) => void | Promise<any>)) {
  handler(`${description}: save`, s => spec.save(description, s))
}

export function testSimulate(description: string, handler: ((title: string, spec: <T>(subject: T) => Promise<Spec<T>>) => void | Promise<any>)) {
  handler(`${description}: simulate`, s => spec.simulate(description, s))
}

const komondorTest = {
  live: testLive,
  save: testSave,
  simulate: testSimulate,
  trio: testTrio
}

export default komondorTest
