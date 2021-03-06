import { findByKeywords } from 'find-installed-packages'
import { MOCKTOMATA_PLUGIN_KEYWORD } from './constants'

export function findInstalledPlugins(cwd: string) {
  return findByKeywords([MOCKTOMATA_PLUGIN_KEYWORD], { cwd })
}
