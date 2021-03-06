
import { isPromise } from './isPromise'
import { KomondorPlugin, SpyContext, StubContext } from '../../types';

export const promisePlugin: KomondorPlugin = {
  name: 'promise',
  support: isPromise,
  getSpy: getPromiseSpy,
  getStub: getPromiseStub

}

function getPromiseSpy(context: SpyContext, subject: Promise<any>) {
  const recorder = context.newRecorder()
  const instance = recorder.construct()
  const call = instance.newCall()
  return subject.then(
    result => {
      return call.return(result, { state: 'fulfilled' })
    },
    err => {
      throw call.return(err, { state: 'rejected' })
    })
}

function getPromiseStub(context: StubContext) {
  const player = context.newPlayer()
  const instance = player.construct()
  const call = instance.newCall()
  return new Promise((resolve, reject) => {
    call.waitUntilReturn(() => {
      if (call.succeed({ state: 'fulfilled' })) {
        resolve(call.result())
      }
      else {
        reject(call.thrown())
      }
    })
  })
}
