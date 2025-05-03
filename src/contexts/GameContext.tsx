import React, { createContext, useState, useEffect, useContext } from "react";
import { useToast } from "@/components/ui/use-toast";
import {
  BlackCard,
  Deck,
  GameRoom,
  Player,
  WhiteCard,
  PlayedCard,
} from "@/types/game";
import { defaultDecks } from "@/data/decks";
import { v4 as uuidv4 } from "uuid";

interface GameContextType {
  playerName: string;
  setPlayerName: (name: string) => void;
  currentRoom: GameRoom | null;
  createRoom: (name: string) => void;
  joinRoom: (roomId: string) => void;
  leaveRoom: () => void;
  startGame: () => void;
  selectCard: (card: WhiteCard) => void;
  submitJudgement: (cardIndex: number) => void;
  isAdmin: boolean;
  setIsAdmin: (value: boolean) => void;
  adminLogin: (password: string) => boolean;
  adminLogout: () => void;
  decks: Deck[];
  addDeck: (deck: Deck) => void;
  updateDeck: (deckId: string, updatedDeck: Partial<Deck>) => void;
  removeDeck: (deckId: string) => void;
  addBlackCard: (deckId: string, text: string) => void;
  addWhiteCard: (deckId: string, text: string) => void;
  removeCard: (
    deckId: string,
    cardId: string,
    cardType: "black" | "white"
  ) => void;
  rooms: Record<string, GameRoom>;
  getPlayerFromCurrentRoom: () => Player | undefined;
  addLocalPlayer: (roomId: string, playerName: string) => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error("useGame must be used within a GameProvider");
  }
  return context;
};

interface GameProviderProps {
  children: React.ReactNode;
}

const ADMIN_PASSWORD = "admin123"; // Simplified for the prototype

// Helper functions
const createPlayer = (name: string, isJudge: boolean = false): Player => ({
  id: uuidv4(),
  name,
  score: 0,
  isJudge,
  isReady: true,
  cards: [],
});

const createNewRoom = (name: string, playerName: string): GameRoom => {
  const roomId = uuidv4().slice(0, 6);
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

  return {
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
    status: "waiting",
    createdAt: new Date().toISOString(),
    winner: null,
  };
};

const dealCardsToPlayers = (room: GameRoom): GameRoom => {
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

export const GameProvider: React.FC<GameProviderProps> = ({ children }) => {
  const { toast } = useToast();
  const [playerName, setPlayerName] = useState("");
  const [currentRoom, setCurrentRoom] = useState<GameRoom | null>(null);
  const [decks, setDecks] = useState<Deck[]>(defaultDecks);
  const [isAdmin, setIsAdmin] = useState(false);
  // Store rooms locally for testing without server
  const [rooms, setRooms] = useState<Record<string, GameRoom>>({});

  // Load player name from localStorage
  useEffect(() => {
    const savedName = localStorage.getItem("playerName");
    if (savedName) {
      setPlayerName(savedName);
    }

    // Load saved rooms from localStorage if exist
    const savedRooms = localStorage.getItem("rooms");
    if (savedRooms) {
      try {
        setRooms(JSON.parse(savedRooms));
      } catch (e) {
        console.error("Error loading rooms from localStorage", e);
      }
    }
  }, []);

  // Save player name to localStorage when it changes
  useEffect(() => {
    if (playerName) {
      localStorage.setItem("playerName", playerName);
    }
  }, [playerName]);

  // Save rooms to localStorage when they change
  useEffect(() => {
    localStorage.setItem("rooms", JSON.stringify(rooms));
  }, [rooms]);

  // Get player from current room
  const getPlayerFromCurrentRoom = (): Player | undefined => {
    if (!currentRoom || !playerName) return undefined;
    return currentRoom.players.find((p) => p.name === playerName);
  };

  // Create a new game room
  const createRoom = (name: string) => {
    if (!playerName) {
      toast({
        title: "Erro",
        description: "Por favor, defina seu apelido primeiro.",
      });
      return;
    }

    const newRoom = createNewRoom(name, playerName);
    const updatedRooms = { ...rooms, [newRoom.id]: newRoom };
    setRooms(updatedRooms);
    setCurrentRoom(newRoom);
  };

  // Join an existing game room
  const joinRoom = (roomId: string) => {
    if (!playerName) {
      toast({
        title: "Erro",
        description: "Por favor, defina seu apelido primeiro.",
      });
      return;
    }

    const room = rooms[roomId];
    if (!room) {
      toast({
        title: "Erro",
        description: "Sala não encontrada",
      });
      return;
    }

    if (room.players.length >= 5) {
      toast({
        title: "Erro",
        description: "Sala cheia",
      });
      return;
    }

    // Check if player is already in the room
    if (room.players.some((p) => p.name === playerName)) {
      // Just join the room without adding the player again
      setCurrentRoom(room);
      return;
    }

    const updatedRoom = { ...room };
    const player = createPlayer(playerName);
    updatedRoom.players.push(player);

    const updatedRooms = { ...rooms, [roomId]: updatedRoom };
    setRooms(updatedRooms);
    setCurrentRoom(updatedRoom);
  };

  // Add another local player (for testing)
  const addLocalPlayer = (roomId: string, playerName: string) => {
    const room = rooms[roomId];
    if (!room) return;

    if (room.players.length >= 5) {
      toast({
        title: "Erro",
        description: "Sala cheia",
      });
      return;
    }

    // Check if player name is already taken
    if (room.players.some((p) => p.name === playerName)) {
      toast({
        title: "Erro",
        description: "Nome de jogador já existe na sala",
      });
      return;
    }

    const updatedRoom = { ...room };
    const player = createPlayer(playerName);
    updatedRoom.players.push(player);

    const updatedRooms = { ...rooms, [roomId]: updatedRoom };
    setRooms(updatedRooms);

    if (currentRoom?.id === roomId) {
      setCurrentRoom(updatedRoom);
    }
  };

  // Leave the current room
  const leaveRoom = () => {
    if (!currentRoom || !playerName) return;

    const player = currentRoom.players.find((p) => p.name === playerName);
    if (!player) return;

    const updatedRoom = { ...currentRoom };
    updatedRoom.players = updatedRoom.players.filter(
      (p) => p.name !== playerName
    );

    // If the room is empty, delete it
    let updatedRooms = { ...rooms };
    if (updatedRoom.players.length === 0) {
      delete updatedRooms[currentRoom.id];
    } else {
      // If the leaving player was the judge, assign a new judge
      if (player.isJudge && updatedRoom.players.length > 0) {
        updatedRoom.currentJudgeIndex = 0;
        updatedRoom.players[0].isJudge = true;
      }
      updatedRooms[currentRoom.id] = updatedRoom;
    }

    setRooms(updatedRooms);
    setCurrentRoom(null);
  };

  // Start game
  const startGame = () => {
    if (!currentRoom) return;

    if (currentRoom.players.length < 2) {
      toast({
        title: "Erro",
        description:
          "São necessários pelo menos 2 jogadores para iniciar o jogo (para teste local).",
      });
      return;
    }

    const updatedRoom = dealCardsToPlayers(currentRoom);
    const updatedRooms = { ...rooms, [currentRoom.id]: updatedRoom };
    setRooms(updatedRooms);
    setCurrentRoom(updatedRoom);
  };

  // Select and play a card
  const selectCard = (card: WhiteCard) => {
    if (!currentRoom || !playerName) return;

    const player = currentRoom.players.find((p) => p.name === playerName);
    if (!player || player.isJudge) return;

    // Check if player already played a card
    if (currentRoom.playedCards.some((pc) => pc.playerId === player.id)) {
      toast({
        title: "Erro",
        description: "Você já jogou uma carta nesta rodada.",
      });
      return;
    }

    const updatedRoom = { ...currentRoom };

    // Remove the card from player's hand
    const playerIndex = updatedRoom.players.findIndex(
      (p) => p.id === player.id
    );
    updatedRoom.players[playerIndex].cards = player.cards.filter(
      (c) => c.id !== card.id
    );

    // Add the played card
    updatedRoom.playedCards.push({
      card,
      playerId: player.id,
      playerName: player.name,
    });

    // Check if all non-judge players have played their cards
    const nonJudgePlayers = updatedRoom.players.filter((p) => !p.isJudge);
    if (updatedRoom.playedCards.length === nonJudgePlayers.length) {
      updatedRoom.status = "judging";

      // Shuffle the played cards so the judge doesn't know who played what
      updatedRoom.playedCards = [...updatedRoom.playedCards].sort(
        () => Math.random() - 0.5
      );
    }

    const updatedRooms = { ...rooms, [currentRoom.id]: updatedRoom };
    setRooms(updatedRooms);
    setCurrentRoom(updatedRoom);
  };

  // Submit judge's decision
  const submitJudgement = (cardIndex: number) => {
    if (!currentRoom || !playerName) return;

    const judge = currentRoom.players.find((p) => p.isJudge);
    if (!judge || judge.name !== playerName || currentRoom.status !== "judging")
      return;

    const updatedRoom = { ...currentRoom };

    // Find the winning card and player
    const winningCard = updatedRoom.playedCards[cardIndex];
    if (!winningCard) return;

    // Add point to the winning player
    const winnerIndex = updatedRoom.players.findIndex(
      (p) => p.id === winningCard.playerId
    );
    if (winnerIndex >= 0) {
      updatedRoom.players[winnerIndex].score += 1;
    }

    // Prepare for next round
    // Draw a new card for each player
    updatedRoom.players = updatedRoom.players.map((player) => {
      if (!player.isJudge && player.cards.length < 7) {
        const newCard = updatedRoom.whiteCardDeck.shift();
        if (newCard) {
          return {
            ...player,
            cards: [...player.cards, newCard],
          };
        }
      }
      return player;
    });

    // Reset played cards
    updatedRoom.playedCards = [];

    // Update judge for next round
    updatedRoom.players.forEach((p) => {
      p.isJudge = false;
    });
    updatedRoom.currentJudgeIndex =
      (updatedRoom.currentJudgeIndex + 1) % updatedRoom.players.length;
    updatedRoom.players[updatedRoom.currentJudgeIndex].isJudge = true;

    // Get next black card
    updatedRoom.currentBlackCard = updatedRoom.blackCardDeck.shift() || null;

    // Check if game is over
    if (updatedRoom.round >= updatedRoom.maxRounds) {
      updatedRoom.status = "finished";
      const maxScore = Math.max(...updatedRoom.players.map((p) => p.score));
      updatedRoom.winner =
        updatedRoom.players.find((p) => p.score === maxScore) || null;
    } else {
      updatedRoom.round += 1;
      updatedRoom.status = "playing";
    }

    const updatedRooms = { ...rooms, [currentRoom.id]: updatedRoom };
    setRooms(updatedRooms);
    setCurrentRoom(updatedRoom);
  };

  // Admin functions (local only)
  const adminLogin = (password: string): boolean => {
    if (password === ADMIN_PASSWORD) {
      setIsAdmin(true);
      return true;
    }
    return false;
  };

  const adminLogout = () => {
    setIsAdmin(false);
  };

  const addDeck = (deck: Deck) => {
    setDecks([...decks, deck]);
  };

  const updateDeck = (deckId: string, updatedDeck: Partial<Deck>) => {
    setDecks(
      decks.map((deck) =>
        deck.id === deckId ? { ...deck, ...updatedDeck } : deck
      )
    );
  };

  const removeDeck = (deckId: string) => {
    setDecks(decks.filter((deck) => deck.id !== deckId));
  };

  const addBlackCard = (deckId: string, text: string) => {
    setDecks(
      decks.map((deck) => {
        if (deck.id === deckId) {
          return {
            ...deck,
            blackCards: [...deck.blackCards, { id: uuidv4(), text, deckId }],
          };
        }
        return deck;
      })
    );
  };

  const addWhiteCard = (deckId: string, text: string) => {
    setDecks(
      decks.map((deck) => {
        if (deck.id === deckId) {
          return {
            ...deck,
            whiteCards: [...deck.whiteCards, { id: uuidv4(), text, deckId }],
          };
        }
        return deck;
      })
    );
  };

  const removeCard = (
    deckId: string,
    cardId: string,
    cardType: "black" | "white"
  ) => {
    setDecks(
      decks.map((deck) => {
        if (deck.id === deckId) {
          if (cardType === "black") {
            return {
              ...deck,
              blackCards: deck.blackCards.filter((card) => card.id !== cardId),
            };
          } else {
            return {
              ...deck,
              whiteCards: deck.whiteCards.filter((card) => card.id !== cardId),
            };
          }
        }
        return deck;
      })
    );
  };

  return (
    <GameContext.Provider
      value={{
        playerName,
        setPlayerName,
        currentRoom,
        createRoom,
        joinRoom,
        leaveRoom,
        startGame,
        selectCard,
        submitJudgement,
        isAdmin,
        setIsAdmin,
        adminLogin,
        adminLogout,
        decks,
        addDeck,
        updateDeck,
        removeDeck,
        addBlackCard,
        addWhiteCard,
        removeCard,
        rooms,
        getPlayerFromCurrentRoom,
        addLocalPlayer,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};
