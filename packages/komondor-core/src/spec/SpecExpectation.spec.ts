import a from 'assertron'

import { createExpectation, createScopedCreateExpectation } from './SpecExpectation'

describe('createExpectation', () => {
  it('create with meta', () => {
    const s = createExpectation('node-fetch', 'invoke', { b: 1 })
    const expectation = s('payload', { a: 1 })
    a.satisfy({ type: 'node-fetch', name: 'invoke', payload: 'payload', meta: { a: 1, b: 1 } }, expectation)
  })
  it('can use expectation with meta', () => {
    const s = createExpectation('node-fetch', 'invoke')
    const expectation = s('payload', { a: 1 })
    a.satisfy({ type: 'node-fetch', name: 'invoke', payload: 'payload', meta: { a: 1 } }, expectation)
  })
  it('can use expectation without meta', () => {
    const s = createExpectation('node-fetch', 'invoke')
    const expectation = s('payload')
    a.satisfy({ type: 'node-fetch', name: 'invoke', payload: 'payload' }, expectation)
  })
})

describe('createScopedCreateExpectation', () => {
  it('create with meta', () => {
    const createSatisfier = createScopedCreateExpectation('x')
    const s = createSatisfier('node-fetch', 'invoke', { b: 1 })
    const expectation = s('payload', { a: 1 })
    a.satisfy({ type: 'x/node-fetch', name: 'invoke', payload: 'payload', meta: { a: 1, b: 1 } }, expectation)
  })
  it('create with meta', () => {
    const createSatisfier = createScopedCreateExpectation('x')
    const s = createSatisfier('node-fetch', 'invoke')
    const expectation = s('payload', { a: 1 })
    a.satisfy({ type: 'x/node-fetch', name: 'invoke', payload: 'payload', meta: { a: 1 } }, expectation)
  })
  it('meta is optional', () => {
    const createSatisfier = createScopedCreateExpectation('x')
    const s = createSatisfier('node-fetch', 'invoke')
    const expectation = s('payload')
    a.satisfy({ type: 'x/node-fetch', name: 'invoke', payload: 'payload' }, expectation)
  })
})

