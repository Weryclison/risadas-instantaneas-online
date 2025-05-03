import { supabase } from "@/lib/supabase";
import { Deck, BlackCard, WhiteCard } from "@/types/game";
import { v4 as uuidv4 } from "uuid";

// Obter todos os baralhos
export async function getAllDecks(): Promise<Deck[]> {
  try {
    // Buscar todos os baralhos
    const { data: decks, error: decksError } = await supabase
      .from("decks")
      .select("*");

    if (decksError) throw decksError;

    if (!decks || decks.length === 0) return [];

    // Para cada baralho, buscar suas cartas pretas e brancas
    const decksWithCards = await Promise.all(
      decks.map(async (deck) => {
        // Buscar cartas pretas
        const { data: blackCards, error: blackCardsError } = await supabase
          .from("black_cards")
          .select("*")
          .eq("deck_id", deck.id);

        if (blackCardsError) throw blackCardsError;

        // Buscar cartas brancas
        const { data: whiteCards, error: whiteCardsError } = await supabase
          .from("white_cards")
          .select("*")
          .eq("deck_id", deck.id);

        if (whiteCardsError) throw whiteCardsError;

        // Mapear os dados para o formato esperado pela aplicação
        return {
          id: deck.id,
          name: deck.name,
          description: deck.description,
          isDefault: deck.is_default,
          blackCards: blackCards.map((card) => ({
            id: card.id,
            text: card.text,
            deckId: card.deck_id,
          })),
          whiteCards: whiteCards.map((card) => ({
            id: card.id,
            text: card.text,
            deckId: card.deck_id,
          })),
        } as Deck;
      })
    );

    return decksWithCards;
  } catch (error) {
    console.error("Erro ao buscar baralhos:", error);
    return [];
  }
}

// Adicionar um novo baralho
export async function addDeck(deck: Omit<Deck, "id">): Promise<Deck | null> {
  try {
    const newDeckId = uuidv4();

    // Inserir o baralho
    const { error: deckError } = await supabase.from("decks").insert({
      id: newDeckId,
      name: deck.name,
      description: deck.description,
      is_default: deck.isDefault || false,
    });

    if (deckError) throw deckError;

    // Inserir cartas pretas se houver
    if (deck.blackCards && deck.blackCards.length > 0) {
      const blackCardsData = deck.blackCards.map((card) => ({
        id: card.id || uuidv4(),
        text: card.text,
        deck_id: newDeckId,
      }));

      const { error: blackCardsError } = await supabase
        .from("black_cards")
        .insert(blackCardsData);

      if (blackCardsError) throw blackCardsError;
    }

    // Inserir cartas brancas se houver
    if (deck.whiteCards && deck.whiteCards.length > 0) {
      const whiteCardsData = deck.whiteCards.map((card) => ({
        id: card.id || uuidv4(),
        text: card.text,
        deck_id: newDeckId,
      }));

      const { error: whiteCardsError } = await supabase
        .from("white_cards")
        .insert(whiteCardsData);

      if (whiteCardsError) throw whiteCardsError;
    }

    // Retornar o baralho completo
    return {
      id: newDeckId,
      name: deck.name,
      description: deck.description,
      isDefault: deck.isDefault || false,
      blackCards: deck.blackCards || [],
      whiteCards: deck.whiteCards || [],
    };
  } catch (error) {
    console.error("Erro ao adicionar baralho:", error);
    return null;
  }
}

// Adicionar uma carta preta a um baralho
export async function addBlackCard(
  deckId: string,
  text: string
): Promise<BlackCard | null> {
  try {
    const newCardId = uuidv4();

    const { error } = await supabase.from("black_cards").insert({
      id: newCardId,
      text,
      deck_id: deckId,
    });

    if (error) throw error;

    return {
      id: newCardId,
      text,
      deckId,
    };
  } catch (error) {
    console.error("Erro ao adicionar carta preta:", error);
    return null;
  }
}

// Adicionar uma carta branca a um baralho
export async function addWhiteCard(
  deckId: string,
  text: string
): Promise<WhiteCard | null> {
  try {
    const newCardId = uuidv4();

    const { error } = await supabase.from("white_cards").insert({
      id: newCardId,
      text,
      deck_id: deckId,
    });

    if (error) throw error;

    return {
      id: newCardId,
      text,
      deckId,
    };
  } catch (error) {
    console.error("Erro ao adicionar carta branca:", error);
    return null;
  }
}

// Remover uma carta
export async function removeCard(
  deckId: string,
  cardId: string,
  cardType: "black" | "white"
): Promise<boolean> {
  try {
    const table = cardType === "black" ? "black_cards" : "white_cards";

    const { error } = await supabase
      .from(table)
      .delete()
      .eq("id", cardId)
      .eq("deck_id", deckId);

    if (error) throw error;

    return true;
  } catch (error) {
    console.error(`Erro ao remover carta ${cardType}:`, error);
    return false;
  }
}

// Remover um baralho e todas as suas cartas
export async function removeDeck(deckId: string): Promise<boolean> {
  try {
    // Primeiro remover todas as cartas relacionadas para evitar problemas de chave estrangeira
    const { error: blackCardsError } = await supabase
      .from("black_cards")
      .delete()
      .eq("deck_id", deckId);

    if (blackCardsError) throw blackCardsError;

    const { error: whiteCardsError } = await supabase
      .from("white_cards")
      .delete()
      .eq("deck_id", deckId);

    if (whiteCardsError) throw whiteCardsError;

    // Agora podemos remover o baralho
    const { error: deckError } = await supabase
      .from("decks")
      .delete()
      .eq("id", deckId);

    if (deckError) throw deckError;

    return true;
  } catch (error) {
    console.error("Erro ao remover baralho:", error);
    return false;
  }
}
