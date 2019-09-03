import { Omit } from 'type-plus';
import { SpecContext } from '../context';
import { assertMockable } from './assertMockable';
import { createSpyRecord, SpyRecord } from './createSpyRecord';
import { findPlugin } from './findPlugin';
import { logCreateSpy, logInvokeAction, logReturnAction, logThrowAction } from './logs';
import { ActionId, DeclareOptions, InvokeAction, ReferenceId, ReturnAction, Spec, SpecOptions, SpyContext, SpyInvokeOptions, SpyOptions, SpyRecorder, ThrowAction } from './types';

export async function createSaveSpec(context: SpecContext, id: string, options: SpecOptions): Promise<Spec> {

  const record = createSpyRecord(options)

  return {
    mock: subject => {
      assertMockable(subject)
      return getSpy(record, subject, { mode: 'passive' })!
    },
    async done() {
      record.end()
      const sr = record.getSpecRecord()
      context.io.writeSpec(id, sr)
    }
  }
}

function getSpy<S>(record: SpyRecord, subject: S, options: SpyOptions): S {
  const spy = record.findTestDouble(subject)
  if (spy) return spy

  return createSpy(record, subject, options) || subject
}

function createSpy<S>(record: SpyRecord, subject: S, options: SpyOptions): S | undefined {
  const plugin = findPlugin(subject)
  if (!plugin) return undefined

  const context = createSpyContext<S>(record, plugin.name, subject, options)
  return plugin.createSpy(context, subject)
}

/**
 * SpyContext is used by plugin.createSpy().
 */
function createSpyContext<S>(record: SpyRecord, plugin: string, subject: S, options: SpyOptions): SpyContext<S> {
  return {
    declare: (spy: S, declareOptions?: DeclareOptions) => createSpyRecorder<S>({ record, plugin, options }, subject, spy, declareOptions),
    getSpy: <A>(subject: A, options: SpyOptions) => getSpy<A>(record, subject, options)
  }
}

function createSpyRecorder<S>(
  { record, plugin, options: { mode } }: { record: SpyRecord, plugin: string, options: SpyOptions },
  subject: S,
  spy: S,
  declareOptions: DeclareOptions = {}
): SpyRecorder<S> {
  const ref = record.addRef({ plugin, subject, testDouble: spy, mode, meta: declareOptions.meta })

  logCreateSpy({ plugin, ref }, subject)

  return {
    spy,
    invoke: (args: any[], options?: SpyInvokeOptions) => createInvocationRecorder({ record, plugin }, ref, args, options),
  }
}

function createInvocationRecorder(
  { record, plugin }: { record: SpyRecord, plugin: string },
  ref: ReferenceId,
  args: any[],
  options: SpyInvokeOptions = {}
) {
  const reference = record.getRef(ref)
  const action: Omit<InvokeAction, 'tick'> = { type: 'invoke', ref, mode: options.mode || reference.mode } as any
  const id = record.addAction(action)
  // TODO: seems like I can transform the argas directly above, because the reference of the invoking subject has already been created,
  // and declare is no longer an action.
  action.payload = options.transform ? args.map(options.transform) : args

  logInvokeAction({ record, plugin, ref }, id, args)

  return {
    returns: (value: any, options?: SpyInvokeOptions) => expressionReturns({ record, plugin, ref, id }, value, options),
    throws: (err: any, options?: SpyInvokeOptions) => expressionThrows({ record, plugin, ref, id }, err, options)
  }
}

function expressionReturns(
  { record, plugin, ref, id }: { record: SpyRecord, plugin: string, ref: ReferenceId, id: ActionId },
  value: any,
  options: SpyInvokeOptions = {}
) {
  const result = options.transform ? options.transform(value) : value
  const action: Omit<ReturnAction, 'tick'> = {
    type: 'return',
    ref: id,
    payload: record.findRefId(result) || value
  }
  const returnId = record.addAction(action)
  logReturnAction({ plugin, ref }, id, returnId, value)
  return result
}

function expressionThrows(
  { record, plugin, ref, id }: { record: SpyRecord, plugin: string, ref: ReferenceId, id: ActionId },
  value: any,
  options: SpyInvokeOptions = {}
) {
  const result = options.transform ? options.transform(value) : value
  const action: Omit<ThrowAction, 'tick'> = {
    type: 'throw',
    ref: id,
    payload: record.findRefId(result) || value
  }
  const throwId = record.addAction(action)
  logThrowAction({ plugin, ref }, id, throwId, value)
  return result
}
