import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { useGame } from "@/contexts/GameContext";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Search, Lock, Users, User, RefreshCw, ArrowLeft } from "lucide-react";

// Room type definition
interface Room {
  id: string;
  name: string;
  hasPassword: boolean;
  currentPlayers: number;
  maxPlayers: number;
  createdAt: Date;
}

// Check if a player is a fake/bot player
const isFakePlayer = (playerName: string): boolean => {
  // Define patterns for identifying fake players
  // Keep this in sync with the same function in GameContext.tsx
  const fakePatterns = [
    /^test/i, // Names starting with "test"
    /^bot/i, // Names starting with "bot"
    /^fake/i, // Names starting with "fake"
    /^player\d+$/i, // Names like "player1", "player2"
    /^jogador\d+$/i, // Names like "jogador1", "jogador2"
  ];

  return fakePatterns.some((pattern) => pattern.test(playerName));
};

const FindRooms = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { joinRoom, playerName, rooms } = useGame();

  const [searchTerm, setSearchTerm] = useState("");
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Filter rooms based on search term and only show rooms with real players
  const filteredRooms = Object.values(rooms)
    .filter((room) => {
      // Filter by search term
      const matchesSearch = room.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

      // Only show rooms that have at least one real player
      const hasRealPlayer = room.players.some(
        (player) => !isFakePlayer(player.name)
      );

      return matchesSearch && hasRealPlayer;
    })
    .sort((a, b) => {
      // Sort by creation date (newest first)
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  // Handle joining a room
  const handleJoinRoom = (roomId: string, requiresPassword: boolean) => {
    if (requiresPassword) {
      setSelectedRoomId(roomId);
      setShowPasswordDialog(true);
    } else {
      joinRoomWithPassword(roomId, "");
    }
  };

  // Join a room with password (if needed)
  const joinRoomWithPassword = (roomId: string, roomPassword: string) => {
    // In a real app, you would check the password on the server
    if (!playerName) {
      toast({
        title: "Nome obrigatório",
        description: "Por favor, retorne e digite seu apelido para continuar",
      });
      navigate("/");
      return;
    }

    const success = joinRoom(roomId, roomPassword);
    if (success) {
      navigate(`/room/${roomId}`);
    } else {
      toast({
        title: "Erro ao entrar na sala",
        description:
          "Não foi possível entrar na sala. Verifique a senha ou tente novamente mais tarde.",
        variant: "destructive",
      });
    }
  };

  // Handle password submission
  const handlePasswordSubmit = () => {
    if (!password.trim()) {
      toast({
        title: "Senha obrigatória",
        description: "Por favor, digite a senha da sala",
      });
      return;
    }

    joinRoomWithPassword(selectedRoomId, password);
    setShowPasswordDialog(false);
    setPassword("");
  };

  // Get time difference in a human readable format
  const getTimeDiff = (isoDate: string): string => {
    const date = new Date(isoDate);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.round(diffMs / 60000);

    if (diffMins < 1) return "agora mesmo";
    if (diffMins === 1) return "1 minuto atrás";
    if (diffMins < 60) return `${diffMins} minutos atrás`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours === 1) return "1 hora atrás";
    if (diffHours < 24) return `${diffHours} horas atrás`;

    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return "1 dia atrás";
    return `${diffDays} dias atrás`;
  };

  // Calculate real players count (excluding fake/bot players)
  const getRealPlayersCount = (room: (typeof filteredRooms)[0]) => {
    return room.players.filter((player) => !isFakePlayer(player.name)).length;
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto py-6 px-4 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Encontrar Partidas</h1>
          <Button
            onClick={() => navigate("/")}
            variant="outline"
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
        </div>

        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar sala pelo nome..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : filteredRooms.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground">
              {searchTerm
                ? "Nenhuma sala encontrada com este nome"
                : "Nenhuma sala disponível no momento"}
            </p>
            <Button
              onClick={() => navigate("/create-room")}
              variant="default"
              className="mt-4"
            >
              Criar uma nova sala
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredRooms.map((room) => (
              <Card key={room.id} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{room.name}</CardTitle>
                    {room.hasPassword && (
                      <Badge variant="outline" className="flex items-center">
                        <Lock className="h-3 w-3 mr-1" />
                        Protegida
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="pb-0">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-1 text-muted-foreground" />
                        <span>Limite: {room.maxPlayers} jogadores</span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        Criada {getTimeDiff(room.createdAt)}
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2.5">
                      <div
                        className="bg-primary h-2.5 rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min(
                            (getRealPlayersCount(room) / room.maxPlayers) * 100,
                            100
                          )}%`,
                        }}
                      ></div>
                    </div>
                    <div className="flex items-center text-sm">
                      <User className="h-4 w-4 mr-1 text-muted-foreground" />
                      <span>
                        {getRealPlayersCount(room)} de {room.maxPlayers}{" "}
                        jogadores
                      </span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="pt-4">
                  <Button
                    onClick={() => handleJoinRoom(room.id, room.hasPassword)}
                    className="w-full"
                    variant="default"
                  >
                    {room.hasPassword ? "Entrar com senha" : "Entrar na sala"}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Password Dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Senha da sala</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              Esta sala é protegida. Digite a senha para entrar:
            </p>
            <Input
              type="password"
              placeholder="Digite a senha..."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowPasswordDialog(false);
                setPassword("");
              }}
            >
              Cancelar
            </Button>
            <Button onClick={handlePasswordSubmit}>Entrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default FindRooms;
