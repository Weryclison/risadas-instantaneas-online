
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import Layout from "@/components/Layout";
import { useGame } from "@/contexts/GameContext";

const Index = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { playerName, setPlayerName, createRoom, joinRoom } = useGame();
  const [roomCode, setRoomCode] = useState("");
  const [roomName, setRoomName] = useState("");

  const handleSetName = () => {
    if (!playerName.trim()) {
      toast({
        title: "Nome obrigatório",
        description: "Por favor, digite seu apelido para continuar",
      });
      return;
    }
    // Nome já está definido no estado e salvo no localStorage via GameContext
  };

  const handleCreateRoom = () => {
    if (!playerName.trim()) {
      toast({
        title: "Nome obrigatório",
        description: "Por favor, digite seu apelido para continuar",
      });
      return;
    }

    const roomId = createRoom(roomName.trim());
    if (roomId) {
      navigate(`/room/${roomId}`);
    }
  };

  const handleJoinRoom = () => {
    if (!playerName.trim()) {
      toast({
        title: "Nome obrigatório",
        description: "Por favor, digite seu apelido para continuar",
      });
      return;
    }

    if (!roomCode.trim()) {
      toast({
        title: "Código obrigatório",
        description: "Por favor, digite o código da sala",
      });
      return;
    }

    const joined = joinRoom(roomCode.trim());
    if (joined) {
      navigate(`/room/${roomCode.trim()}`);
    }
  };

  return (
    <Layout>
      <div className="max-w-md mx-auto space-y-10 py-10">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-primary mb-2 animate-fade-in">Cartas Contra</h1>
          <p className="text-muted-foreground">Um jogo de cartas politicamente incorreto</p>
        </div>

        <div className="space-y-6 animate-fade-in" style={{ animationDelay: "0.2s" }}>
          <div className="space-y-2">
            <label htmlFor="name" className="block text-sm font-medium">
              Seu apelido
            </label>
            <Input
              id="name"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Digite seu apelido"
              className="w-full"
            />
            <Button onClick={handleSetName} className="w-full">
              Confirmar apelido
            </Button>
          </div>

          {playerName && (
            <>
              <div className="relative py-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border"></div>
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-background px-2 text-sm text-muted-foreground">
                    ou
                  </span>
                </div>
              </div>

              <div className="space-y-4 animate-fade-in" style={{ animationDelay: "0.4s" }}>
                <div className="space-y-2">
                  <label htmlFor="roomName" className="block text-sm font-medium">
                    Criar nova sala
                  </label>
                  <Input
                    id="roomName"
                    value={roomName}
                    onChange={(e) => setRoomName(e.target.value)}
                    placeholder="Nome da sala (opcional)"
                    className="w-full"
                  />
                  <Button onClick={handleCreateRoom} className="w-full">
                    Criar sala
                  </Button>
                </div>

                <div className="space-y-2">
                  <label htmlFor="roomCode" className="block text-sm font-medium">
                    Entrar em sala existente
                  </label>
                  <Input
                    id="roomCode"
                    value={roomCode}
                    onChange={(e) => setRoomCode(e.target.value)}
                    placeholder="Digite o código da sala"
                    className="w-full"
                  />
                  <Button onClick={handleJoinRoom} variant="outline" className="w-full">
                    Entrar na sala
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Index;
