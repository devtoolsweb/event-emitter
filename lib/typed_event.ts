import { IBaseEvents } from './typed_event_emitter'

export interface ITypedEvent<E extends IBaseEvents = {}> {
  readonly key: symbol
  readonly origin?: object
  readonly type: keyof E
  confirm(result?: any): this
}

export type TypedEventConfirmCallback<E extends IBaseEvents = {}> = (p: {
  event: ITypedEvent<E>
  result?: any
}) => void

export interface ITypedEventOpts<E extends IBaseEvents = {}> {
  confirmCallback?: TypedEventConfirmCallback<E>
    origin?: object
  type: keyof E
}

export interface ITypedEventConstructor<
  P extends ITypedEventOpts = ITypedEventOpts
> {
  new (p: P): ITypedEvent
}

export class TypedEvent<E extends IBaseEvents = {}>
  implements ITypedEvent<E> {
  readonly origin?: object
  readonly type: keyof E

  private confirmCallback?: TypedEventConfirmCallback<E>
  private isFinished: boolean = false

  constructor (p: ITypedEventOpts<E>) {
    this.confirmCallback = p.confirmCallback
    this.origin = p.origin
    this.type = p.type
  }

  get key (): symbol {
    return (this.constructor as any).key
  }

  static get key (): symbol {
    return Symbol.for(this.name)
  }

  confirm (result?: any): this {
    if (!this.isFinished) {
      if (this.confirmCallback) {
        this.confirmCallback({ event: this, result })
      }
      this.isFinished = true
    }
    return this
  }
}
