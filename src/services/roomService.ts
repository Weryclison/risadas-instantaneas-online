import { supabase } from "@/lib/supabase";
import { GameRoom } from "@/types/game";

// Obter todas as salas ativas
export async function getAllRooms(): Promise<Record<string, GameRoom>> {
  try {
    const { data, error } = await supabase
      .from("rooms")
      .select("*")
      .eq("is_active", true);

    if (error) throw error;

    // Converter os resultados para o formato esperado
    const rooms: Record<string, GameRoom> = {};
    data.forEach((room) => {
      rooms[room.id] = room.data as GameRoom;
    });

    return rooms;
  } catch (error) {
    console.error("Erro ao buscar salas:", error);
    return {};
  }
}

// Obter uma sala específica
export async function getRoom(roomId: string): Promise<GameRoom | null> {
  try {
    const { data, error } = await supabase
      .from("rooms")
      .select("*")
      .eq("id", roomId)
      .eq("is_active", true)
      .single();

    if (error) throw error;
    if (!data) return null;

    return data.data as GameRoom;
  } catch (error) {
    console.error(`Erro ao buscar sala ${roomId}:`, error);
    return null;
  }
}

// Criar uma nova sala
export async function createRoom(room: GameRoom): Promise<boolean> {
  try {
    const { error } = await supabase.from("rooms").insert({
      id: room.id,
      name: room.name,
      data: room,
      is_active: true,
    });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Erro ao criar sala:", error);
    return false;
  }
}

// Atualizar uma sala existente
export async function updateRoom(room: GameRoom): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("rooms")
      .update({
        name: room.name,
        data: room,
      })
      .eq("id", room.id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Erro ao atualizar sala:", error);
    return false;
  }
}

// Desativar uma sala (não deletar)
export async function deactivateRoom(roomId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("rooms")
      .update({ is_active: false })
      .eq("id", roomId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Erro ao desativar sala:", error);
    return false;
  }
}

// Inscrever-se para mudanças em uma sala
export function subscribeToRoom(
  roomId: string,
  callback: (room: GameRoom) => void
) {
  const channel = supabase
    .channel(`room:${roomId}`)
    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "rooms",
        filter: `id=eq.${roomId}`,
      },
      (payload) => {
        callback(payload.new.data);
      }
    )
    .subscribe();

  // Retorna uma função para cancelar a inscrição
  return () => {
    supabase.removeChannel(channel);
  };
}

// Obter uma lista simplificada de salas para exibição
export async function getRoomsList(): Promise<
  {
    id: string;
    name: string;
    players: number;
    maxPlayers: number;
    hasPassword: boolean;
  }[]
> {
  try {
    const { data, error } = await supabase
      .from("rooms")
      .select("id, name, data")
      .eq("is_active", true);

    if (error) throw error;
    if (!data) return [];

    return data.map((room) => {
      const roomData = room.data as GameRoom;
      return {
        id: room.id,
        name: room.name,
        players: roomData.players.length,
        maxPlayers: roomData.maxPlayers,
        hasPassword: roomData.hasPassword,
      };
    });
  } catch (error) {
    console.error("Erro ao buscar lista de salas:", error);
    return [];
  }
}
