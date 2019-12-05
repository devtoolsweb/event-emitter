import {
  EventEmitArgs,
  EventKeyType,
  EventListener,
  IEventEmitter,
  IEventsBase
} from './event_emitter'

export type EventEmitterConstructor<T = object> = new (...args: any[]) => T

type EventListeners = Map<Function, number>

type EmitterCallbackMap = Map<EventKeyType, EventListeners>

const callbackMap = new Map<IEventEmitter, EmitterCallbackMap>()

const getEventListeners = (emitter: IEventEmitter, key: EventKeyType) => {
  const cm = callbackMap.get(emitter)
  return cm ? cm.get(key) : null
}

export function EventEmitterMixin<
  Events extends IEventsBase,
  TBase extends EventEmitterConstructor
> (Base: TBase) {
  return class EventEmitter extends Base implements IEventEmitter<Events> {
    static readonly activeEventEmitters = new Set<object>()

    addListener<E extends keyof Events> (
      event: E,
      listener: Events[E],
      counter: number = Infinity
    ) {
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
        xs = new Map<EventListener, number>()
        cm.set(eventKey, xs)
      }
      xs.set(listener, counter)
      return this
    }

    emit<E extends keyof Events> (event: E, ...args: EventEmitArgs<Events[E]>) {
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
      return false
    }

    eventNames () {
      let cm = callbackMap.get(this)
      return cm ? Array.from(cm.keys()) : []
    }

    listenerCount<E extends keyof Events> (event: E) {
      const xs = getEventListeners(this, event as EventKeyType)
      return xs ? xs.size : 0
    }

    listeners<E extends keyof Events> (event: E) {
      const xs = getEventListeners(this, event as EventKeyType)
      return xs ? Array.from(xs.keys()) : []
    }

    off<E extends keyof Events> (event: E, listener: Events[E]) {
      return this.removeListener(event, listener)
    }

    on<E extends keyof Events> (event: E, listener: Events[E]) {
      return this.addListener(event, listener)
    }

    once<E extends keyof Events> (event: E, listener: Events[E]) {
      return this.addListener(event, listener, 1)
    }

    removeAllListeners<E extends keyof Events> (event: E) {
      callbackMap.delete(this)
      return this
    }

    removeListener<E extends keyof Events> (event: E, listener: Events[E]) {
      const xs = getEventListeners(this, event as EventKeyType)
      if (!xs || !xs.has(listener as any)) {
        throw new Error(`Listeners for event '${event}' not registered`)
      }
      return this
    }
  }
}
