import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusCircle } from "lucide-react";
import Layout from "@/components/Layout";
import GameCard from "@/components/GameCard";
import { useGame } from "@/contexts/GameContext";
import { WhiteCard } from "@/types/game";
import { useToast } from "@/components/ui/use-toast";

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
  } = useGame();

  const [selectedWhiteCardId, setSelectedWhiteCardId] = useState<string | null>(
    null
  );
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

  // Handle card selection
  const handleCardSelection = (card: WhiteCard) => {
    if (isJudge || currentRoom.status !== "playing" || hasPlayedCard) return;

    setSelectedWhiteCardId(card.id);
    selectCard(card);
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
    if (!testPlayerName || !roomId) return;

    addLocalPlayer(roomId, testPlayerName);
    setTestPlayerName("");
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Room info and game status */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">{currentRoom.name}</h1>
            <p className="text-sm text-muted-foreground">
              Código: {currentRoom.id} |
              {currentRoom.status === "waiting"
                ? " Esperando jogadores"
                : ` Rodada ${currentRoom.round}/${currentRoom.maxRounds}`}
            </p>
          </div>

          {currentRoom.status === "waiting" &&
            currentRoom.players.length >= 2 && (
              <Button onClick={startGame} className="mt-4 md:mt-0">
                Iniciar jogo ({currentRoom.players.length} jogadores)
              </Button>
            )}
        </div>

        {/* Player list and scores */}
        <div className="bg-secondary p-4 rounded-lg mb-6">
          <h2 className="font-semibold mb-2">Jogadores</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {currentRoom.players.map((player) => (
              <div
                key={player.id}
                className={`p-2 rounded-md ${
                  player.isJudge
                    ? "bg-primary text-primary-foreground"
                    : "bg-background"
                }`}
              >
                <p className="font-medium">{player.name}</p>
                <p className="text-sm">
                  {player.score} ponto{player.score !== 1 ? "s" : ""}
                  {player.isJudge && " (Juiz)"}
                </p>
              </div>
            ))}
          </div>

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
                <PlusCircle className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        {/* Game board */}
        {currentRoom.status !== "waiting" && (
          <div className="space-y-6">
            {/* Black card */}
            <div className="flex justify-center">
              {currentRoom.currentBlackCard && (
                <GameCard
                  type="black"
                  text={currentRoom.currentBlackCard.text}
                  className="w-full max-w-sm"
                />
              )}
            </div>

            {/* White cards - shown differently based on game state */}
            {currentRoom.status === "playing" && !isJudge && currentPlayer && (
              <div>
                <h3 className="text-lg font-medium mb-3">Suas cartas</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {currentPlayer.cards.map((card) => (
                    <GameCard
                      key={card.id}
                      type="white"
                      text={card.text}
                      selectable={!hasPlayedCard}
                      selected={selectedWhiteCardId === card.id}
                      onClick={() => handleCardSelection(card)}
                    />
                  ))}
                </div>
                {hasPlayedCard && (
                  <div className="mt-4 text-center text-sm text-muted-foreground">
                    Sua carta foi jogada. Aguardando outros jogadores...
                  </div>
                )}
              </div>
            )}

            {currentRoom.status === "playing" && isJudge && (
              <div className="text-center p-6 bg-muted rounded-lg">
                <p>Você é o juiz desta rodada.</p>
                <p className="text-muted-foreground">
                  Aguardando jogadores escolherem suas cartas...
                </p>
                <p className="mt-2">
                  {currentRoom.playedCards.length} de{" "}
                  {currentRoom.players.length - 1} cartas jogadas
                </p>
              </div>
            )}

            {currentRoom.status === "judging" && (
              <div>
                <h3 className="text-lg font-medium mb-3">
                  {isJudge
                    ? "Escolha a melhor resposta:"
                    : "O juiz está decidindo a melhor resposta..."}
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
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
                    <Button onClick={handleJudgeSubmit}>
                      Confirmar seleção
                    </Button>
                  </div>
                )}
              </div>
            )}

            {currentRoom.status === "finished" && (
              <div className="text-center p-8 bg-muted rounded-lg animate-fade-in">
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
            )}
          </div>
        )}

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
      </div>
    </Layout>
  );
};

export default GameRoom;
