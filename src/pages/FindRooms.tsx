import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useGame } from "@/contexts/GameContext";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Lock, Users } from "lucide-react";
import * as roomService from "@/services/roomService";
import Layout from "@/components/Layout";

interface RoomListItem {
  id: string;
  name: string;
  players: number;
  maxPlayers: number;
  hasPassword: boolean;
}

const FindRooms = () => {
  const { joinRoom } = useGame();
  const [password, setPassword] = useState("");
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [rooms, setRooms] = useState<RoomListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Carregar lista de salas disponíveis
  useEffect(() => {
    const fetchRooms = async () => {
      setLoading(true);
      try {
        const roomsList = await roomService.getRoomsList();
        setRooms(roomsList);
      } catch (error) {
        console.error("Erro ao buscar salas:", error);
        toast({
          title: "Erro",
          description:
            "Não foi possível carregar a lista de salas disponíveis.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();

    // Atualizar a lista a cada 10 segundos
    const interval = setInterval(fetchRooms, 10000);
    return () => clearInterval(interval);
  }, [toast]);

  const handleJoinRoom = async () => {
    if (!selectedRoomId) return;

    const success = await joinRoom(selectedRoomId, password);
    if (success) {
      navigate(`/room/${selectedRoomId}`);
    }

    // Resetar valores
    setSelectedRoomId(null);
    setPassword("");
    setShowPassword(false);
  };

  const handleRefresh = async () => {
    setLoading(true);
    try {
      const roomsList = await roomService.getRoomsList();
      setRooms(roomsList);
      toast({
        title: "Lista atualizada",
        description: "A lista de salas foi atualizada.",
      });
    } catch (error) {
      console.error("Erro ao atualizar salas:", error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a lista de salas.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto p-4 max-w-4xl">
        <h1 className="text-2xl font-bold mb-6">Encontrar Salas</h1>

        <div className="flex justify-between items-center mb-4">
          <p className="text-sm text-muted-foreground">
            {rooms.length}{" "}
            {rooms.length === 1 ? "sala disponível" : "salas disponíveis"}
          </p>
          <Button onClick={handleRefresh} disabled={loading}>
            {loading ? "Atualizando..." : "Atualizar Lista"}
          </Button>
        </div>

        <div className="space-y-4">
          {rooms.length === 0 ? (
            <div className="text-center p-10 border rounded-lg bg-muted/30">
              {loading ? (
                <p>Buscando salas disponíveis...</p>
              ) : (
                <p>Não há salas disponíveis no momento. Que tal criar uma?</p>
              )}
            </div>
          ) : (
            rooms.map((room) => (
              <div
                key={room.id}
                className="border rounded-lg p-4 flex justify-between items-center hover:bg-accent/10 transition-colors"
              >
                <div>
                  <h3 className="font-medium flex items-center">
                    {room.name}
                    {room.hasPassword && (
                      <Lock className="ml-2 h-4 w-4 text-orange-500" />
                    )}
                  </h3>
                  <div className="flex items-center text-sm text-muted-foreground mt-1">
                    <Users className="mr-1 h-4 w-4" />
                    <span>
                      {room.players}/{room.maxPlayers} jogadores
                    </span>
                  </div>
                </div>
                <Button
                  onClick={() => setSelectedRoomId(room.id)}
                  disabled={room.players >= room.maxPlayers}
                >
                  {room.players >= room.maxPlayers ? "Sala Cheia" : "Entrar"}
                </Button>
              </div>
            ))
          )}
        </div>

        <Dialog
          open={selectedRoomId !== null}
          onOpenChange={(open) => {
            if (!open) {
              setSelectedRoomId(null);
              setPassword("");
              setShowPassword(false);
            }
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Entrar na sala</DialogTitle>
              <DialogDescription>
                {rooms.find((r) => r.id === selectedRoomId)?.hasPassword
                  ? "Esta sala requer uma senha para entrar."
                  : "Você está prestes a entrar nesta sala."}
              </DialogDescription>
            </DialogHeader>

            {rooms.find((r) => r.id === selectedRoomId)?.hasPassword && (
              <div className="space-y-2 py-4">
                <label htmlFor="password" className="text-sm font-medium">
                  Senha da sala
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pr-10"
                    placeholder="Digite a senha da sala"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </button>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button
                variant="secondary"
                onClick={() => setSelectedRoomId(null)}
              >
                Cancelar
              </Button>
              <Button onClick={handleJoinRoom}>Entrar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default FindRooms;
