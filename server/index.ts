import http from 'http'
import express from 'express'
import cors from 'cors'
import { Server, LobbyRoom } from 'colyseus'
import { monitor } from '@colyseus/monitor'
import { RoomType } from '../types/Rooms'
import { UptownRoom } from './rooms/SkyOffice'
import { TicTacToeRoom } from './rooms/TicTacToeRoom';

const port = Number(process.env.PORT || 2567)
const app = express()

app.use(cors())
app.use(express.json())

// ✅ Serve frontend from Vite build output
app.use(express.static('dist'))

const server = http.createServer(app)
const gameServer = new Server({
  server,
})

// register room handlers
gameServer.define(RoomType.LOBBY, LobbyRoom)
gameServer.define(RoomType.PUBLIC, UptownRoom, {
  name: 'Public Lobby',
  description: 'For making friends and familiarizing yourself with the controls',
  password: null,
  autoDispose: false,
})
gameServer.define(RoomType.CUSTOM, UptownRoom).enableRealtimeListing()
gameServer.define('tictactoe', TicTacToeRoom);

// register Colyseus monitor
app.use('/colyseus', monitor())

// ✅ Fallback to index.html for SPA routing (important!)
app.get('*', (_req, res) => {
  res.sendFile('index.html', { root: 'dist' });
})

gameServer.listen(port)
console.log(`✅ Server running at http://localhost:${port}`)
