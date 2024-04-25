type Callback = (...args: any) => any
type EventsMap = Record<string, Callback>

export class EventEmitter<Events extends EventsMap = EventsMap> {
  callbacks = new Map<keyof Events, Callback[]>()

  on<EventName extends keyof Events>(event: EventName, callback: Events[EventName]) {
    if (typeof callback !== 'function') {
      throw TypeError('Callback parameter has to be a function.')
    }

    if (!this.callbacks.has(event)) {
      this.callbacks.set(event, [])
    }

    const e = this.callbacks.get(event)
    e?.push(callback)
  }

  async emit<EventName extends keyof Events>(event: EventName, data: Parameters<Events[EventName]>[0]) {
    for (const cb of this.callbacks.get(event) || []) {
      await cb(data)
    }
  }
}
