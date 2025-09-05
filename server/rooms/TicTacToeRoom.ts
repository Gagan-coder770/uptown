import { Room, Client } from "colyseus";
import { Schema, type, ArraySchema } from "@colyseus/schema";

class TicTacToeState extends Schema {
  @type(["string"])
  board = new ArraySchema<string | null>(...Array(9).fill(null));
  @type("string")
  currentPlayer: string = "X";
  @type(["string"])
  players = new ArraySchema<string>();
  @type("string")
  winner: string | null = null;
}

export class TicTacToeRoom extends Room<TicTacToeState> {
  maxClients = 2;

  onCreate() {
    this.setState(new TicTacToeState());
    this.onMessage("move", (client, idx: number) => {
      const { board, currentPlayer, winner } = this.state;
      if (winner || board[idx]) return;
      board[idx] = currentPlayer;
      this.state.currentPlayer = currentPlayer === "X" ? "O" : "X";
      this.state.winner = this.calculateWinner(board);
    });
  }

  onJoin(client: Client) {
    if (this.state.players.length < 2) {
      this.state.players.push(client.sessionId);
    }
  }

  onLeave(client: Client) {
    const idx = this.state.players.indexOf(client.sessionId);
    if (idx !== -1) this.state.players.splice(idx, 1);
  }

  calculateWinner(board: ArraySchema<string | null>) {
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];
    for (let line of lines) {
      const [a, b, c] = line;
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return board[a];
      }
    }
    return null;
  }
}
