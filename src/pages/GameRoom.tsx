import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusCircle, UserPlus, User, Check, X, Crown } from "lucide-react";
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
  } = useGame();

  const [selectedWhiteCardId, setSelectedWhiteCardId] = useState<string | null>(
    null
  );
  const [pendingCard, setPendingCard] = useState<WhiteCard | null>(null);
  const [judgeSelection, setJudgeSelection] = useState<number | null>(null);
  const [testPlayerName, setTestPlayerName] = useState("");

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
      joinRoom(roomId);
    }
  }, [roomId, navigate, playerName, currentRoom, joinRoom, toast]);

  // Reset pending card when changing player simulation
  useEffect(() => {
    setPendingCard(null);
    setSelectedWhiteCardId(null);
  }, [simulatedPlayerName]);

  if (!currentRoom) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <p>Carregando sala...</p>
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
        </div>

        <div className="flex items-center space-x-2">
          {currentRoom.status === "playing" && !player.isJudge && (
            <Badge
              variant={hasPlayed ? "default" : "outline"}
              className="text-xs"
            >
              {hasPlayed ? "Enviou" : "Pendente"}
            </Badge>
          )}

          <span className="text-xs mr-2">
            {player.score} ponto{player.score !== 1 ? "s" : ""}
          </span>

          {!isCurrentPlayer && (
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
                    : "Simular este jogador"}
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
      <div className="space-y-6">
        {/* Room info and game status */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-2">
          <div>
            <h1 className="text-2xl font-bold">{currentRoom.name}</h1>
            <p className="text-sm text-muted-foreground">
              Código: {currentRoom.id} |
              {currentRoom.status === "waiting"
                ? " Esperando jogadores"
                : ` Rodada ${currentRoom.round}/${currentRoom.maxRounds}`}
            </p>
            {simulatedPlayerName && (
              <Badge variant="outline" className="mt-1 bg-yellow-500/10">
                Simulando: {simulatedPlayerName}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 ml-1"
                  onClick={() => simulatePlayer(null)}
                >
                  ✕
                </Button>
              </Badge>
            )}
          </div>

          {currentRoom.status === "waiting" &&
            currentRoom.players.length >= 2 && (
              <Button onClick={startGame} className="mt-4 md:mt-0">
                Iniciar jogo ({currentRoom.players.length} jogadores)
              </Button>
            )}
        </div>

        {/* Waiting for more players */}
        {currentRoom.status === "waiting" && currentRoom.players.length < 2 && (
          <div className="text-center p-8 bg-muted rounded-lg">
            <p className="text-lg">Aguardando mais jogadores para iniciar...</p>
            <p className="text-sm text-muted-foreground mt-2">
              Mínimo de 2 jogadores necessários para o modo local, atualmente:{" "}
              {currentRoom.players.length}
            </p>
            <p className="mt-4">
              Compartilhe o código da sala:{" "}
              <span className="font-bold">{currentRoom.id}</span>
            </p>
          </div>
        )}

        {/* For testing: Add fake players */}
        {currentRoom.status === "waiting" && (
          <div className="mt-4 flex space-x-2">
            <Input
              placeholder="Nome do jogador de teste"
              value={testPlayerName}
              onChange={(e) => setTestPlayerName(e.target.value)}
              className="w-56"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={handleAddTestPlayer}
              title="Adicionar jogador de teste"
            >
              <UserPlus className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Game board - New Layout */}
        {currentRoom.status !== "waiting" && (
          <div className="space-y-6">
            {/* Game layout */}
            <div className="game-layout">
              {/* Left side - Question */}
              <div className="game-question">
                <h3 className="text-lg font-medium mb-3">A pergunta</h3>
                {currentRoom.currentBlackCard && (
                  <GameCard
                    type="black"
                    text={currentRoom.currentBlackCard.text}
                    className="w-full"
                  />
                )}
              </div>

              {/* Separator */}
              <div className="separator-container">
                <div className="vertical-separator"></div>
              </div>
              <div className="block md:hidden">
                <Separator className="my-4" />
              </div>

              {/* Right side - Answers */}
              <div className="game-answers">
                <h3 className="answers-title">
                  {currentRoom.status === "judging"
                    ? "Respostas para julgar"
                    : "Respostas enviadas"}
                </h3>

                {/* Judging phase - Show all cards */}
                {currentRoom.status === "judging" && (
                  <div>
                    <div className="answer-cards-grid">
                      {currentRoom.playedCards.map((playedCard, index) => (
                        <GameCard
                          key={index}
                          type="white"
                          text={playedCard.card.text}
                          selectable={isJudge}
                          selected={isJudge && judgeSelection === index}
                          onClick={() => isJudge && handleJudgeSelection(index)}
                        />
                      ))}
                    </div>
                    {isJudge && judgeSelection !== null && (
                      <div className="mt-6 flex justify-center">
                        <Button
                          onClick={handleJudgeSubmit}
                          className="flex items-center"
                        >
                          <Crown className="mr-2 h-4 w-4" />
                          Confirmar vencedor
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                {/* Playing phase - Show card backs for others */}
                {currentRoom.status === "playing" && (
                  <div>
                    <div className="answer-cards-grid">
                      {/* Show actual cards for current player */}
                      {currentRoom.playedCards
                        .filter(
                          (pc) =>
                            pc.playerName ===
                            (simulatedPlayerName || playerName)
                        )
                        .map((playedCard, index) => (
                          <div key={index} className="relative">
                            <GameCard
                              type="white"
                              text={playedCard.card.text}
                              className="opacity-75"
                            />
                            <span className="card-badge">Sua carta</span>
                          </div>
                        ))}

                      {/* Show card backs for other players */}
                      {currentRoom.playedCards
                        .filter(
                          (pc) =>
                            pc.playerName !==
                            (simulatedPlayerName || playerName)
                        )
                        .map((_, index) => (
                          <div key={`back-${index}`} className="card-back">
                            <span className="sr-only">
                              Carta de outro jogador
                            </span>
                          </div>
                        ))}

                      {/* Placeholder for remaining cards */}
                      {Array.from({
                        length: Math.max(
                          0,
                          currentRoom.players.filter((p) => !p.isJudge).length -
                            currentRoom.playedCards.length
                        ),
                      }).map((_, index) => (
                        <div
                          key={`placeholder-${index}`}
                          className="border border-dashed border-gray-300 rounded-md h-52 flex items-center justify-center text-muted-foreground"
                        >
                          <span>Aguardando</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Selected card confirmation - floats on top when active */}
            {pendingCard &&
              currentRoom.status === "playing" &&
              !hasPlayedCard && (
                <div className="fixed inset-0 flex items-center justify-center bg-background/80 z-50">
                  <div className="bg-card p-6 rounded-lg shadow-lg max-w-md w-full">
                    <h3 className="text-lg font-medium mb-4 text-center">
                      Confirmar seleção
                    </h3>
                    <div className="mb-6 transform transition-all duration-200 hover:scale-105">
                      <GameCard
                        type="white"
                        text={pendingCard.text}
                        selected={true}
                        className="max-w-sm shadow-lg mx-auto"
                      />
                    </div>
                    <div className="flex space-x-4 justify-center">
                      <Button
                        onClick={confirmCardSelection}
                        className="flex items-center"
                        variant="default"
                      >
                        <Check className="mr-2 h-4 w-4" />
                        Enviar
                      </Button>
                      <Button
                        onClick={cancelCardSelection}
                        className="flex items-center"
                        variant="outline"
                      >
                        <X className="mr-2 h-4 w-4" />
                        Cancelar
                      </Button>
                    </div>
                  </div>
                </div>
              )}

            {/* Player's hand */}
            <div className="mt-8">
              <h3 className="text-lg font-medium mb-3">
                {simulatedPlayerName
                  ? `Cartas de ${simulatedPlayerName}`
                  : "Suas cartas"}
              </h3>

              {/* Show cards even if judge, but with overlay */}
              <div className="relative">
                <div
                  className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 ${
                    pendingCard || (isJudge && currentRoom.status === "playing")
                      ? "opacity-50"
                      : ""
                  }`}
                >
                  {currentPlayer?.cards.map((card) => (
                    <GameCard
                      key={card.id}
                      type="white"
                      text={card.text}
                      selectable={
                        !hasPlayedCard &&
                        !pendingCard &&
                        currentRoom.status === "playing" &&
                        !isJudge
                      }
                      selected={selectedWhiteCardId === card.id}
                      onClick={() => handleCardSelection(card)}
                    />
                  ))}
                </div>

                {isJudge && currentRoom.status === "playing" && (
                  <div className="absolute inset-0 flex items-center justify-center bg-background/50 rounded-lg">
                    <div className="text-center p-6 bg-muted rounded-lg shadow-lg">
                      <p className="font-medium">
                        {simulatedPlayerName
                          ? `${simulatedPlayerName} é o juiz desta rodada`
                          : "Você é o juiz desta rodada"}
                      </p>
                      <p className="text-muted-foreground text-sm mt-2">
                        Aguardando jogadores escolherem suas cartas...
                      </p>
                      <p className="mt-2 text-sm">
                        {currentRoom.playedCards.length} de{" "}
                        {currentRoom.players.length - 1} cartas jogadas
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Player list - Moved to bottom and made vertical */}
            <div className="mt-8 space-y-2">
              <h3 className="text-lg font-medium mb-3">Jogadores</h3>
              <div className="bg-secondary p-4 rounded-lg">
                <div className="flex flex-col">
                  {currentRoom.players.map(renderPlayerBadge)}
                </div>
              </div>
            </div>

            {/* Game finished state */}
            {currentRoom.status === "finished" && (
              <div className="fixed inset-0 flex items-center justify-center bg-background/80 z-50">
                <div className="text-center p-8 bg-card rounded-lg animate-fade-in shadow-lg max-w-lg w-full">
                  <h3 className="text-2xl font-bold mb-4">Fim de Jogo!</h3>
                  {currentRoom.winner && (
                    <p className="text-xl mb-4">
                      {currentRoom.winner.name} venceu com{" "}
                      {currentRoom.winner.score} pontos!
                    </p>
                  )}
                  <Button onClick={() => navigate("/")} className="mt-4">
                    Voltar ao início
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default GameRoom;
