import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useRef,
} from "react";
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
import * as deckService from "@/services/deckService";
import * as roomService from "@/services/roomService";

interface GameContextType {
  playerName: string;
  setPlayerName: (name: string) => void;
  currentRoom: GameRoom | null;
  createRoom: (
    name: string,
    hasPassword?: boolean,
    password?: string,
    maxPlayers?: number
  ) => string | null;
  joinRoom: (roomId: string, password?: string) => Promise<boolean>;
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
  loadingRooms: boolean;
  getPlayerFromCurrentRoom: () => Player | undefined;
  addLocalPlayer: (roomId: string, playerName: string) => void;
  simulatedPlayerName: string | null;
  simulatePlayer: (playerName: string | null) => void;
  cleanRooms: () => void;
  isLoading: boolean;
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

// Em produção, isso deveria estar em variáveis de ambiente
// E idealmente o login seria verificado no servidor com hash+salt
const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || "admin123";

// Funções auxiliares de localStorage com tratamento de erros
const localStorageHelper = {
  getItem: (key: string) => {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.error(`Erro ao ler do localStorage (${key}):`, error);
      return null;
    }
  },
  setItem: (key: string, value: string) => {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch (error) {
      console.error(`Erro ao salvar no localStorage (${key}):`, error);
      return false;
    }
  },
};

// Helper functions
const createPlayer = (name: string, isJudge: boolean = false): Player => ({
  id: uuidv4(),
  name,
  score: 0,
  isJudge,
  isReady: true,
  cards: [],
});

const createNewRoom = (
  name: string,
  playerName: string,
  hasPassword: boolean = false,
  password: string = "",
  maxPlayers: number = 8
): GameRoom => {
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
    hasPassword,
    password,
    maxPlayers,
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

// Check if a player is a fake/bot player (for auto-cleanup)
const isFakePlayer = (playerName: string): boolean => {
  // Define patterns for identifying fake players
  // Adjust this according to your naming convention for fake/test players
  const fakePatterns = [
    /^test/i, // Names starting with "test"
    /^bot/i, // Names starting with "bot"
    /^fake/i, // Names starting with "fake"
    /^player\d+$/i, // Names like "player1", "player2"
    /^jogador\d+$/i, // Names like "jogador1", "jogador2"
  ];

  return fakePatterns.some((pattern) => pattern.test(playerName));
};

export const GameProvider: React.FC<GameProviderProps> = ({ children }) => {
  const { toast } = useToast();
  const [playerName, setPlayerName] = useState("");
  const [currentRoom, setCurrentRoom] = useState<GameRoom | null>(null);
  const [decks, setDecks] = useState<Deck[]>(defaultDecks);
  const [isAdmin, setIsAdmin] = useState(false);
  // Store rooms locally for testing without server
  const [rooms, setRooms] = useState<Record<string, GameRoom>>({});
  const [loadingRooms, setLoadingRooms] = useState(false);
  // Simulated player for testing
  const [simulatedPlayerName, setSimulatedPlayerName] = useState<string | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);

  // Referência para a função de cancelamento da inscrição
  const unsubscribeRef = useRef<(() => void) | null>(null);

  // Carregar baralhos do banco de dados
  useEffect(() => {
    const loadDecks = async () => {
      setIsLoading(true);
      try {
        const loadedDecks = await deckService.getAllDecks();
        if (loadedDecks && loadedDecks.length > 0) {
          setDecks(loadedDecks);
        } else {
          // Se não houver baralhos na base de dados, usar os padrões e adicioná-los
          for (const deck of defaultDecks) {
            await deckService.addDeck(deck);
          }
          setDecks(defaultDecks);
        }
      } catch (error) {
        console.error("Erro ao carregar baralhos:", error);
        // Fallback para os baralhos padrão em caso de erro
        setDecks(defaultDecks);
      } finally {
        setIsLoading(false);
      }
    };

    loadDecks();
  }, []);

  // Carregar salas do Supabase
  useEffect(() => {
    const loadRooms = async () => {
      setLoadingRooms(true);
      try {
        const loadedRooms = await roomService.getAllRooms();
        setRooms(loadedRooms);
      } catch (error) {
        console.error("Erro ao carregar salas:", error);
      } finally {
        setLoadingRooms(false);
      }
    };

    loadRooms();
  }, []);

  // Load player name from localStorage
  useEffect(() => {
    const savedName = localStorageHelper.getItem("playerName");
    if (savedName) {
      setPlayerName(savedName);
    }
  }, []);

  // Save player name to localStorage when it changes
  useEffect(() => {
    if (playerName) {
      localStorageHelper.setItem("playerName", playerName);
    }
  }, [playerName]);

  // Inscrever-se para atualizações na sala atual
  useEffect(() => {
    if (currentRoom) {
      // Desinscrever-se da sala anterior, se houver
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }

      // Inscrever-se para atualizações na sala atual
      unsubscribeRef.current = roomService.subscribeToRoom(
        currentRoom.id,
        (updatedRoom) => {
          setCurrentRoom(updatedRoom);
          setRooms((prevRooms) => ({
            ...prevRooms,
            [updatedRoom.id]: updatedRoom,
          }));
        }
      );
    }

    // Função de limpeza para desinscrever-se quando o componente for desmontado
    // ou quando a sala atual mudar
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, [currentRoom?.id]);

  // Function to clean all rooms in the application
  const cleanRooms = async () => {
    try {
      // Para cada sala ativa, marcar como inativa no Supabase
      await Promise.all(
        Object.keys(rooms).map((roomId) => roomService.deactivateRoom(roomId))
      );

      setRooms({});
      if (currentRoom) {
        setCurrentRoom(null);
      }

      toast({
        title: "Sucesso",
        description: "Todas as salas foram limpas com sucesso.",
      });
    } catch (error) {
      console.error("Erro ao limpar salas:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao limpar as salas.",
        variant: "destructive",
      });
    }
  };

  // Get player from current room
  const getPlayerFromCurrentRoom = (): Player | undefined => {
    if (!currentRoom) return undefined;
    // If simulating another player, return that player instead
    const effectivePlayerName = simulatedPlayerName || playerName;
    if (!effectivePlayerName) return undefined;
    return currentRoom.players.find((p) => p.name === effectivePlayerName);
  };

  // Simulate another player for testing
  const simulatePlayer = (playerName: string | null) => {
    setSimulatedPlayerName(playerName);
  };

  // Create a new game room
  const createRoom = (
    name: string,
    hasPassword: boolean = false,
    password: string = "",
    maxPlayers: number = 8
  ) => {
    if (!playerName) {
      toast({
        title: "Erro",
        description: "Por favor, defina seu apelido primeiro.",
      });
      return null;
    }

    // Validate password if hasPassword is true
    if (hasPassword && !password.trim()) {
      toast({
        title: "Erro",
        description: "Se a sala é protegida, você deve definir uma senha.",
      });
      return null;
    }

    // Validate max players
    if (maxPlayers < 2) {
      toast({
        title: "Erro",
        description: "A sala deve permitir no mínimo 2 jogadores.",
      });
      return null;
    }

    if (maxPlayers > 20) {
      toast({
        title: "Erro",
        description: "A sala pode ter no máximo 20 jogadores.",
      });
      return null;
    }

    const newRoom = createNewRoom(
      name,
      playerName,
      hasPassword,
      password,
      maxPlayers
    );

    // Criar a sala no Supabase
    roomService
      .createRoom(newRoom)
      .then((success) => {
        if (!success) {
          toast({
            title: "Erro",
            description: "Não foi possível criar a sala no servidor.",
            variant: "destructive",
          });
        }
      })
      .catch((error) => {
        console.error("Erro ao criar sala:", error);
        toast({
          title: "Erro",
          description: "Ocorreu um erro ao criar a sala.",
          variant: "destructive",
        });
      });

    // Atualizar estado local
    const updatedRooms = { ...rooms, [newRoom.id]: newRoom };
    setRooms(updatedRooms);
    setCurrentRoom(newRoom);
    return newRoom.id;
  };

  // Join an existing game room
  const joinRoom = async (roomId: string, password: string = "") => {
    if (!playerName) {
      toast({
        title: "Erro",
        description: "Por favor, defina seu apelido primeiro.",
      });
      return false;
    }

    try {
      // Buscar a sala mais recente do Supabase
      const room = await roomService.getRoom(roomId);

      if (!room) {
        toast({
          title: "Erro",
          description: "Sala não encontrada",
        });
        return false;
      }

      // Check if room has password and validate it
      if (room.hasPassword && room.password !== password) {
        toast({
          title: "Erro",
          description: "Senha incorreta para esta sala",
        });
        return false;
      }

      if (room.players.length >= room.maxPlayers) {
        toast({
          title: "Erro",
          description: `Sala cheia (máximo de ${room.maxPlayers} jogadores)`,
        });
        return false;
      }

      // Check if player is already in the room
      if (room.players.some((p) => p.name === playerName)) {
        // Just join the room without adding the player again
        setCurrentRoom(room);
        return true;
      }

      const updatedRoom = { ...room };
      const player = createPlayer(playerName);
      updatedRoom.players.push(player);

      // Atualizar a sala no Supabase
      const success = await roomService.updateRoom(updatedRoom);
      if (!success) {
        toast({
          title: "Erro",
          description: "Não foi possível entrar na sala.",
          variant: "destructive",
        });
        return false;
      }

      // Atualizar estado local
      const updatedRooms = { ...rooms, [roomId]: updatedRoom };
      setRooms(updatedRooms);
      setCurrentRoom(updatedRoom);
      return true;
    } catch (error) {
      console.error("Erro ao entrar na sala:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao tentar entrar na sala.",
        variant: "destructive",
      });
      return false;
    }
  };

  // Add another local player (for testing)
  const addLocalPlayer = async (roomId: string, playerName: string) => {
    if (!roomId || !playerName) return;

    try {
      // Buscar a sala mais recente
      const room = await roomService.getRoom(roomId);
      if (!room) {
        toast({
          title: "Erro",
          description: "Sala não encontrada",
        });
        return;
      }

      if (room.players.length >= room.maxPlayers) {
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

      // Atualizar a sala no Supabase
      const success = await roomService.updateRoom(updatedRoom);
      if (!success) {
        toast({
          title: "Erro",
          description: "Não foi possível adicionar o jogador.",
          variant: "destructive",
        });
        return;
      }

      // Atualizar estado local
      const updatedRooms = { ...rooms, [roomId]: updatedRoom };
      setRooms(updatedRooms);

      if (currentRoom?.id === roomId) {
        setCurrentRoom(updatedRoom);
      }
    } catch (error) {
      console.error("Erro ao adicionar jogador:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao adicionar o jogador.",
        variant: "destructive",
      });
    }
  };

  // Leave the current room
  const leaveRoom = async () => {
    if (!currentRoom || !playerName) return;

    const player = currentRoom.players.find((p) => p.name === playerName);
    if (!player) return;

    try {
      const updatedRoom = { ...currentRoom };
      updatedRoom.players = updatedRoom.players.filter(
        (p) => p.name !== playerName
      );

      // If the room is empty, mark it as inactive
      if (updatedRoom.players.length === 0) {
        await roomService.deactivateRoom(currentRoom.id);
        setRooms((prevRooms) => {
          const newRooms = { ...prevRooms };
          delete newRooms[currentRoom.id];
          return newRooms;
        });
      } else {
        // If the leaving player was the judge, assign a new judge
        if (player.isJudge && updatedRoom.players.length > 0) {
          updatedRoom.currentJudgeIndex = 0;
          updatedRoom.players[0].isJudge = true;
        }

        // Atualizar a sala no Supabase
        await roomService.updateRoom(updatedRoom);
        setRooms((prevRooms) => ({
          ...prevRooms,
          [currentRoom.id]: updatedRoom,
        }));
      }

      setCurrentRoom(null);
    } catch (error) {
      console.error("Erro ao sair da sala:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao sair da sala.",
        variant: "destructive",
      });
    }
  };

  // Start game
  const startGame = async () => {
    if (!currentRoom) return;

    if (currentRoom.players.length < 2) {
      toast({
        title: "Erro",
        description:
          "São necessários pelo menos 2 jogadores para iniciar o jogo.",
      });
      return;
    }

    try {
      const updatedRoom = dealCardsToPlayers(currentRoom);

      // Atualizar a sala no Supabase
      const success = await roomService.updateRoom(updatedRoom);
      if (!success) {
        toast({
          title: "Erro",
          description: "Não foi possível iniciar o jogo.",
          variant: "destructive",
        });
        return;
      }

      // Atualizar estado local
      const updatedRooms = { ...rooms, [currentRoom.id]: updatedRoom };
      setRooms(updatedRooms);
      setCurrentRoom(updatedRoom);
    } catch (error) {
      console.error("Erro ao iniciar jogo:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao iniciar o jogo.",
        variant: "destructive",
      });
    }
  };

  // Select and play a card
  const selectCard = async (card: WhiteCard) => {
    if (!currentRoom) return;

    // Use simulated player name if active
    const effectivePlayerName = simulatedPlayerName || playerName;
    if (!effectivePlayerName) return;

    const player = currentRoom.players.find(
      (p) => p.name === effectivePlayerName
    );
    if (!player || player.isJudge) return;

    // Check if player already played a card
    if (currentRoom.playedCards.some((pc) => pc.playerId === player.id)) {
      toast({
        title: "Erro",
        description: "Você já jogou uma carta nesta rodada.",
      });
      return;
    }

    try {
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

      // Atualizar a sala no Supabase
      const success = await roomService.updateRoom(updatedRoom);
      if (!success) {
        toast({
          title: "Erro",
          description: "Não foi possível jogar a carta.",
          variant: "destructive",
        });
        return;
      }

      // Atualizar estado local
      const updatedRooms = { ...rooms, [currentRoom.id]: updatedRoom };
      setRooms(updatedRooms);
      setCurrentRoom(updatedRoom);
    } catch (error) {
      console.error("Erro ao jogar carta:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao jogar a carta.",
        variant: "destructive",
      });
    }
  };

  // Submit judge's decision
  const submitJudgement = async (cardIndex: number) => {
    if (!currentRoom) return;

    // Use simulated player name if active
    const effectivePlayerName = simulatedPlayerName || playerName;
    if (!effectivePlayerName) return;

    const judge = currentRoom.players.find((p) => p.isJudge);
    if (
      !judge ||
      judge.name !== effectivePlayerName ||
      currentRoom.status !== "judging"
    )
      return;

    try {
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

      // Atualizar a sala no Supabase
      const success = await roomService.updateRoom(updatedRoom);
      if (!success) {
        toast({
          title: "Erro",
          description: "Não foi possível submeter o julgamento.",
          variant: "destructive",
        });
        return;
      }

      // Atualizar estado local
      const updatedRooms = { ...rooms, [currentRoom.id]: updatedRoom };
      setRooms(updatedRooms);
      setCurrentRoom(updatedRoom);
    } catch (error) {
      console.error("Erro ao submeter julgamento:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao submeter o julgamento.",
        variant: "destructive",
      });
    }
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

  // Substituir a função addDeck para usar o serviço
  const addDeck = async (deck: Deck) => {
    try {
      const newDeck = await deckService.addDeck(deck);
      if (newDeck) {
        setDecks([...decks, newDeck]);

        toast({
          title: "Baralho adicionado",
          description: `O baralho "${newDeck.name}" foi adicionado com sucesso.`,
        });

        return newDeck;
      } else {
        throw new Error("Falha ao adicionar baralho");
      }
    } catch (error) {
      console.error("Erro ao adicionar baralho:", error);

      toast({
        title: "Erro",
        description: "Não foi possível adicionar o baralho. Tente novamente.",
        variant: "destructive",
      });

      return null;
    }
  };

  const updateDeck = (deckId: string, updatedDeck: Partial<Deck>) => {
    // Atualizar localmente, mas em uma implementação completa, isso
    // utilizaria o serviço para atualizar no banco de dados
    setDecks(
      decks.map((deck) =>
        deck.id === deckId ? { ...deck, ...updatedDeck } : deck
      )
    );
  };

  const removeDeck = async (deckId: string) => {
    try {
      const success = await deckService.removeDeck(deckId);
      if (success) {
        setDecks(decks.filter((deck) => deck.id !== deckId));

        toast({
          title: "Baralho removido",
          description: "O baralho foi removido com sucesso.",
        });
      } else {
        throw new Error("Falha ao remover baralho");
      }
    } catch (error) {
      console.error("Erro ao remover baralho:", error);

      toast({
        title: "Erro",
        description: "Não foi possível remover o baralho. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const addBlackCard = async (deckId: string, text: string) => {
    try {
      const newCard = await deckService.addBlackCard(deckId, text);
      if (newCard) {
        setDecks(
          decks.map((deck) => {
            if (deck.id === deckId) {
              return {
                ...deck,
                blackCards: [...deck.blackCards, newCard],
              };
            }
            return deck;
          })
        );

        toast({
          title: "Carta adicionada",
          description: "A carta preta foi adicionada com sucesso.",
        });

        return newCard;
      } else {
        throw new Error("Falha ao adicionar carta preta");
      }
    } catch (error) {
      console.error("Erro ao adicionar carta preta:", error);

      toast({
        title: "Erro",
        description: "Não foi possível adicionar a carta. Tente novamente.",
        variant: "destructive",
      });

      return null;
    }
  };

  const addWhiteCard = async (deckId: string, text: string) => {
    try {
      const newCard = await deckService.addWhiteCard(deckId, text);
      if (newCard) {
        setDecks(
          decks.map((deck) => {
            if (deck.id === deckId) {
              return {
                ...deck,
                whiteCards: [...deck.whiteCards, newCard],
              };
            }
            return deck;
          })
        );

        toast({
          title: "Carta adicionada",
          description: "A carta branca foi adicionada com sucesso.",
        });

        return newCard;
      } else {
        throw new Error("Falha ao adicionar carta branca");
      }
    } catch (error) {
      console.error("Erro ao adicionar carta branca:", error);

      toast({
        title: "Erro",
        description: "Não foi possível adicionar a carta. Tente novamente.",
        variant: "destructive",
      });

      return null;
    }
  };

  const removeCard = async (
    deckId: string,
    cardId: string,
    cardType: "black" | "white"
  ) => {
    try {
      const success = await deckService.removeCard(deckId, cardId, cardType);
      if (success) {
        setDecks(
          decks.map((deck) => {
            if (deck.id === deckId) {
              if (cardType === "black") {
                return {
                  ...deck,
                  blackCards: deck.blackCards.filter(
                    (card) => card.id !== cardId
                  ),
                };
              } else {
                return {
                  ...deck,
                  whiteCards: deck.whiteCards.filter(
                    (card) => card.id !== cardId
                  ),
                };
              }
            }
            return deck;
          })
        );

        toast({
          title: "Carta removida",
          description: "A carta foi removida com sucesso.",
        });

        return true;
      } else {
        throw new Error(`Falha ao remover carta ${cardType}`);
      }
    } catch (error) {
      console.error(`Erro ao remover carta ${cardType}:`, error);

      toast({
        title: "Erro",
        description: "Não foi possível remover a carta. Tente novamente.",
        variant: "destructive",
      });

      return false;
    }
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
        loadingRooms,
        getPlayerFromCurrentRoom,
        addLocalPlayer,
        simulatedPlayerName,
        simulatePlayer,
        cleanRooms,
        isLoading,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};
