import { Constructor } from '../../ts-goodies/dist'
import { EventEmitterMixin, IBaseEvents } from '../lib'

interface IMessageEvents extends IBaseEvents {
    error: (error: Error) => void
    message: (body: string, from: string) => void
}

class BaseEmitter {

    constructor () {
        console.log('Base constructor')
    }

}

class MessageEmitter extends EventEmitterMixin<IMessageEvents, Constructor<BaseEmitter>>(BaseEmitter) {

    test () {
        this.emit('message', 'Hi there!', 'no-reply@test.com')
        this.emit('message', 'Hi there!', 'ook')
        this.emit('error', new Error('Fake error'))
    }

}

const m = new MessageEmitter()

m.on('message', (body: string, from: string) => {
    console.log('Event:', body, from)
})

m.on('error', (e: Error) => {
    console.log(e.message)
})

m.test()
