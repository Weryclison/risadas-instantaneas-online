import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import Layout from "@/components/Layout";
import { useGame } from "@/contexts/GameContext";
import {
  MoreHorizontal,
  LogOut,
  HelpCircle,
  Heart,
  Info,
  AlertCircle,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

const Index = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { playerName, setPlayerName, createRoom, joinRoom } = useGame();
  const [roomCode, setRoomCode] = useState("");
  const [roomName, setRoomName] = useState("");
  const [showRoomOptions, setShowRoomOptions] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Verificar se o usuário já tem um apelido salvo
  useEffect(() => {
    // Pequeno atraso para garantir que o playerName foi carregado do localStorage
    const timer = setTimeout(() => {
      if (playerName.trim()) {
        setShowRoomOptions(true);
      }
      setIsInitialized(true);
    }, 100);

    return () => clearTimeout(timer);
  }, [playerName]);

  const handleSetName = () => {
    if (!playerName.trim()) {
      toast({
        title: "Nome obrigatório",
        description: "Por favor, digite seu apelido para continuar",
      });
      return;
    }

    // Mostrar confirmação ao usuário
    toast({
      title: "Apelido confirmado",
      description: `Bem-vindo, ${playerName}!`,
    });

    // Mostrar opções de sala
    setShowRoomOptions(true);
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
      // Garantir a navegação para a sala
      setTimeout(() => navigate(`/room/${roomId}`), 100);
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

    const success = joinRoom(roomCode.trim());
    if (success) {
      // Garantir a navegação para a sala
      setTimeout(() => navigate(`/room/${roomCode.trim()}`), 100);
    }
  };

  const handleChangeNickname = () => {
    setShowRoomOptions(false);
  };

  // Não mostrar nada enquanto verificamos o estado inicial
  if (!isInitialized) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <p>Carregando...</p>
        </div>
      </Layout>
    );
  }

  const handleMoreOptions = (option: string) => {
    switch (option) {
      case "about":
        navigate("/about");
        break;
      case "faq":
        navigate("/faq");
        break;
      case "donations":
        navigate("/donations");
        break;
      case "updates":
        navigate("/updates");
        break;
      case "viewCards":
        // Will be implemented in a future release
        toast({
          title: "Em desenvolvimento",
          description: "Esta funcionalidade estará disponível em breve!",
        });
        break;
      case "exit":
        // Just refresh the page to restart the app
        window.location.reload();
        break;
      default:
        break;
    }
  };

  return (
    <Layout>
      <div className="max-w-md mx-auto space-y-10 py-10">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-primary mb-2 animate-fade-in">
            Cartas Contra
          </h1>
          <p className="text-muted-foreground">
            Um jogo de cartas politicamente incorreto
          </p>
        </div>

        {!showRoomOptions ? (
          // Tela de apelido
          <div
            className="space-y-6 animate-fade-in"
            style={{ animationDelay: "0.2s" }}
          >
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
          </div>
        ) : (
          // Tela de salas
          <div
            className="space-y-6 animate-fade-in"
            style={{ animationDelay: "0.2s" }}
          >
            <div className="bg-muted p-4 rounded-lg text-center mb-4">
              <p>
                Jogando como: <span className="font-bold">{playerName}</span>
              </p>
              <Button
                variant="link"
                onClick={handleChangeNickname}
                className="text-xs p-0 h-auto mt-1"
              >
                Mudar apelido
              </Button>
            </div>

            <div className="space-y-6">
              {/* Nova sala */}
              <Button
                onClick={() => navigate("/create-room")}
                className="w-full h-14 text-base"
                variant="default"
              >
                <span className="mr-2 text-lg">🎮</span> NOVA PARTIDA
              </Button>

              {/* Encontrar salas */}
              <Button
                onClick={() => navigate("/find-rooms")}
                className="w-full h-14 text-base"
                variant="outline"
              >
                <span className="mr-2 text-lg">🔍</span> ENCONTRAR PARTIDAS
              </Button>

              {/* Ver cartas */}
              <Button
                onClick={() => handleMoreOptions("viewCards")}
                className="w-full h-14 text-base"
                variant="outline"
              >
                <span className="mr-2 text-lg">👀</span> VER CARTAS
              </Button>

              {/* Mais opções */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="w-full h-14 text-base" variant="outline">
                    <span className="mr-2 text-lg">⚙️</span> MAIS OPÇÕES
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem onClick={() => handleMoreOptions("about")}>
                    <Info className="mr-2 h-4 w-4" />
                    <span>Sobre o jogo</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleMoreOptions("faq")}>
                    <HelpCircle className="mr-2 h-4 w-4" />
                    <span>Perguntas frequentes</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleMoreOptions("donations")}
                  >
                    <Heart className="mr-2 h-4 w-4" />
                    <span>Contribuições</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleMoreOptions("updates")}
                  >
                    <AlertCircle className="mr-2 h-4 w-4" />
                    <span>Próximas atualizações</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => handleMoreOptions("exit")}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sair</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <div className="space-y-2 mt-4">
                <label htmlFor="roomCode" className="block text-sm font-medium">
                  Entrar em sala existente
                </label>
                <div className="flex space-x-2">
                  <Input
                    id="roomCode"
                    value={roomCode}
                    onChange={(e) => setRoomCode(e.target.value)}
                    placeholder="Digite o código da sala"
                    className="flex-1"
                  />
                  <Button onClick={handleJoinRoom} variant="default">
                    ENTRAR
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Index;
