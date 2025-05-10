export interface Player {
  id: string;
  name: string;
  score: number;
  isJudge: boolean;
  isReady: boolean;
  cards: WhiteCard[];
}

export interface WhiteCard {
  id: string;
  text: string;
  deckId: string;
}

export interface BlackCard {
  id: string;
  text: string;
  deckId: string;
}

export interface PlayedCard {
  card: WhiteCard;
  playerId: string;
  playerName: string;
}

export interface Deck {
  id: string;
  name: string;
  description: string;
  isDefault: boolean;
  blackCards: BlackCard[];
  whiteCards: WhiteCard[];
}

export type GameStatus =
  | "waiting"
  | "playing"
  | "judging"
  | "roundEnd"
  | "gameEnd"
  | "finished";

export interface GameRoom {
  id: string;
  name: string;
  players: Player[];
  currentJudgeIndex: number;
  currentBlackCard: BlackCard | null;
  playedCards: PlayedCard[];
  whiteCardDeck: WhiteCard[];
  blackCardDeck: BlackCard[];
  round: number;
  maxRounds: number;
  targetScore: number;
  status: GameStatus;
  createdAt: string;
  winner: Player | null;
}

// Tipos para eventos do Socket.IO
export interface SocketEvents {
  // Eventos do cliente para o servidor
  createRoom: { name: string; playerName: string; targetScore: number };
  joinRoom: { roomId: string; playerName: string };
  leaveRoom: { roomId: string; playerId: string };
  startGame: { roomId: string };
  playCard: { roomId: string; playerId: string; card: WhiteCard };
  judgeCard: { roomId: string; playerId: string };

  // Eventos do servidor para o cliente
  roomCreated: GameRoom;
  roomUpdated: GameRoom;
  error: { message: string };
}
