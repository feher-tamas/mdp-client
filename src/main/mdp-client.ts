import { Request } from 'zeromq'

export class MDPClient {
  private socket: Request
  private queue: string[][] = []
  private max: number
  private sending = false
  private isConnected = false
  private brokerAddress: string
  private MDP_CLIENT_HEADER = 'MDPC01'
  private handleConnectEvent: (isConnected: boolean) => void = () => {}
  private handleAnswerArrivedEvent: (multipartMessage: string[], data: string) => void = () => {}
  constructor(max = 10, brokerAddress: string, routingId: string) {
    this.brokerAddress = brokerAddress
    this.socket = new Request({ routingId: routingId })
    this.max = max
  }
  on(handleConnectEvent: (isConnected: boolean) => void): void {
    this.handleConnectEvent = handleConnectEvent
  }
  tryConnect(): void {
    this.socket.connect(this.brokerAddress)
    this.socket.events.on('connect:retry', () => {
      this.isConnected = false
      this.handleConnectEvent(false)
    })
    this.socket.events.on('connect', () => {
      this.isConnected = true
      this.handleConnectEvent(true)
    })
    this.socket.events.on('disconnect', () => {
      this.isConnected = false
      this.handleConnectEvent(false)
    })
  }

  tryDisConnect(): void {
    this.socket.disconnect(this.brokerAddress)
    this.socket.close()
  }
  onResponseArrived(callback: (request: string[], data: string) => void): void {
    this.handleAnswerArrivedEvent = callback
  }
  send(servicename: string, request: string): void {
    if (!this.isConnected) {
      return
    }
    if (this.queue.length > this.max) {
      throw new Error('Queue is full')
    }
    this.queue.push([this.MDP_CLIENT_HEADER, servicename, request])
    this.trySend()
  }

  async trySend(): Promise<void> {
    if (this.sending) {
      return
    }
    this.sending = true

    while (this.queue.length) {
      const multipartMessage = this.queue.shift()
      if (!multipartMessage) {
        return
      }
      await this.socket.send(multipartMessage)
      const [...res] = await this.socket.receive()
      this.handleAnswerArrivedEvent(multipartMessage, res[2].toString())
    }
    this.sending = false
  }
}
