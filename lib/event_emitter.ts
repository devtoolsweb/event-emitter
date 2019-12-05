/**
 * Type-safe event emitter.
 * Interface declaration borrowed from:
 * https://github.com/andywer/typed-emitter
 */
export type EventEmitArgs<T> = [T] extends [(...args: infer U) => any]
  ? U
  : [T] extends [void]
  ? []
  : [T]

export type EventListener = (...args: any[]) => any

export interface IEventsBase {}

export type EventKeyType = string | symbol

export interface IEventEmitter<Events extends IEventsBase = {}> {
  addListener<E extends keyof Events>(event: E, listener: Events[E]): this
  emit<E extends keyof Events>(
    event: E,
    ...args: EventEmitArgs<Events[E]>
  ): boolean
  eventNames(): EventKeyType[]
  listenerCount<E extends keyof Events>(event: E): number
  listeners<E extends keyof Events>(event: E): Function[]
  off<E extends keyof Events>(event: E, listener: Events[E]): this
  on<E extends keyof Events>(event: E, listener: Events[E]): this
  once<E extends keyof Events>(event: E, listener: Events[E]): this
  removeAllListeners<E extends keyof Events>(event: E): this
  removeListener<E extends keyof Events>(event: E, listener: Events[E]): this
}
