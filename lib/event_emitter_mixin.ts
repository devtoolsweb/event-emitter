import { EventEmitArgs, EventKeyType, IBaseEvents, ITypedEventEmitter } from './typed_event_emitter'

export type EventEmitterConstructor<T = {}> = new (...args: any[]) => T

type EventListeners = Map<Function, number>

type EmitterCallbackMap = Map<EventKeyType, EventListeners>

const callbackMap = new Map<ITypedEventEmitter, EmitterCallbackMap>()

const getEventListeners = (emitter: ITypedEventEmitter, key: EventKeyType) => {
  const cm = callbackMap.get(emitter)
  return cm ? cm.get(key) : null
}

const eventSentinels = new Set<ITypedEventEmitter>()

export interface IGlobalEventEmitterOpts {
  debug?: boolean
}

const globalOpts: IGlobalEventEmitterOpts = {
  debug: false
}

export const setGlobalEventEmitterOpts = (opts: IGlobalEventEmitterOpts) => {
  globalOpts.debug = !!opts.debug
}

export function EventEmitterMixin<
  Events extends IBaseEvents,
  TBase extends EventEmitterConstructor
>(Base: TBase): TBase & EventEmitterConstructor<ITypedEventEmitter<Events>> {
  return class MixedEventEmitter extends Base implements ITypedEventEmitter<Events> {
    static readonly activeEventEmitters = new Set<object>()

    addListener<E extends keyof Events>(event: E, listener: Events[E], counter: number = Infinity) {
      if (!(listener instanceof Function)) {
        throw new Error('Event listener must be a function')
      }
      let cm = callbackMap.get(this)
      if (!cm) {
        cm = new Map<EventKeyType, EventListeners>()
        callbackMap.set(this, cm)
      }
      const eventKey = event as EventKeyType
      let xs = cm.get(eventKey)
      if (!xs) {
        xs = new Map<Function, number>()
        cm.set(eventKey, xs)
      }
      xs.set(listener, counter)
      return this
    }

    emit<E extends keyof Events>(event: E, ...args: EventEmitArgs<Events[E]>) {
      if (eventSentinels.has(this)) {
        if (globalOpts.debug) {
          console.warn('The emitter is already processing the event:', this)
        }
      } else {
        eventSentinels.add(this)
        const xs = getEventListeners(this, event as EventKeyType)
        if (xs) {
          for (const [fn, counter] of xs) {
            fn.apply(null, args)
            const n = counter - 1
            if (n) {
              xs.set(fn, n)
            } else {
              this.removeListener(event, fn as any)
            }
          }
        }
        eventSentinels.delete(this)
      }
      return false
    }

    eventNames() {
      let cm = callbackMap.get(this)
      return cm ? Array.from(cm.keys()) : []
    }

    listenerCount<E extends keyof Events>(event: E) {
      const xs = getEventListeners(this, event as EventKeyType)
      return xs ? xs.size : 0
    }

    listeners<E extends keyof Events>(event: E) {
      const xs = getEventListeners(this, event as EventKeyType)
      return xs ? Array.from(xs.keys()) : []
    }

    off<E extends keyof Events>(event: E, listener: Events[E]) {
      return this.removeListener(event, listener)
    }

    on<E extends keyof Events>(event: E, listener: Events[E]) {
      return this.addListener(event, listener)
    }

    once<E extends keyof Events>(event: E, listener: Events[E]) {
      return this.addListener(event, listener, 1)
    }

    removeAllListeners<E extends keyof Events>(event?: E) {
      if (event) {
        const xs = callbackMap.get(this)
        if (xs) {
          xs.delete(event as EventKeyType)
        }
      } else {
        callbackMap.delete(this)
      }
      return this
    }

    removeListener<E extends keyof Events>(event: E, listener: Events[E]) {
      const xs = getEventListeners(this, event as EventKeyType)
      if (!xs || !xs.has(listener as any)) {
        throw new Error(`Listeners for event '${event}' not registered`)
      }
      return this
    }
  }
}
