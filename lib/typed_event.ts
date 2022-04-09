import { IBaseEvents } from './typed_event_emitter'

export interface ITypedEvent<E extends IBaseEvents = IBaseEvents> {
    confirm(result?: unknown): this
    readonly key: symbol
    readonly origin?: object
    readonly type: keyof E
}

export type TypedEventConfirmCallback<E extends IBaseEvents> = (p: {
    event: ITypedEvent<E>
    result?: unknown
}) => void

export interface ITypedEventOpts<E extends IBaseEvents> {
    confirmCallback?: TypedEventConfirmCallback<E>
    origin?: object
    type: keyof E
}

export class TypedEvent<E extends IBaseEvents> implements ITypedEvent<E> {

    readonly origin?: object

    readonly type: keyof E

    private confirmCallback?: TypedEventConfirmCallback<E>

    private isFinished = false

    constructor (p: ITypedEventOpts<E>) {
        p.confirmCallback && (this.confirmCallback = p.confirmCallback)
        this.origin = p.origin
        this.type = p.type
    }

    get key (): symbol {
        return ((this.constructor as unknown) as { key: symbol }).key
    }

    confirm (result?: unknown): this {
        if (!this.isFinished) {
            if (this.confirmCallback) {
                this.confirmCallback({
                    event: this,
                    result
                })
            }
            this.isFinished = true
        }
        return this
    }

    static get key (): symbol {
        return Symbol.for(this.name)
    }

}
