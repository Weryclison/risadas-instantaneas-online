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
import { RoundTimer } from "@/components/RoundTimer";
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
import { InvitationDialog } from "@/components/InvitationDialog";

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
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [timerActive, setTimerActive] = useState(false);

  useEffect(() => {
    if (!roomId) {
      navigate("/");
      return;
    }

    // If no player name, show invite dialog instead of redirecting
    if (!playerName) {
      setShowInviteDialog(true);
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

  // Close the invite dialog if player name is set from elsewhere
  useEffect(() => {
    if (playerName && showInviteDialog) {
      setShowInviteDialog(false);
    }
  }, [playerName, showInviteDialog]);

  // Reset pending card when changing player simulation
  useEffect(() => {
    setPendingCard(null);
    setSelectedWhiteCardId(null);
  }, [simulatedPlayerName]);

  // Ativar o temporizador quando a rodada começar
  useEffect(() => {
    if (currentRoom?.status === "playing") {
      const currentPlayer = getPlayerFromCurrentRoom();
      const hasPlayedCard =
        currentPlayer &&
        currentRoom.playedCards.some((pc) => pc.playerId === currentPlayer.id);

      // Ativar o temporizador apenas para jogadores que não são juízes e ainda não jogaram
      if (currentPlayer && !currentPlayer.isJudge && !hasPlayedCard) {
        setTimerActive(true);
      } else {
        setTimerActive(false);
      }
    } else {
      setTimerActive(false);
    }
  }, [currentRoom?.status, currentRoom?.playedCards, getPlayerFromCurrentRoom]);

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

  // If invitation dialog is showing, render just that
  if (showInviteDialog) {
    return (
      <>
        <InvitationDialog
          roomId={roomId || ""}
          open={showInviteDialog}
          onOpenChange={setShowInviteDialog}
        />
        <Layout>
          <div className="flex justify-center items-center h-64">
            <p>Entrando na sala...</p>
          </div>
        </Layout>
      </>
    );
  }

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

    // Cancela o temporizador quando o jogador confirma uma carta
    setTimerActive(false);

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

    // Mostrar efeito visual na carta selecionada
    const selectedCard = currentRoom.playedCards[judgeSelection];

    // Temporariamente marcamos a carta como vencedora para mostrar o efeito visual
    if (selectedCard) {
      // @ts-ignore - Adicionando temporariamente a propriedade
      selectedCard.isWinner = true;

      // Forçar re-render para mostrar o efeito visual
      setJudgeSelection(judgeSelection);

      // Aguardar 1 segundo para o efeito visual simples
      setTimeout(() => {
        submitJudgement(judgeSelection);
        setJudgeSelection(null);
      }, 1000);
    } else {
      submitJudgement(judgeSelection);
      setJudgeSelection(null);
    }
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

  // Função para lidar com o timeout do temporizador
  const handleTimerTimeout = () => {
    // Se o jogador não selecionou uma carta, seleciona uma aleatoriamente
    const currentPlayer = getPlayerFromCurrentRoom();

    if (
      currentPlayer &&
      !currentPlayer.isJudge &&
      currentRoom?.status === "playing"
    ) {
      // Verifica se o jogador já jogou uma carta
      const hasPlayedCard = currentRoom.playedCards.some(
        (pc) => pc.playerId === currentPlayer.id
      );

      if (!hasPlayedCard && currentPlayer.cards.length > 0) {
        // Seleciona uma carta aleatória
        const randomIndex = Math.floor(
          Math.random() * currentPlayer.cards.length
        );
        const randomCard = currentPlayer.cards[randomIndex];

        toast({
          title: "Tempo esgotado!",
          description: "Uma carta foi selecionada aleatoriamente.",
        });

        // Submete a carta
        selectCard(randomCard);
      }
    }

    setTimerActive(false);
  };

  // Função para cancelar o temporizador (quando o jogador seleciona uma carta manualmente)
  const handleTimerCancel = () => {
    setTimerActive(false);
  };

  return (
    <Layout>
      <div className="container mx-auto p-4 space-y-6">
        {/* Room Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
          <div>
            <h1 className="text-3xl font-bold">{currentRoom.name}</h1>
            <p className="text-sm text-muted-foreground">
              Rodada: {currentRoom.round} | Objetivo: {currentRoom.targetScore}{" "}
              pontos · {currentRoom.players.length} jogadores
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

        {/* Main Game Area with 12 column grid */}
        <div className="grid grid-cols-12 gap-4">
          {/* Left Column - Black Card (3 cols) */}
          <div className="col-span-12 md:col-span-3 space-y-4">
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

                  {/* Temporizador da rodada */}
                  {!isJudge && !hasPlayedCard && (
                    <div className="mt-4">
                      <RoundTimer
                        duration={currentRoom.roundDuration}
                        onTimeout={handleTimerTimeout}
                        isActive={timerActive}
                        onCancel={handleTimerCancel}
                      />
                    </div>
                  )}

                  {/* Card Selection Confirmation Dialog */}
                  {pendingCard && !hasPlayedCard && !isJudge && (
                    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                      <div className="bg-black border-2 border-white dark:border-primary shadow-xl rounded-lg p-6 max-w-md w-full">
                        <h3 className="text-xl font-bold mb-4 text-white">
                          Confirmar jogada
                        </h3>
                        <p className="mb-4 text-white">
                          Tem certeza que deseja jogar esta carta?
                        </p>

                        <div className="flex justify-center mb-6">
                          <GameCard text={pendingCard.text} type="white" />
                        </div>

                        <div className="flex space-x-3 justify-end">
                          <Button
                            variant="outline"
                            onClick={cancelCardSelection}
                            className="bg-transparent text-white border-white hover:bg-slate-800"
                          >
                            Cancelar
                          </Button>
                          <Button
                            variant="default"
                            onClick={confirmCardSelection}
                            className="bg-purple-600 hover:bg-purple-700 text-white"
                          >
                            Confirmar
                          </Button>
                        </div>
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
                      Confira o resultado no painel principal.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Separator (visible on md screens and above) */}
          <div className="hidden md:block md:col-span-1">
            <div className="h-full flex justify-center">
              <Separator orientation="vertical" className="h-full" />
            </div>
          </div>

          {/* Right Column - Player Cards (8 cols) */}
          <div className="col-span-12 md:col-span-8 space-y-6">
            {/* Área reservada para cartas enviadas - sempre visível durante o jogo */}
            {currentRoom.status !== "waiting" &&
              currentRoom.status !== "finished" && (
                <div className="bg-card p-6 rounded-lg shadow">
                  <h2 className="text-xl font-semibold mb-4">
                    {currentRoom.status === "judging"
                      ? isJudge
                        ? "Escolha a melhor resposta:"
                        : "Respostas dos jogadores (o juiz está decidindo):"
                      : "Cartas Enviadas"}
                  </h2>

                  {currentRoom.playedCards.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {currentRoom.playedCards.map((playedCard, index) => {
                        const isCurrentPlayerCard =
                          playedCard.playerId === currentPlayer?.id;
                        // Verificar se esta carta foi a vencedora (quando existir esta propriedade)
                        const isWinner = Boolean(
                          // @ts-ignore - lidando com propriedade que pode ser adicionada depois
                          playedCard.isWinner
                        );

                        // Durante a fase de julgamento, mostrar todas as cartas
                        if (currentRoom.status === "judging") {
                          return (
                            <div
                              key={index}
                              className={`cursor-pointer transition-all transform ${
                                isJudge ? "hover:scale-105" : ""
                              } ${
                                judgeSelection === index
                                  ? "selected-judge-card"
                                  : ""
                              }`}
                              onClick={() =>
                                isJudge ? handleJudgeSelection(index) : null
                              }
                            >
                              <GameCard
                                text={playedCard.card.text}
                                type="white"
                                winner={isWinner}
                                footerText=""
                              />
                            </div>
                          );
                        } else {
                          // Durante a fase de jogo, mostrar cartas face-down para outros jogadores
                          return (
                            <div key={index} className="flex justify-center">
                              <GameCard
                                text={playedCard.card.text}
                                type="white"
                                footerText=""
                                faceDown={!isCurrentPlayerCard}
                              />
                            </div>
                          );
                        }
                      })}
                    </div>
                  ) : (
                    // Espaços reservados para cartas - quando nenhuma carta foi jogada ainda
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {Array.from({
                        length: currentRoom.players.filter((p) => !p.isJudge)
                          .length,
                      }).map((_, index) => (
                        <div key={index} className="flex justify-center">
                          <div className="border border-dashed border-slate-300 rounded-lg h-36 w-full flex items-center justify-center bg-slate-100/10">
                            {/* Sem texto, apenas o espaço reservado */}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Botão de confirmação para o juiz */}
                  {currentRoom.status === "judging" &&
                    isJudge &&
                    judgeSelection !== null && (
                      <div className="mt-4 flex justify-center">
                        <Button
                          className="w-full max-w-sm px-8"
                          onClick={handleJudgeSubmit}
                        >
                          Confirmar Seleção
                        </Button>
                      </div>
                    )}
                </div>
              )}

            {/* Exibição do campeão quando o jogo termina */}
            {currentRoom.status === "finished" && (
              <div className="bg-card p-10 rounded-lg shadow flex flex-col items-center justify-center min-h-[300px]">
                <h2 className="text-4xl font-bold mb-6 text-center">
                  Fim de Jogo!
                </h2>
                {currentRoom.winner ? (
                  <>
                    <div className="flex items-center justify-center mb-4">
                      <Crown className="h-12 w-12 text-yellow-500 mr-2" />
                      <h3 className="text-3xl font-bold text-center">
                        {currentRoom.winner.name}
                      </h3>
                    </div>
                    <p className="text-xl text-center mb-8">
                      Venceu com {currentRoom.winner.score} pontos!
                    </p>
                  </>
                ) : (
                  <p className="text-2xl text-center mb-8">
                    O jogo terminou em empate!
                  </p>
                )}
                <Button
                  size="lg"
                  onClick={() => startGame()}
                  className="px-8 py-6 text-lg"
                >
                  Jogar Novamente
                </Button>
              </div>
            )}

            {/* Player's Hand */}
            {(currentRoom.status === "playing" ||
              currentRoom.status === "judging") &&
              currentPlayer && (
                <div className="bg-card p-6 rounded-lg shadow">
                  <h2 className="text-xl font-semibold mb-4">
                    {isJudge ? "Sua Mão" : "Sua Mão"}
                  </h2>

                  {isJudge ? (
                    // Mostrar cartas do juiz com um overlay centralizado
                    <div className="relative">
                      {/* Overlay centralizado para o juiz */}
                      <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/50 rounded-lg">
                        <div className="bg-black/80 text-white px-6 py-3 rounded-lg text-lg font-medium">
                          Você é o juiz desta rodada
                        </div>
                      </div>

                      {/* Cartas do juiz */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {currentPlayer.cards.map((card) => (
                          <div key={card.id}>
                            <GameCard
                              text={card.text}
                              type="white"
                              disabled={true}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : currentPlayer.cards.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      Você não tem cartas na mão
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {currentPlayer.cards.map((card) => (
                        <div
                          key={card.id}
                          className={`cursor-pointer transition-all ${
                            !hasPlayedCard && currentRoom.status === "playing"
                              ? "hover:scale-105"
                              : ""
                          } ${
                            selectedWhiteCardId === card.id
                              ? "selected-player-card"
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
                              hasPlayedCard || currentRoom.status !== "playing"
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

        {/* Players List (moved to bottom) */}
        <div className="bg-card rounded-lg p-4 shadow mt-6">
          <h2 className="text-xl font-semibold mb-3">Jogadores</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
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
                disabled={currentRoom.players.length >= currentRoom.maxPlayers}
              >
                <UserPlus className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Para testes locais apenas
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default GameRoom;
