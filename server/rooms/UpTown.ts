import bcrypt from 'bcrypt'
import { Room, Client, ServerError } from 'colyseus'
import { Dispatcher } from '@colyseus/command'
import { Player, OfficeState, Computer, Whiteboard, whiteboardRoomIds } from './schema/OfficeState'
import { Message } from '../../types/Messages'
import { IRoomData } from '../../types/Rooms'
import PlayerUpdateCommand from './commands/PlayerUpdateCommand'
import PlayerUpdateNameCommand from './commands/PlayerUpdateNameCommand'
import {
  ComputerAddUserCommand,
  ComputerRemoveUserCommand,
} from './commands/ComputerUpdateArrayCommand'
import {
  WhiteboardAddUserCommand,
  WhiteboardRemoveUserCommand,
} from './commands/WhiteboardUpdateArrayCommand'
import ChatMessageUpdateCommand from './commands/ChatMessageUpdateCommand'



export class UpTown extends Room<OfficeState> {
  private dispatcher = new Dispatcher(this)
  private name!: string
  private description!: string
  private password: string | null = null

  async onCreate(options: IRoomData) {
    const { name, description, password, autoDispose } = options
    this.name = name
    this.description = description
    this.autoDispose = autoDispose

    const hasPassword = !!password
    if (hasPassword) {
      const salt = await bcrypt.genSalt(10)
      this.password = await bcrypt.hash(password!, salt)
    }

    this.setMetadata({ name, description, hasPassword })
    this.setState(new OfficeState())

    // Add 5 computers
    for (let i = 0; i < 5; i++) {
      this.state.computers.set(String(i), new Computer())
    }

    // Add 3 whiteboards
    for (let i = 0; i < 3; i++) {
      this.state.whiteboards.set(String(i), new Whiteboard())
    }

    // ----------------- Message Handlers -----------------

    this.onMessage(Message.CONNECT_TO_COMPUTER, (client, { computerId }) => {
      this.dispatcher.dispatch(new ComputerAddUserCommand(), { client, computerId })
    })

    this.onMessage(Message.DISCONNECT_FROM_COMPUTER, (client, { computerId }) => {
      this.dispatcher.dispatch(new ComputerRemoveUserCommand(), { client, computerId })
    })

    this.onMessage(Message.STOP_SCREEN_SHARE, (client, { computerId }) => {
      const computer = this.state.computers.get(computerId)
      if (computer) {
        computer.connectedUser.forEach((id) => {
          const targetClient = this.clients.find((cli) => cli.sessionId === id && cli.sessionId !== client.sessionId)
          targetClient?.send(Message.STOP_SCREEN_SHARE, client.sessionId)
        })
      }
    })

    this.onMessage(Message.CONNECT_TO_WHITEBOARD, (client, { whiteboardId }) => {
      this.dispatcher.dispatch(new WhiteboardAddUserCommand(), { client, whiteboardId })
    })

    this.onMessage(Message.DISCONNECT_FROM_WHITEBOARD, (client, { whiteboardId }) => {
      this.dispatcher.dispatch(new WhiteboardRemoveUserCommand(), { client, whiteboardId })
    })

    this.onMessage(Message.UPDATE_PLAYER, (client, { x, y, anim }) => {
      this.dispatcher.dispatch(new PlayerUpdateCommand(), { client, x, y, anim })
    })

    this.onMessage(Message.UPDATE_PLAYER_NAME, (client, { name }) => {
      this.dispatcher.dispatch(new PlayerUpdateNameCommand(), { client, name })
    })

    this.onMessage(Message.READY_TO_CONNECT, (client) => {
      const player = this.state.players.get(client.sessionId)
      if (player) player.readyToConnect = true
    })

    this.onMessage(Message.VIDEO_CONNECTED, (client) => {
      const player = this.state.players.get(client.sessionId)
      if (player) player.videoConnected = true
    })

    this.onMessage(Message.DISCONNECT_STREAM, (client, { clientId }) => {
      const targetClient = this.clients.find((cli) => cli.sessionId === clientId)
      targetClient?.send(Message.DISCONNECT_STREAM, client.sessionId)
    })

    this.onMessage(Message.ADD_CHAT_MESSAGE, (client, { content }) => {
      this.dispatcher.dispatch(new ChatMessageUpdateCommand(), { client, content })

      this.broadcast(
        Message.ADD_CHAT_MESSAGE,
        { clientId: client.sessionId, content },
        { except: client }
      )
    })
  }

  async onAuth(client: Client, options: { password: string | null }) {
    if (this.password) {
      if (!options.password || typeof options.password !== 'string') {
        throw new ServerError(403, 'Password is required!')
      }
      const validPassword = await bcrypt.compare(options.password, this.password)
      if (!validPassword) {
        throw new ServerError(403, 'Password is incorrect!')
      }
    }
    return true
  }

  onJoin(client: Client) {
    this.state.players.set(client.sessionId, new Player())
    client.send(Message.SEND_ROOM_DATA, {
      id: this.roomId,
      name: this.name,
      description: this.description,
    })
  }

  onLeave(client: Client) {
    this.state.players.delete(client.sessionId)

    this.state.computers.forEach((computer) => {
      computer.connectedUser.delete(client.sessionId)
    })

    this.state.whiteboards.forEach((whiteboard) => {
      whiteboard.connectedUser.delete(client.sessionId)
    })
  }

  onDispose() {
    this.state.whiteboards.forEach((whiteboard) => {
      whiteboardRoomIds.delete(whiteboard.roomId)
    })

    console.log(`Room ${this.roomId} disposing...`)
    this.dispatcher.stop()
  }
}
