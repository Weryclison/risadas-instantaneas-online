import { Server } from "socket.io";
import { createServer } from "http";
import express from "express";
import cors from "cors";
import { GameRoom, Player, WhiteCard, BlackCard } from "./types/game";
import { defaultDecks } from "./data/decks";

const app = express();
app.use(cors());
app.use(express.json());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173", // URL do seu frontend
    methods: ["GET", "POST"],
  },
});

// Armazenamento em memória (em produção, use um banco de dados)
const rooms: Record<string, GameRoom> = {};
// Armazenamento para registrar a última atividade nas salas
const roomLastActivity: Record<string, number> = {};
// Tempo limite de inatividade (1 hora em milissegundos)
const ROOM_INACTIVITY_TIMEOUT = 60 * 60 * 1000; // 1 hora

// Função para criar um novo jogador
const createPlayer = (name: string, isJudge: boolean = false): Player => ({
  id: Math.random().toString(36).substr(2, 9),
  name,
  score: 0,
  isJudge,
  isReady: true,
  cards: [],
});

// Função para criar uma nova sala
const createRoom = (
  name: string,
  playerName: string,
  targetScore: number = 8
): GameRoom => {
  const roomId = Math.random().toString(36).substr(2, 6);
  const player = createPlayer(playerName, true);

  // Combine all decks for this prototype
  let allWhiteCards: WhiteCard[] = [];
  let allBlackCards: BlackCard[] = [];

  defaultDecks.forEach((deck) => {
    allWhiteCards = [...allWhiteCards, ...deck.whiteCards];
    allBlackCards = [...allBlackCards, ...deck.blackCards];
  });

  // Shuffle cards
  const shuffledWhiteCards = [...allWhiteCards].sort(() => Math.random() - 0.5);
  const shuffledBlackCards = [...allBlackCards].sort(() => Math.random() - 0.5);

  const room: GameRoom = {
    id: roomId,
    name: name || `Sala de ${playerName}`,
    players: [player],
    currentJudgeIndex: 0,
    currentBlackCard: null,
    playedCards: [],
    whiteCardDeck: shuffledWhiteCards,
    blackCardDeck: shuffledBlackCards,
    round: 0,
    maxRounds: 10,
    targetScore: targetScore,
    status: "waiting",
    createdAt: new Date().toISOString(),
    winner: null,
  };

  rooms[roomId] = room;
  // Registrar a atividade inicial da sala
  updateRoomActivity(roomId);
  return room;
};

// Função para atualizar o timestamp de última atividade da sala
const updateRoomActivity = (roomId: string): void => {
  roomLastActivity[roomId] = Date.now();
};

// Função para verificar e remover salas inativas
const checkInactiveRooms = (): void => {
  const now = Date.now();
  Object.keys(rooms).forEach((roomId) => {
    const lastActivity = roomLastActivity[roomId] || 0;
    const timeSinceLastActivity = now - lastActivity;

    if (timeSinceLastActivity >= ROOM_INACTIVITY_TIMEOUT) {
      console.log(
        `Sala ${roomId} removida por inatividade (${
          timeSinceLastActivity / 1000 / 60
        } minutos)`
      );

      // Notifica os jogadores antes de remover a sala
      if (rooms[roomId]) {
        io.to(roomId).emit("roomClosed", {
          message:
            "Esta sala foi fechada devido à inatividade por mais de 1 hora.",
        });
      }

      // Remove a sala
      delete rooms[roomId];
      delete roomLastActivity[roomId];
    }
  });
};

// Verificar salas inativas a cada 15 minutos
setInterval(checkInactiveRooms, 15 * 60 * 1000);

// Função para distribuir cartas
const dealCards = (room: GameRoom) => {
  const updatedRoom = { ...room };

  // Deal 7 cards to each player
  updatedRoom.players = updatedRoom.players.map((player) => {
    const cards = updatedRoom.whiteCardDeck.splice(0, 7);
    return { ...player, cards };
  });

  // Select first black card
  updatedRoom.currentBlackCard = updatedRoom.blackCardDeck.shift() || null;
  updatedRoom.round = 1;
  updatedRoom.status = "playing";

  return updatedRoom;
};

// Eventos do Socket.IO
io.on("connection", (socket) => {
  console.log("Novo cliente conectado:", socket.id);

  // Criar uma nova sala
  socket.on("createRoom", ({ name, playerName, targetScore }) => {
    const room = createRoom(name, playerName, targetScore);
    socket.join(room.id);
    socket.emit("roomCreated", room);
    io.to(room.id).emit("roomUpdated", room);
    // A função createRoom já registra a atividade inicial
  });

  // Entrar em uma sala existente
  socket.on("joinRoom", ({ roomId, playerName }) => {
    const room = rooms[roomId];
    if (!room) {
      socket.emit("error", { message: "Sala não encontrada" });
      return;
    }

    if (room.players.length >= 5) {
      socket.emit("error", { message: "Sala cheia" });
      return;
    }

    const player = createPlayer(playerName);
    room.players.push(player);
    socket.join(roomId);
    updateRoomActivity(roomId); // Registra atividade na sala
    io.to(roomId).emit("roomUpdated", room);
  });

  // Iniciar o jogo
  socket.on("startGame", ({ roomId }) => {
    const room = rooms[roomId];
    if (!room || room.players.length < 3) {
      socket.emit("error", { message: "Não é possível iniciar o jogo" });
      return;
    }

    // Resetar pontuações e status do jogo
    room.players = room.players.map((player) => ({
      ...player,
      score: 0, // Resetar pontuação para zero
    }));
    room.winner = null; // Limpar o vencedor anterior

    const updatedRoom = dealCards(room);
    rooms[roomId] = updatedRoom;
    updateRoomActivity(roomId); // Registra atividade na sala
    io.to(roomId).emit("roomUpdated", updatedRoom);
  });

  // Jogar uma carta
  socket.on("playCard", ({ roomId, playerId, card }) => {
    const room = rooms[roomId];
    if (!room || room.status !== "playing") return;

    const player = room.players.find((p) => p.id === playerId);
    if (!player || player.isJudge) return;

    // Remove a carta da mão do jogador
    player.cards = player.cards.filter((c) => c.id !== card.id);

    // Adiciona a carta jogada
    room.playedCards.push({
      card,
      playerId,
      playerName: player.name,
    });

    // Verifica se todos jogaram
    if (room.playedCards.length === room.players.length - 1) {
      room.status = "judging";
    }

    rooms[roomId] = room;
    updateRoomActivity(roomId); // Registra atividade na sala
    io.to(roomId).emit("roomUpdated", room);
  });

  // Juiz escolhe uma carta
  socket.on("judgeCard", ({ roomId, playerId }) => {
    const room = rooms[roomId];
    if (!room || room.status !== "judging") return;

    const judge = room.players.find((p) => p.isJudge);
    if (!judge || judge.id !== playerId) return;

    // Encontra o jogador vencedor
    const winningPlayer = room.players.find(
      (p) => p.id === room.playedCards[0].playerId
    );
    if (winningPlayer) {
      winningPlayer.score += 1;
    }

    // Prepara para a próxima rodada
    room.status = "waiting";
    room.playedCards = [];
    room.currentJudgeIndex = (room.currentJudgeIndex + 1) % room.players.length;
    room.players.forEach((p, index) => {
      p.isJudge = index === room.currentJudgeIndex;
    });

    // Verificar se algum jogador atingiu a pontuação alvo
    const maxScore = Math.max(...room.players.map((p) => p.score));
    if (maxScore >= room.targetScore) {
      room.status = "finished";
      room.winner = room.players.find((p) => p.score === maxScore) || null;
    } else {
      room.round += 1;
    }

    rooms[roomId] = room;
    updateRoomActivity(roomId); // Registra atividade na sala
    io.to(roomId).emit("roomUpdated", room);
  });

  // Sair da sala
  socket.on("leaveRoom", ({ roomId, playerId }) => {
    const room = rooms[roomId];
    if (!room) return;

    room.players = room.players.filter((p) => p.id !== playerId);
    if (room.players.length === 0) {
      delete rooms[roomId];
      delete roomLastActivity[roomId]; // Remove também o registro de atividade
    } else {
      rooms[roomId] = room;
      updateRoomActivity(roomId); // Registra atividade na sala
      io.to(roomId).emit("roomUpdated", room);
    }
  });

  // Desconexão
  socket.on("disconnect", () => {
    console.log("Cliente desconectado:", socket.id);
  });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
