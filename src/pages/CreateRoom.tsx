import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { useGame } from "@/contexts/GameContext";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Lock, Users, UserPlus, ArrowLeft } from "lucide-react";

const CreateRoom = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { playerName, createRoom } = useGame();

  const [roomName, setRoomName] = useState("");
  const [hasPassword, setHasPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [maxPlayers, setMaxPlayers] = useState(8);

  // Handle room creation
  const handleCreateRoom = () => {
    if (!playerName.trim()) {
      toast({
        title: "Nome obrigatório",
        description: "Por favor, retorne e digite seu apelido para continuar",
      });
      navigate("/");
      return;
    }

    if (!roomName.trim()) {
      toast({
        title: "Nome da sala obrigatório",
        description: "Por favor, dê um nome para sua sala",
      });
      return;
    }

    if (hasPassword && !password.trim()) {
      toast({
        title: "Senha obrigatória",
        description: "Se a sala é protegida, você deve definir uma senha",
      });
      return;
    }

    // Create room with the provided settings
    const roomId = createRoom(roomName, hasPassword, password, maxPlayers);
    if (roomId) {
      navigate(`/room/${roomId}`);
    } else {
      toast({
        title: "Erro",
        description: "Não foi possível criar a sala. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto py-6 px-4 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Criar Nova Sala</h1>
          <Button
            onClick={() => navigate("/")}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Detalhes da Sala</CardTitle>
            <CardDescription>
              Configure sua sala de jogo com as opções abaixo
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="roomName">Nome da Sala</Label>
              <Input
                id="roomName"
                placeholder="Digite um nome para sua sala"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="hasPassword" className="text-base">
                    Proteger com Senha
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Apenas jogadores com a senha poderão entrar
                  </p>
                </div>
                <Switch
                  id="hasPassword"
                  checked={hasPassword}
                  onCheckedChange={setHasPassword}
                />
              </div>

              {hasPassword && (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-5 duration-300">
                  <Label htmlFor="password">Senha da Sala</Label>
                  <div className="flex items-center space-x-2">
                    <Lock className="text-muted-foreground h-4 w-4" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="Digite uma senha"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label>Limite de Jogadores: {maxPlayers}</Label>
                  <div className="flex items-center text-muted-foreground">
                    <Users className="h-4 w-4 mr-1" />
                    <span className="text-sm">{maxPlayers}</span>
                  </div>
                </div>
                <Slider
                  defaultValue={[8]}
                  min={2}
                  max={20}
                  step={1}
                  value={[maxPlayers]}
                  onValueChange={(value) => setMaxPlayers(value[0])}
                  className="py-2"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Min: 2</span>
                  <span>Max: 20</span>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleCreateRoom} className="w-full">
              <UserPlus className="mr-2 h-4 w-4" />
              Criar Sala e Entrar
            </Button>
          </CardFooter>
        </Card>
      </div>
    </Layout>
  );
};

export default CreateRoom;
