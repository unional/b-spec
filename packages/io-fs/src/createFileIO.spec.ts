import { createFileIO } from '.';

test('load npm plugin package', async () => {
  const io = createFileIO('fixtures/has-plugins')
  const actual = await io.loadPlugin('@komondor-lab/plugin-fixture-dummy')
  expect(typeof actual.activate).toBe('function')
})

test('can load plugin using deep link', async () => {
  const io = createFileIO('fixtures/has-plugins')
  const actual = await io.loadPlugin('@komondor-lab/plugin-fixture-deep-link/pluginA')

  expect(typeof actual.activate).toBe('function')
})
