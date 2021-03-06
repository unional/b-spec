import a from 'assertron';
import { komondorTest as k, IDCannotBeEmpty, spec } from '..';

beforeAll(() => {
  k.createTestHarness()
})

test('id cannot be an empty string', async () => {
  await a.throws(() => spec('', { a: 1 }), IDCannotBeEmpty)
  await a.throws(() => spec.live('', { a: 1 }), IDCannotBeEmpty)
  await a.throws(() => spec.save('', { a: 1 }), IDCannotBeEmpty)
  await a.throws(() => spec.simulate('', { a: 1 }), IDCannotBeEmpty)
})

