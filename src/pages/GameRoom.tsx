import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  PlusCircle,
  UserPlus,
  User,
  Check,
  X,
  Crown,
  Copy,
  Link,
} from "lucide-react";
import Layout from "@/components/Layout";
import GameCard from "@/components/GameCard";
import { useGame } from "@/contexts/GameContext";
import { WhiteCard, Player } from "@/types/game";
import { useToast } from "@/components/ui/use-toast";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const GameRoom = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const {
    currentRoom,
    joinRoom,
    startGame,
    selectCard,
    submitJudgement,
    playerName,
    addLocalPlayer,
    getPlayerFromCurrentRoom,
    simulatedPlayerName,
    simulatePlayer,
    leaveRoom,
    isLoading,
  } = useGame();

  const [selectedWhiteCardId, setSelectedWhiteCardId] = useState<string | null>(
    null
  );
  const [pendingCard, setPendingCard] = useState<WhiteCard | null>(null);
  const [judgeSelection, setJudgeSelection] = useState<number | null>(null);
  const [testPlayerName, setTestPlayerName] = useState("");
  const [joiningRoom, setJoiningRoom] = useState(false);

  useEffect(() => {
    if (!roomId) {
      navigate("/");
      return;
    }

    if (!playerName) {
      toast({
        title: "Nome não definido",
        description: "Por favor, defina seu apelido primeiro",
      });
      navigate("/");
      return;
    }

    // Join room if not already in it
    if (!currentRoom || currentRoom.id !== roomId) {
      setJoiningRoom(true);
      joinRoom(roomId)
        .then((success) => {
          if (!success) {
            toast({
              title: "Erro",
              description: "Não foi possível entrar na sala",
              variant: "destructive",
            });
            navigate("/");
          }
        })
        .catch((error) => {
          console.error("Erro ao entrar na sala:", error);
          toast({
            title: "Erro",
            description: "Ocorreu um erro ao tentar entrar na sala",
            variant: "destructive",
          });
          navigate("/");
        })
        .finally(() => {
          setJoiningRoom(false);
        });
    }
  }, [roomId, navigate, playerName, currentRoom, joinRoom, toast]);

  // Reset pending card when changing player simulation
  useEffect(() => {
    setPendingCard(null);
    setSelectedWhiteCardId(null);
  }, [simulatedPlayerName]);

  const handleExit = () => {
    leaveRoom();
    navigate("/");
  };

  const handleCopyInvite = () => {
    const inviteUrl = `${window.location.origin}/room/${roomId}`;
    navigator.clipboard
      .writeText(inviteUrl)
      .then(() => {
        toast({
          title: "Link copiado!",
          description: "Compartilhe com seus amigos para jogar juntos.",
        });
      })
      .catch((error) => {
        console.error("Erro ao copiar link:", error);
        toast({
          title: "Erro",
          description: "Não foi possível copiar o link. Tente novamente.",
          variant: "destructive",
        });
      });
  };

  if (isLoading || joiningRoom) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <p>Carregando sala...</p>
        </div>
      </Layout>
    );
  }

  if (!currentRoom) {
    return (
      <Layout>
        <div className="flex flex-col justify-center items-center h-64 space-y-4">
          <p>Sala não encontrada ou você não tem acesso a ela.</p>
          <Button onClick={() => navigate("/")}>
            Voltar para a página inicial
          </Button>
        </div>
      </Layout>
    );
  }

  // Find current player
  const currentPlayer = getPlayerFromCurrentRoom();
  const isJudge = currentPlayer?.isJudge || false;

  // Check if player has already played a card this round
  const hasPlayedCard =
    currentPlayer &&
    currentRoom.playedCards.some((pc) => pc.playerId === currentPlayer.id);

  // Verify if all non-judge players have played
  const allPlayersPlayed =
    currentRoom.playedCards.length ===
    currentRoom.players.filter((p) => !p.isJudge).length;

  // Handle initial card selection
  const handleCardSelection = (card: WhiteCard) => {
    if (currentRoom.status !== "playing" || hasPlayedCard) return;

    // Set as pending for confirmation
    setPendingCard(card);
    setSelectedWhiteCardId(card.id);
  };

  // Confirm card selection
  const confirmCardSelection = () => {
    if (!pendingCard) return;

    selectCard(pendingCard);
    toast({
      title: "Carta enviada",
      description: "Sua escolha foi confirmada",
    });

    // Reset pending state but keep selected state for visual indication
    setPendingCard(null);
  };

  // Cancel card selection
  const cancelCardSelection = () => {
    setPendingCard(null);
    setSelectedWhiteCardId(null);
  };

  // Handle judge selection
  const handleJudgeSelection = (index: number) => {
    if (!isJudge || currentRoom.status !== "judging") return;
    setJudgeSelection(index);
  };

  // Submit judge's final decision
  const handleJudgeSubmit = () => {
    if (judgeSelection === null) return;
    submitJudgement(judgeSelection);
    setJudgeSelection(null);
  };

  // Add a test player to the room
  const handleAddTestPlayer = () => {
    if (!testPlayerName.trim() || !roomId) return;

    // Prevent duplicate names or overly long names
    if (testPlayerName.trim().length > 20) {
      toast({
        title: "Nome muito longo",
        description: "O nome deve ter no máximo 20 caracteres",
      });
      return;
    }

    addLocalPlayer(roomId, testPlayerName.trim());
    setTestPlayerName("");
  };

  // Simulate a player
  const handleSimulatePlayer = (name: string) => {
    // If clicking current simulated player, return to original
    if (name === simulatedPlayerName) {
      simulatePlayer(null);
      toast({
        title: "Modo normal",
        description: `Voltando para ${playerName}`,
      });
    } else {
      simulatePlayer(name);
      toast({
        title: "Simulando jogador",
        description: `Agora você está jogando como ${name}`,
      });
    }
    // Reset selection state when switching players
    setSelectedWhiteCardId(null);
    setJudgeSelection(null);
    setPendingCard(null);
  };

  // Render a player badge with their status
  const renderPlayerBadge = (player: Player) => {
    const isCurrentPlayer = player.name === (simulatedPlayerName || playerName);
    const hasPlayed = currentRoom.playedCards.some(
      (pc) => pc.playerId === player.id
    );

    return (
      <div
        key={player.id}
        className={`flex items-center justify-between p-2 rounded-md mb-2 ${
          player.isJudge
            ? "bg-primary text-primary-foreground"
            : "bg-background"
        } ${
          simulatedPlayerName === player.name ? "ring-2 ring-yellow-500" : ""
        } ${
          player.name === playerName && !simulatedPlayerName
            ? "ring-2 ring-blue-500"
            : ""
        }`}
      >
        <div className="flex items-center">
          {player.isJudge && <Crown className="h-4 w-4 mr-2" />}
          <span className="font-medium">{player.name}</span>
          {currentRoom.status === "playing" && !player.isJudge && (
            <span className="ml-2">
              {hasPlayed ? (
                <Badge variant="outline" className="bg-green-100">
                  <Check className="h-3 w-3 mr-1" />
                  Jogou
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-amber-50">
                  Esperando
                </Badge>
              )}
            </span>
          )}
        </div>

        <div className="flex items-center space-x-1">
          <Badge className="bg-blue-500">{player.score}</Badge>
          {/* Only show simulate button for other players */}
          {player.name !== playerName && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => handleSimulatePlayer(player.name)}
                  >
                    <User className="h-3 w-3" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {simulatedPlayerName === player.name
                    ? "Voltar para seu jogador"
                    : `Jogar como ${player.name}`}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </div>
    );
  };

  return (
    <Layout>
      <div className="container mx-auto p-4 space-y-6">
        {/* Room Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
          <div>
            <h1 className="text-3xl font-bold">{currentRoom.name}</h1>
            <p className="text-sm text-muted-foreground">
              Rodada {currentRoom.round} de {currentRoom.maxRounds} ·{" "}
              {currentRoom.players.length} jogadores
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyInvite}
              className="flex items-center gap-1"
            >
              <Link className="h-4 w-4 mr-1" />
              Convidar
            </Button>
            <Button variant="outline" size="sm" onClick={handleExit}>
              Sair da Sala
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Column - Players and Controls */}
          <div className="space-y-4 order-2 lg:order-1">
            <div className="bg-card rounded-lg p-4 shadow">
              <h2 className="text-xl font-semibold mb-3">Jogadores</h2>
              <div className="space-y-2">
                {currentRoom.players.map((player) => renderPlayerBadge(player))}
              </div>

              {/* Add Test Player Form */}
              <div className="mt-4 pt-4 border-t">
                <h3 className="text-sm font-medium mb-2">
                  Adicionar Jogador de Teste
                </h3>
                <div className="flex space-x-2">
                  <Input
                    placeholder="Nome do jogador"
                    value={testPlayerName}
                    onChange={(e) => setTestPlayerName(e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    size="sm"
                    onClick={handleAddTestPlayer}
                    disabled={
                      currentRoom.players.length >= currentRoom.maxPlayers
                    }
                  >
                    <UserPlus className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Para testes locais apenas
                </p>
              </div>
            </div>

            {/* Game Controls */}
            <div className="bg-card rounded-lg p-4 shadow">
              <h2 className="text-xl font-semibold mb-3">Controles</h2>

              {/* Game not started */}
              {currentRoom.status === "waiting" && (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground mb-2">
                    A partida ainda não começou. Aguarde o início ou inicie você
                    mesmo.
                  </p>
                  <Button
                    className="w-full"
                    onClick={() => startGame()}
                    disabled={currentRoom.players.length < 2}
                  >
                    Iniciar Jogo
                  </Button>
                  {currentRoom.players.length < 2 && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Você precisa de pelo menos 2 jogadores para começar
                    </p>
                  )}
                </div>
              )}

              {/* Game in progress */}
              {currentRoom.status === "playing" && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium mb-1">Status:</h3>
                    <p className="text-sm">
                      {isJudge
                        ? "Você é o juiz desta rodada. Aguarde os jogadores escolherem suas cartas."
                        : hasPlayedCard
                        ? "Você já jogou sua carta. Aguarde os outros jogadores."
                        : "Selecione uma carta da sua mão para responder à carta preta."}
                    </p>
                  </div>

                  {pendingCard && !hasPlayedCard && !isJudge && (
                    <div className="border p-3 rounded-md bg-muted/30">
                      <h3 className="text-sm font-medium mb-2">
                        Confirmar jogada:
                      </h3>
                      <p className="text-sm mb-3">"{pendingCard.text}"</p>
                      <div className="flex space-x-2">
                        <Button
                          variant="default"
                          size="sm"
                          onClick={confirmCardSelection}
                          className="flex-1"
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Confirmar
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={cancelCardSelection}
                          className="flex-1"
                        >
                          <X className="h-4 w-4 mr-1" />
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Judging Phase */}
              {currentRoom.status === "judging" && isJudge && (
                <div className="space-y-4">
                  <p className="text-sm">
                    Como juiz, selecione a melhor resposta entre as cartas
                    jogadas.
                  </p>
                  {judgeSelection !== null && (
                    <Button className="w-full" onClick={handleJudgeSubmit}>
                      Confirmar Seleção
                    </Button>
                  )}
                </div>
              )}

              {/* Judging Phase - Non-Judge */}
              {currentRoom.status === "judging" && !isJudge && (
                <p className="text-sm">
                  O juiz está escolhendo a melhor resposta. Aguarde o resultado.
                </p>
              )}

              {/* Game Finished */}
              {currentRoom.status === "finished" && (
                <div className="space-y-4">
                  <div className="text-center py-2">
                    <h3 className="text-lg font-semibold mb-1">
                      Jogo Finalizado!
                    </h3>
                    <p className="text-sm">
                      {currentRoom.winner
                        ? `${currentRoom.winner.name} venceu com ${currentRoom.winner.score} pontos!`
                        : "O jogo terminou em empate!"}
                    </p>
                  </div>
                  <Button className="w-full" onClick={() => startGame()}>
                    Jogar Novamente
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Center Column - Game Content */}
          <div className="lg:col-span-3 space-y-6 order-1 lg:order-2">
            {/* Black Card Section */}
            <div className="bg-card p-6 rounded-lg shadow-lg">
              <h2 className="text-xl font-semibold mb-4">Carta da Rodada</h2>

              {currentRoom.status === "waiting" ? (
                <div className="flex flex-col items-center justify-center p-8 bg-muted/20 rounded-lg">
                  <p className="text-center text-muted-foreground">
                    O jogo ainda não começou. Clique em "Iniciar Jogo" quando
                    todos estiverem prontos.
                  </p>
                </div>
              ) : (
                <div className="flex justify-center">
                  {currentRoom.currentBlackCard ? (
                    <GameCard
                      text={currentRoom.currentBlackCard.text}
                      type="black"
                      className="max-w-md"
                    />
                  ) : (
                    <p className="text-muted-foreground">
                      Nenhuma carta disponível
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Judge Selection Area */}
            {currentRoom.status === "judging" && (
              <div className="bg-card p-6 rounded-lg shadow">
                <h2 className="text-xl font-semibold mb-4">
                  {isJudge
                    ? "Escolha a melhor resposta:"
                    : "Respostas dos jogadores (o juiz está decidindo):"}
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {currentRoom.playedCards.map((playedCard, index) => (
                    <div
                      key={index}
                      className={`cursor-pointer transition-all transform ${
                        isJudge ? "hover:scale-105" : ""
                      } ${
                        judgeSelection === index
                          ? "ring-4 ring-primary ring-offset-2"
                          : ""
                      }`}
                      onClick={() =>
                        isJudge ? handleJudgeSelection(index) : null
                      }
                    >
                      <GameCard
                        text={playedCard.card.text}
                        type="white"
                        // When judging is complete, show player names
                        footerText={
                          currentRoom.status === "finished"
                            ? playedCard.playerName
                            : isJudge
                            ? `Carta ${index + 1}`
                            : ""
                        }
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Player's Hand */}
            {(currentRoom.status === "playing" ||
              currentRoom.status === "judging") &&
              !isJudge &&
              currentPlayer && (
                <div className="bg-card p-6 rounded-lg shadow">
                  <h2 className="text-xl font-semibold mb-4">Sua Mão</h2>

                  {currentPlayer.cards.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      Você não tem cartas na mão
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {currentPlayer.cards.map((card) => (
                        <div
                          key={card.id}
                          className={`cursor-pointer transition-all ${
                            !hasPlayedCard && currentRoom.status === "playing"
                              ? "hover:scale-105"
                              : ""
                          } ${
                            selectedWhiteCardId === card.id
                              ? "ring-4 ring-primary ring-offset-2"
                              : ""
                          }`}
                          onClick={() =>
                            !hasPlayedCard && currentRoom.status === "playing"
                              ? handleCardSelection(card)
                              : null
                          }
                        >
                          <GameCard
                            text={card.text}
                            type="white"
                            disabled={
                              hasPlayedCard || currentRoom.status === "judging"
                            }
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default GameRoom;
