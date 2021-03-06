/*
 * WARNING: Do not use event sentinels. Instead, you need to think
 * through the handling of each event correctly.
 */
import { Constructor } from 'type-fest'
import { EventEmitArgs, EventKeyType, EventListener, IBaseEvents, ITypedEventEmitter } from './typed_event_emitter'

type EventListeners = Map<EventListener, number>

type EmitterCallbackMap = Map<EventKeyType, EventListeners>

const callbackMap = new Map<ITypedEventEmitter, EmitterCallbackMap>()

const getEventListeners = (emitter: ITypedEventEmitter, key: EventKeyType) => {
    const cm = callbackMap.get(emitter)
    return cm ? cm.get(key) : null
}

export interface IGlobalEventEmitterArgs {
    debug?: boolean
}

const globalArgs: IGlobalEventEmitterArgs = { debug: false }

export const setGlobalEventEmitterArgs = (opts: IGlobalEventEmitterArgs) => {
    globalArgs.debug = !!opts.debug
}

export function EventEmitterMixin<
    Events extends IBaseEvents,
    TBase extends Constructor<object>
> (Base: TBase): TBase & Constructor<ITypedEventEmitter<Events>> {
    return class MixedEventEmitter extends Base
        implements ITypedEventEmitter<Events> {

        static readonly activeEventEmitters = new Set<object>()

        addListener<E extends keyof Events> (
            event: E,
            listener: Events[E],
            counter = Infinity
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
            xs.set((listener as unknown) as EventListener, counter)
            return this
        }

        emit<E extends keyof Events> (event: E, ...args: EventEmitArgs<Events[E]>) {
            const xs = getEventListeners(this, event as EventKeyType)
            if (xs) {
                for (const [ fn,
                    counter ] of xs) {
                    fn(...args)
                    const n = counter - 1
                    if (n) {
                        xs.set(fn, n)
                    }
                    else {
                        this.removeListener(event, (fn as unknown) as Events[E])
                    }
                }
            }
            return false
        }

        eventNames () {
            const cm = callbackMap.get(this)
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

        removeAllListeners<E extends keyof Events> (event?: E) {
            if (event) {
                const xs = callbackMap.get(this)
                if (xs) {
                    xs.delete(event as EventKeyType)
                }
            }
            else {
                callbackMap.delete(this)
            }
            return this
        }

        removeListener<E extends keyof Events> (event: E, listener: Events[E]) {
            const xs = getEventListeners(this, event as EventKeyType)
            if (!xs || !xs.has((listener as unknown) as EventListener)) {
                throw new Error(`Listeners for event '${event.toString()}' not registered`)
            }
            return this
        }

    }
}
