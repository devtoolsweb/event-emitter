import { EventEmitterMixin, IEventsBase } from '../lib'

interface IMessageEvents extends IEventsBase {
  error: (error: Error) => void
  message: (body: string, from: string) => void
}

class BaseEmitter {
  constructor () {
    console.log('Base constructor')
  }
}

class MessageEmitter extends EventEmitterMixin<IMessageEvents>(BaseEmitter) {}

const m = new MessageEmitter()

m.on('message', (body: string, from: string) => {
  console.log('Event:', body, from)
})

m.emit('message', 'Hi there!', 'no-reply@test.com')
m.emit('message', 'Hi there!', 'ook')
