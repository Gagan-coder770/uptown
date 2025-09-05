export enum RoomType {
  LOBBY = 'lobby',
  PUBLIC = 'uptown',
  CUSTOM = 'custom',
  TICTACTOE = 'tictactoe',
}

export interface IRoomData {
  name: string
  description: string
  password: string | null
  autoDispose: boolean
}
