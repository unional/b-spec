import { KomondorPlugin, PluginModule } from '../types';

// istanbul ignore next
export const echoPluginModule: PluginModule = {
  activate(context) {
    context.register(echoPlugin)
  }
}

// istanbul ignore next
export const echoPlugin: KomondorPlugin = {
  support() { return true },
  getSpy(_, s) { return s },
  getStub(_, s) { return s }
}


// istanbul ignore next
export const pluginModuleA: PluginModule = {
  activate(context) {
    context.register(pluginA)
  }
}

// istanbul ignore next
export const pluginA: KomondorPlugin = {
  name: 'plugin-a',
  support() { return true },
  getSpy() { return {} },
  getStub() { return {} },
  serialize() { return '' }
}

