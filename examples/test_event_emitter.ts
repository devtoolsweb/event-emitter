import { Constructor } from '../../ts-goodies/dist'
import { EventEmitterMixin, IBaseEvents } from '../lib'

interface IMessageEvents extends IBaseEvents {
  error: (error: Error) => void
  message: (body: string, from: string) => void
}

class BaseEmitter {
  constructor() {
    console.log('Base constructor')
  }
}

class MessageEmitter extends EventEmitterMixin<IMessageEvents, Constructor<BaseEmitter>>(
  BaseEmitter
) {}

const m = new MessageEmitter()

m.on('message', (body: string, from: string) => {
  console.log('Event:', body, from)
})

m.emit('message', 'Hi there!', 'no-reply@test.com')
m.emit('message', 'Hi there!', 'ook')
