import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { useGame } from "@/contexts/GameContext";

interface InvitationDialogProps {
  roomId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InvitationDialog({
  roomId,
  open,
  onOpenChange,
}: InvitationDialogProps) {
  const [nickname, setNickname] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();
  const { playerName, setPlayerName, joinRoom } = useGame();
  const [joining, setJoining] = useState(false);
  const [joinComplete, setJoinComplete] = useState(false);

  // Pre-populate with existing name if available
  useEffect(() => {
    if (playerName) {
      setNickname(playerName);
    }
  }, [playerName]);

  const handleJoin = async () => {
    if (!nickname.trim()) {
      toast({
        title: "Nome obrigatório",
        description: "Por favor, digite seu apelido para continuar",
      });
      return;
    }

    // Validação de tamanho mínimo
    if (nickname.trim().length < 3) {
      toast({
        title: "Nome muito curto",
        description: "Seu apelido deve ter pelo menos 3 caracteres",
      });
      return;
    }

    setJoining(true);

    try {
      // Set player name only after validation is complete
      setPlayerName(nickname.trim());

      // Sinalizar que o diálogo está sendo fechado para evitar redirecionamento automático
      setJoinComplete(true);

      // Fechar o diálogo primeiro
      onOpenChange(false);

      // Após fechar o diálogo, a lógica de entrada na sala será tratada pelo componente GameRoom
      // através do seu useEffect que monitora alterações no playerName
    } catch (error) {
      console.error("Erro ao entrar na sala:", error);
      setJoining(false);
      setJoinComplete(false);
    }
  };

  // Handle dialog close
  const handleOpenChange = (open: boolean) => {
    // Se o diálogo está fechando (open = false) e não estamos em processo de joining ou joinComplete
    if (!open && !joining && !joinComplete) {
      // Redirecionar para home apenas se fechou sem entrar
      navigate("/");
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Entrar na sala</DialogTitle>
          <DialogDescription>
            Você foi convidado para uma partida! Informe seu apelido para
            entrar.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label htmlFor="nickname" className="text-sm font-medium">
              Seu apelido
            </label>
            <Input
              id="nickname"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="Digite seu apelido"
              autoFocus
              disabled={joining}
              autoComplete="off"
              onBlur={() => {
                // Do nothing, just to prevent immediate action on mobile
              }}
              onKeyDown={(e) => {
                if (
                  e.key === "Enter" &&
                  nickname.trim() &&
                  nickname.trim().length >= 3
                ) {
                  handleJoin();
                }
              }}
            />
          </div>
        </div>
        <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:justify-between">
          <Button
            variant="outline"
            onClick={() => navigate("/")}
            disabled={joining}
            className="w-full sm:w-auto"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleJoin}
            disabled={joining || !nickname.trim() || nickname.trim().length < 3}
            className="w-full sm:w-auto"
          >
            {joining ? "Entrando..." : "Entrar na sala"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
