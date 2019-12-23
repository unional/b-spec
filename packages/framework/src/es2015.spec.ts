import a from 'assertron';
import { incubator } from '../src';
import { ActionMismatch, ActionTypeMismatch, ExtraAction, ExtraReference, ReferenceMismatch } from './spec';
import { callbackInDeepObjLiteral, callbackInObjLiteral, delayed, fetch, postReturn, recursive, simpleCallback, synchronous } from './test-artifacts';

beforeAll(() => {
  return incubator.start({ target: 'es2015' })
})

describe.skip('mismatch simulation', () => {
  incubator.sequence('extra reference', (title, { save, simulate }) => {
    test(title, async () => {
      await save.done()
      await a.throws(simulate({}), ExtraReference)
    })
  })

  incubator.sequence('mismatch reference', (title, { save, simulate }) => {
    test(title, async () => {
      await save({})
      await save.done()
      await a.throws(simulate(() => { }), ReferenceMismatch)
    })
  })

  incubator.sequence('extra action', (title, { save, simulate }) => {
    test(title, async () => {
      await save(() => { })
      await save.done()
      const stub = await simulate(() => { })
      a.throws(() => stub(), ExtraAction)
    })
  })

  incubator.sequence('mismatch get action', (title, { save, simulate }) => {
    test(title, async () => {
      const subject = { a: 1, b: () => { } }
      const spy = await save(subject)
      expect(spy.a).toBe(1)
      await save.done()

      const stub = await simulate(subject)
      a.throws(() => stub.b, ActionMismatch)
    })
  })

  incubator.sequence('mismatch invoke action', (title, { save, simulate }) => {
    test(title, async () => {
      const subject = () => { }
      const spy = await save(subject)
      spy()
      await save.done()

      const stub = await simulate(subject)
      a.throws(() => stub.length, ActionMismatch)
    })
  })

  incubator.sequence('expecting extra action before return', (title, { save, simulate }) => {
    test(title, async () => {
      const spy = await save((v: any) => v.v)
      spy({ v: 1 })
      await save.done()

      const stub = await simulate((v: any) => v)
      a.throws(() => stub({ v: 1 }), ActionTypeMismatch)
    })
  })

  // incubator.sequence('missing result action on save', (title, { save, simulate }) => {
  //   test.only(title, async () => {
  //     const subject = () => new Promise(a => { setTimeout(a, 100) })
  //     const spy = await save(subject)
  //     spy()
  //     await save.done()

  //     const stub = await simulate(subject)
  //     a.throws(() => stub(), MissingResultAction)

  //   })
  // })
})

describe('object', () => {
  incubator.duo('get primitive property', (title, spec) => {
    test(title, async () => {
      const subject = await spec({ a: 1 })
      const actual = subject.a

      expect(actual).toBe(1)

      await spec.done()
    })
  })

  incubator.duo('set primitive property', (title, spec) => {
    test(title, async () => {
      const subject = await spec({ a: 1 })
      const actual = subject.a = 2

      expect(actual).toBe(2)

      await spec.done()
    })
  })

  incubator.duo('update primitive property', (title, spec) => {
    test(title, async () => {
      const subject = await spec({ a: 1 })
      expect(subject.a).toBe(1)
      subject.a = 2
      expect(subject.a).toBe(2)
      await spec.done()
    })
  })

  incubator.duo('throw during get', (title, spec) => {
    test(title, async () => {
      const subject = await spec({ get x() { throw new Error('thrown') } })
      a.throws(() => subject.x, e => e.message === 'thrown')
      await spec.done()
    })
  })

  test.todo('handles property changes type from value to function')

  incubator.duo('primitive method', (title, spec) => {
    test(title, async () => {
      const subject = await spec({ echo: (x: number) => x })
      const actual = subject.echo(3)

      expect(actual).toBe(3)

      await spec.done()
    })
  })

  incubator.duo('primitive method throws error', (title, spec) => {
    test(title, async () => {
      const subject = await spec({ echo: (x: string) => { throw new Error(x) } })
      const err = a.throws(() => subject.echo('abc'))

      expect(err.message).toBe('abc')

      await spec.done()
    })
  })

  incubator.sequence('object property is mocked', (title, { save, simulate }) => {
    test(title, async () => {
      const spy = await save({ a: { do() { return 1 } } })

      expect(spy.a.do()).toBe(1)

      await save.done()

      const stub = await simulate({ a: { do() { throw new Error('should not reach') } } })

      expect(stub.a.do()).toBe(1)

      await simulate.done()
    })
  })

  incubator.duo('callback method success', (title, spec) => {
    test(title, async () => {
      const subject = await spec({
        inc(x: number, cb: (x: number) => void) {
          cb(x + 1)
        }
      })
      let actual: number
      subject.inc(3, x => actual = x)

      expect(actual!).toBe(4)

      await spec.done()
    })
  })

  incubator.duo('same child in two properties', (title, spec) => {
    test(title, async () => {
      const child = { a: 1 }
      const subject = { x: child, y: child }
      const s = await spec(subject)
      expect(s.x.a).toBe(1)
      expect(s.y.a).toBe(1)

      s.x.a = 2
      expect(s.y.a).toBe(2)
      await spec.done()
    })
  })

  incubator.duo('circular child properties', (title, spec) => {
    test(title, async () => {
      const subject: any = { a: 1 }
      subject.s = subject

      const s = await spec(subject)
      expect(s.a).toBe(1)
      expect(s.s.a).toBe(1)
      expect(s.s.s.a).toBe(1)

      s.a = 2
      expect(s.s.a).toBe(2)
      await spec.done()
    })
  })
})

describe('function', () => {
  incubator.duo('no input no result', (title, spec) => {
    test(title, async () => {
      const subject = await spec(() => { })
      expect(subject()).toBeUndefined()

      await spec.done()

      a.satisfies(await spec.getSpecRecord(), {
        refs: [
          { 'plugin': '@mocktomata/es2015/function', 'profile': 'target' },
          { 'plugin': '@mocktomata/es2015/undefined', 'profile': 'input', 'source': { 'type': 'this', 'id': 0 } }
        ],
        actions: [
          { 'type': 'invoke', 'refId': '0', 'performer': 'user', 'thisArg': '1', 'payload': [] },
          { 'type': 'return', 'actionId': 0, 'payload': '1' }
        ]
      })
    })
  })
  incubator.duo('string input no result', (title, spec) => {
    test(title, async () => {
      const subject = await spec((_x: string) => { })
      expect(subject('abc')).toBeUndefined()

      await spec.done()
    })
  })
  incubator.duo('string input returns same string', (title, spec) => {
    test(title, async () => {
      const subject = await spec((x: string) => x)
      expect(subject('abc')).toEqual('abc')

      await spec.done()
    })
  })
  incubator.duo('no input, string result', (title, spec) => {
    test(title, async () => {
      const subject = await spec(() => 'abc')
      const actual = subject()
      expect(actual).toBe('abc')

      await spec.done()
    })
  })
  incubator.duo('undefined input, undefined result', (title, spec) => {
    test(title, async () => {
      const subject = await spec((_a: any, _b: any) => undefined)
      const actual = subject(undefined, undefined)
      expect(actual).toBe(undefined)
      await spec.done()
    })
  })
  incubator.duo('primitive inputs, simple result', (title, spec) => {
    test(title, async () => {
      const subject = await spec((x: number, y: number) => x + y)
      const actual = subject(1, 2)

      expect(actual).toBe(3)

      await spec.done()
    })
  })
  incubator.duo('no input, array output', (title, spec) => {
    test(title, async () => {
      const subject = await spec(() => [1, 2, 'c'])
      const actual = subject()
      expect(actual).toEqual([1, 2, 'c'])

      await spec.done()
    })
  })
  incubator.duo('array inputs', (title, spec) => {
    test(title, async () => {
      const subject = await spec(function takeArray(name: string, args: string[]) { return { name, args } })
      const actual = subject('node', ['--version'])

      a.satisfies(actual, { name: 'node', args: ['--version'] })
      await spec.done()
    })
  })

  incubator.duo('insert value to input array', (title, spec) => {
    test(title, async () => {
      const subject = await spec(function passthroughArray(value: string[]) {
        value.push('c')
        return value
      })
      const actual = subject(['a', 'b'])
      expect(actual).toEqual(['a', 'b', 'c'])
      await spec.done()
    })
  })

  incubator.duo('throwing error', (title, spec) => {
    test(title, async () => {
      const subject = await spec(() => { throw new Error('failed') })
      const err = a.throws(() => subject())

      expect(err.message).toBe('failed')

      await spec.done()
    })
  })
  incubator.duo('throwing custom error', (title, spec) => {
    test(title, async () => {
      class CustomError extends Error {
        constructor(message: string) {
          super(message)

          Object.setPrototypeOf(this, new.target.prototype)
        }
        x = 'x'
        one = 1
      }
      const subject = await spec(() => { throw new CustomError('failed') })
      const err = a.throws<CustomError>(() => subject())

      expect(err.message).toBe('failed')
      expect(err.x).toBe('x')
      expect(err.one).toBe(1)
      await spec.done()
    })
  })
  incubator.duo('immediate invoke callback', (title, spec) => {
    test(title, async () => {
      const subject = await spec(simpleCallback.success)
      let actual
      subject(2, (_, result) => {
        actual = result
      })

      expect(actual).toBe(3)

      await spec.done()
    })
  })
  function echo(value: any, callback: (v: any) => void) {
    callback(value)
  }

  incubator.duo('callback receiving undefined', (title, spec) => {
    test(title, async () => {
      const subject = await spec(echo)
      let actual: any
      subject(undefined, v => actual = v)

      expect(actual).toBeUndefined()
      await spec.done()
    })
  })

  incubator.duo('callback receiving null', (title, spec) => {
    test(title, async () => {
      const subject = await spec(echo)
      let actual: any
      subject(null, v => actual = v)

      expect(actual).toBeNull()
      await spec.done()
    })
  })
  incubator.duo('immediate invoke throwing callback', (title, spec) => {
    test(title, async () => {
      const subject = await spec(simpleCallback.fail)

      const err = await a.throws(simpleCallback.increment(subject, 2))

      expect(err.message).toBe('fail')

      await spec.done()
    })
  })
  incubator.duo('simple callback invoked multiple times', (title, spec) => {
    test(title, async () => {
      const subject = await spec(simpleCallback.success)

      expect(await simpleCallback.increment(subject, 2)).toBe(3)
      expect(await simpleCallback.increment(subject, 4)).toBe(5)

      await spec.done()
    })
  })
  incubator.duo('delayed callback invocation', (title, spec) => {
    test(title, async () => {
      const subject = await spec(delayed.success)

      expect(await delayed.increment(subject, 2)).toBe(3)
      expect(await delayed.increment(subject, 4)).toBe(5)

      await spec.done()
    })
  })
  incubator.duo('callback in object literal success', (title, spec) => {
    test(title, async () => {
      const subject = await spec(callbackInObjLiteral.success)

      expect(await callbackInObjLiteral.increment(subject, 2)).toBe(3)

      await spec.done()
    })
  })
  incubator.duo('callback in object literal fail', (title, spec) => {
    test(title, async () => {
      const subject = await spec(callbackInObjLiteral.fail)

      const err = await a.throws(callbackInObjLiteral.increment(subject, 2), Error)

      expect(err.message).toBe('fail')

      await spec.done()
    })
  })
  incubator.duo('callback in deep object literal success', (title, spec) => {
    test(title, async () => {
      const subject = await spec(callbackInDeepObjLiteral.success)

      expect(await callbackInDeepObjLiteral.increment(subject, 2)).toBe(3)
      expect(await callbackInDeepObjLiteral.increment(subject, 4)).toBe(5)

      await spec.done()
    })
  })
  incubator.duo('synchronous callback success', (title, spec) => {
    test(title, async () => {
      const subject = await spec(synchronous.success)

      expect(synchronous.increment(subject, 3)).toBe(4)

      await spec.done()
    })
  })
  incubator.duo('synchronous callback throws', (title, spec) => {
    test(title, async () => {
      const subject = await spec(synchronous.fail)

      const err = a.throws(() => synchronous.increment(subject, 3))

      expect(err.message).toBe('fail')

      await spec.done()
    })
  })
  incubator.duo('recursive two calls success', (title, spec) => {
    test(title, async () => {
      const subject = await spec(recursive.success)

      const actual = await recursive.decrementToZero(subject, 2)

      expect(actual).toBe(0)

      await spec.done()
    })
  })
  incubator.duo('invoke callback after returns', (title, spec) => {
    test(title, async () => {
      const subject = await spec(postReturn.fireEvent)

      await new Promise(a => {
        let called = 0
        subject('event', 3, () => {
          called++
          if (called === 3)
            a()
        })
      })

      await spec.done()
    })
  })
  incubator.duo('invoke fetch style: with options and callback', (title, spec) => {
    test(title, async () => {
      const subject = await spec(fetch.success)
      const actual = await fetch.add(subject, 1, 2)
      expect(actual).toBe(3)
      await spec.done()
    })
  })
  incubator.duo('invoke fetch style: receive error in callback', (title, spec) => {
    test(title, async () => {
      const subject = await spec(fetch.fail)
      const actual = await a.throws(fetch.add(subject, 1, 2))
      expect(actual).toEqual({ message: 'fail' })
      await spec.done()
    })
  })
  incubator.duo('function with array arguments', (title, spec) => {
    test(title, async () => {
      const subject = await spec(function takeArray(name: string, args: string[]) { return { name, args } })
      const actual = subject('node', ['--version'])

      expect(actual.name).toBe('node')
      expect(actual.args).toEqual(['--version'])

      await spec.done()
    })
  })
  incubator.duo('function with static prop', (title, spec) => {
    test(title, async () => {
      const fn = Object.assign(function () { }, { a: 1 })

      const mock = await spec(fn)
      expect(mock.a).toBe(1)

      await spec.done()
    })
  })

  incubator.duo('return out of scope value', (title, spec) => {
    function scopingSpec(expected: number) {
      return spec(() => expected)
    }

    test(title, async () => {
      await scopingSpec(1).then(subject => expect(subject()).toBe(1))
      await scopingSpec(3).then(subject => expect(subject()).toBe(3))
      await spec.done()
    })
  })
})

describe('promise', () => {
  const promise = {
    increment(remote: any, x: number) {
      return remote('increment', x)
    },
    success(_url: string, x: number) {
      return Promise.resolve(x + 1)
    },
    fail() {
      return Promise.reject(new Error('expected error'))
    }
  }

  const promiseChain = {
    increment(remote: any, x: number) {
      return remote('increment', x)
    },
    success(_url: string, x: number) {
      return new Promise(a => {
        setTimeout(a, 1)
      }).then(() => Promise.resolve(() => x + 1))
    },
    fail() {
      return new Promise(a => {
        setTimeout(a, 1)
      }).then(() => Promise.reject(() => new Error('expected error')))
    }
  }

  const noReturn = {
    doSomething(remote: Function) {
      return remote()
    },
    success() {
      return Promise.resolve()
    }
  }

  incubator.duo('resolve with no value', (title, spec) => {
    test(title, async () => {
      const subject = await spec(noReturn.success)
      await noReturn.doSomething(subject).then((v: any) => {
        expect(v).toBeUndefined()
        return spec.done()
      })
    })
  })

  incubator.duo('resolve with value', (title, spec) => {
    test(title, async () => {
      const subject = await spec(promise.success)
      // not using `await` to make sure the return value is a promise.
      // `await` will hide the error if the return value is not a promise.
      return promise.increment(subject, 2)
        .then((actual: number) => {
          expect(actual).toBe(3)
          return spec.done()
        })
    })
  })

  incubator.duo('reject with error', (title, spec) => {
    test(title, async () => {
      const subject = await spec(promise.fail)
      return promise.increment(subject, 2)
        .then(() => { throw new Error('should not reach') })
        .catch(async (e: Error) => {
          expect(e.message).toBe('expected error')
          await spec.done()
        })
    })
  })

  incubator.duo('promise with callback in between', (title, spec) => {
    test(title, async () => {
      function foo(x: number, cb: Function) {
        return new Promise(a => {
          setTimeout(() => {
            cb('called')
            a(x + 1)
          }, 10)
        })
      }
      const subject = await spec(foo);

      let fooing: any
      return new Promise(a => {
        fooing = subject(2, (msg: string) => {
          expect(msg).toBe('called')
          a()
        })
      }).then(() => fooing)
        .then(actual => {
          expect(actual).toBe(3)
          return spec.done()
        })
    })
  })

  incubator.duo('promise resolves to function', (title, spec) => {
    test(title, async () => {
      const subject = await spec(promiseChain.success)
      // not using `await` to make sure the return value is a promise.
      // `await` will hide the error if the return value is not a promise.
      return promise.increment(subject, 2)
        .then(async (actualFn: Function) => {
          expect(actualFn()).toBe(3)
          await spec.done()
        })
    })
  })
})

describe('class', () => {
  class Foo {
    constructor(public x: number) { }
    getValue() {
      return this.x
    }
  }

  class Boo extends Foo {
    getPlusOne() {
      return this.getValue() + 1
    }
  }

  incubator.duo('invoke declared method', (title, spec) => {
    test(title, async () => {
      const Subject = await spec(Foo)
      const instance = new Subject(1)
      expect(instance.getValue()).toBe(1)
      await spec.done()
    })
  })

  incubator.duo('invoke sub-class method', (title, spec) => {
    test(title, async () => {
      const Subject = await spec(Boo)

      const instance = new Subject(1)
      expect(instance.getPlusOne()).toBe(2)
      await spec.done()
    })
  })

  incubator.duo('invoke parent method', (title, spec) => {
    test(title, async () => {
      const Subject = await spec(Boo)

      const instance = new Subject(1)
      expect(instance.getValue()).toBe(1)
      await spec.done()
    })
  })

  incubator.duo('create multiple instances of the same class', (title, spec) => {
    test(title, async () => {
      const Subject = await spec(Foo)
      const f1 = new Subject(1)
      const f2 = new Subject(2)
      expect(f1.getValue()).toBe(1)
      expect(f2.getValue()).toBe(2)
      await spec.done()
    })
  })

  incubator.sequence('ok to use super/sub-class as long as behavior is the same', (title, specs) => {
    // It is ok to use diff
    test(title, async () => {
      const save = specs.save
      const bs = await save(Boo)
      const boo = new bs(2)
      expect(boo.getValue()).toBe(2)
      await save.done()

      const sim = specs.simulate
      const fs = await sim(Foo)
      const foo = new fs(2)
      expect(foo.getValue()).toBe(2)
      await sim.done()
    })
  })

  class WithCallback {
    callback(cb: (value: number) => void) {
      setImmediate(() => {
        cb(1)
      })
    }
    justDo(x: any) {
      return x
    }
  }
  incubator.duo('class method with callback', (title, spec) => {
    test(title, async () => {
      const s = await spec(WithCallback)
      const cb = new s()

      expect(cb.justDo(1)).toBe(1)
      expect(await new Promise(a => {
        let total = 0
        cb.callback(v => total += v)
        cb.callback(v => a(total + v))
      })).toBe(2)
      await spec.done()
    })
  })

  class Throwing {
    doThrow() {
      throw new Error('thrown')
    }
  }

  incubator.duo('invoke method throws', (title, spec) => {
    test(title, async () => {
      const Subject = await spec(Throwing)
      const foo = new Subject()
      a.throws(() => foo.doThrow(), e => e.message === 'thrown')
      await spec.done()
    })
  })

  class ResolvedPromise {
    increment(x: number) {
      return Promise.resolve(x + 1)
    }
  }

  class DelayedPromise {
    increment(x: number) {
      return new Promise(a => {
        setImmediate(() => a(x + 1))
      })
    }
  }
  incubator.duo('method return resolved promise', (title, spec) => {
    test(title, async () => {
      const Subject = await spec(ResolvedPromise)
      const p = new Subject()
      expect(await p.increment(3)).toBe(4)

      await spec.done()
    })
  })

  incubator.duo('method returns delayed promise', (title, spec) => {
    test(title, async () => {
      const Subject = await spec(DelayedPromise)
      const p = new Subject()
      expect(await p.increment(3)).toBe(4)

      await spec.done()
    })
  })

  incubator.duo('invoke method returns delayed promise multiple times', (title, spec) => {
    test(title, async () => {
      const Subject = await spec(DelayedPromise)
      const p = new Subject()
      expect(await Promise.all([p.increment(1), p.increment(3), p.increment(7)])).toEqual([2, 4, 8])

      await spec.done()
    })
  })

  class InvokeInternal {
    do() {
      return this.internal()
    }
    internal() {
      return 'data'
    }
  }

  incubator.duo('method invokes internal method', (title, spec) => {
    test(title, async () => {
      const Subject = await spec(InvokeInternal)
      const a = new Subject()
      expect(a.do()).toBe('data')

      await spec.done()
    })
  })

  class DelayedInvokeInternal {
    getDelayedInner(delay = 0) {
      return new Promise(a => {
        setTimeout(() => {
          a(this.inner())
        }, delay)
      })
    }
    inner() {
      return 'inner'
    }
  }
  incubator.duo('method delay invokes internal method', (title, spec) => {
    test(title, async () => {
      const Subject = await spec(DelayedInvokeInternal)
      const a = new Subject()
      expect(await a.getDelayedInner()).toBe('inner')
      expect(a.inner()).toBe('inner')

      await spec.done()
    })
  })

  class DIIThrow {
    getDelayedInner() {
      throw new Error('should not call')
    }
  }

  incubator.sequence('actual method is not invoked during simulation', (title, specs) => {
    test(title, async () => {
      const save = specs.save
      const Subject = await save(DelayedInvokeInternal)
      const dii = new Subject()

      expect(await dii.getDelayedInner()).toBe('inner')
      await save.done()

      const sim = specs.simulate
      const BadSubject = await sim(DIIThrow)
      const bad = new BadSubject()
      expect(await bad.getDelayedInner()).toBe('inner')
      await sim.done()
    })
  })

  class RejectLeak {
    reject(x: number) {
      return new Promise((_, r) => {
        setImmediate(() => r(x))
      })
    }
  }

  incubator.duo('runaway promise will not be leaked and break another test', (title, spec) => {
    test(`${title}: setup`, async () => {
      const MockRejector = await spec(RejectLeak)
      const e = new MockRejector()
      await a.throws(e.reject(300), v => v === 300)
      await spec.done()
    })
    test(`${title}: should not fail`, () => {
      return new Promise(a => setImmediate(() => a()))
    })
  })

  class WithCircular {
    value: any
    cirRef: WithCircular
    constructor() {
      this.cirRef = this
    }
  }

  class ClassWithCircular {
    channel: WithCircular
    constructor() {
      this.channel = new WithCircular()
    }
    exec(cmd: string, cb: Function) {
      this.channel.value = cmd
      cb(this.channel)
    }
  }

  incubator.duo('can use class with circular reference', (title, spec) => {
    test(title, async () => {
      const Subject = await spec(ClassWithCircular)
      const f = new Subject()

      let actual
      f.exec('echo', (data: any) => {
        actual = data.value
      })

      expect(actual).toBe('echo')
      await spec.done()
    })
  })

  incubator.duo('class with circular reference accessing', (title, spec) => {
    test(title, async () => {
      const Subject = await spec(ClassWithCircular)
      const f = new Subject()

      let actual
      f.exec('echo', (channel: WithCircular) => {
        actual = channel.cirRef.value
      })

      expect(actual).toBe('echo')
      await spec.done()
    })
  })

  class Channel {
    listeners: any[] = []
    stdio: any
    constructor() {
      this.stdio = this
    }
    on(listener: any) {
      this.listeners.push(listener)
    }
    emit(data: any) {
      this.listeners.forEach(l => l(data))
    }
  }

  class Ssh {
    channel: Channel
    constructor() {
      this.channel = new Channel()
    }
    exec(cmd: string, cb: Function) {
      cb(this.channel)
      this.channel.stdio.emit(cmd)
    }
  }

  // TODO: throws NotSupported error for callback with complex object.
  // This gives indication to the user that a plugin is need to support this subject
  // To fix this, I need to:
  // 1. get property key and value from object without invoking getter.
  // 2. Add GetAction SetAction back
  incubator.duo('callback with complex object', (title, spec) => {
    test.skip(title, async () => {
      const Subject = await spec(Ssh)
      const f = new Subject()

      let actual
      f.exec('echo', (channel: any) => channel.stdio.on((data: any) => actual = data))

      expect(actual).toBe('echo')
      await spec.done()
    })
  })

  incubator.duo('use composite callback function', (title, spec) => {
    test.skip(title, async () => {
      class Foo {
        on(compositeFn: any) {
          return this.internal(compositeFn)
        }
        internal(input: any) {
          expect(input.value).toBe('xyz')
          return input
        }
      }
      const fn = Object.assign(
        function () { return },
        {
          value: 'xyz'
        }
      )
      const s = await spec(Foo)
      const f = new s()
      const actual = f.on(fn)

      expect(actual.value).toBe('xyz')

      await spec.done()
    })
  })

  incubator.duo('class with property', (title, spec) => {
    class WithProperty {
      y = 1
      do(x: any) { return x }
    }
    test(title, async () => {
      const s = await spec(WithProperty)
      const p = new s()
      expect(p.do(2)).toBe(2)
      expect(p.y).toBe(1)
      p.y = 3
      expect(p.y).toBe(3)
      await spec.done()
    })
  })
})
