import { Deck } from "../types/game";

// Função auxiliar para criar IDs únicos
const createId = () => Math.random().toString(36).substr(2, 9);

// Deck básico com cartas gerais (para todas idades)
const basicDeckId = createId();
const basicDeck: Deck = {
  id: basicDeckId,
  name: "Baralho Básico",
  description: "Cartas gerais para todas as idades",
  isDefault: true,
  blackCards: [
    {
      id: createId(),
      text: "O que me faz rir incontrolavelmente?",
      deckId: basicDeckId,
    },
    {
      id: createId(),
      text: "O que eu sempre esqueço de fazer antes de sair de casa?",
      deckId: basicDeckId,
    },
    {
      id: createId(),
      text: "Qual é o segredo para um relacionamento perfeito?",
      deckId: basicDeckId,
    },
  ],
  whiteCards: [
    {
      id: createId(),
      text: "Passar vergonha em público.",
      deckId: basicDeckId,
    },
    {
      id: createId(),
      text: "Rir nos momentos mais inapropriados.",
      deckId: basicDeckId,
    },
    {
      id: createId(),
      text: "Fingir que está ouvindo quando alguém fala.",
      deckId: basicDeckId,
    },
  ],
};

export const defaultDecks: Deck[] = [basicDeck];
