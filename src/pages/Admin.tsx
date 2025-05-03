import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGame } from "@/contexts/GameContext";
import Layout from "@/components/Layout";
import { useToast } from "@/components/ui/use-toast";
import { Deck } from "@/types/game";
import { Trash2, Edit, BookOpen } from "lucide-react";
import { v4 as uuidv4 } from "uuid";

const Admin = () => {
  const { toast } = useToast();
  const {
    isAdmin,
    adminLogin,
    decks,
    addBlackCard,
    addWhiteCard,
    removeCard,
    addDeck,
    rooms,
    cleanRooms,
  } = useGame();

  const [password, setPassword] = useState("");
  const [selectedDeckId, setSelectedDeckId] = useState<string | null>(null);
  const [newBlackCard, setNewBlackCard] = useState("");
  const [newWhiteCard, setNewWhiteCard] = useState("");
  const [newDeck, setNewDeck] = useState<Partial<Deck>>({
    name: "",
    description: "",
  });

  const handleLogin = () => {
    adminLogin(password);
    setPassword("");
  };

  const handleAddBlackCard = () => {
    if (!selectedDeckId || !newBlackCard.trim()) {
      toast({
        title: "Erro",
        description: "Selecione um baralho e escreva o texto da carta",
      });
      return;
    }

    addBlackCard(selectedDeckId, newBlackCard.trim());
    setNewBlackCard("");
  };

  const handleAddWhiteCard = () => {
    if (!selectedDeckId || !newWhiteCard.trim()) {
      toast({
        title: "Erro",
        description: "Selecione um baralho e escreva o texto da carta",
      });
      return;
    }

    addWhiteCard(selectedDeckId, newWhiteCard.trim());
    setNewWhiteCard("");
  };

  const handleAddDeck = () => {
    if (!newDeck.name || !newDeck.description) {
      toast({
        title: "Erro",
        description: "Nome e descrição são obrigatórios",
      });
      return;
    }

    // Generate a new UUID for the deck
    const newDeckId = uuidv4();

    // Add the new deck with valid ID
    addDeck({
      ...newDeck,
      id: newDeckId,
      blackCards: [],
      whiteCards: [],
      isDefault: false,
    } as Deck);

    // Reset the form
    setNewDeck({ name: "", description: "" });

    // Select the newly created deck
    setTimeout(() => {
      setSelectedDeckId(newDeckId);
    }, 100);

    // Show success message
    toast({
      title: "Baralho criado",
      description: "Novo baralho criado com sucesso!",
    });
  };

  const selectedDeck = selectedDeckId
    ? decks.find((deck) => deck.id === selectedDeckId)
    : null;

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Área do Administrador</h1>

        {!isAdmin ? (
          <div className="bg-card rounded-lg p-6 shadow-sm border border-border">
            <h2 className="text-xl font-semibold mb-4">Login</h2>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium mb-1"
                >
                  Senha
                </label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Digite a senha de administrador"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Use "admin123" para acessar o painel (apenas para
                  demonstração)
                </p>
              </div>
              <Button onClick={handleLogin}>Entrar</Button>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="bg-card rounded-lg p-6 shadow-sm border border-border">
              <h2 className="text-xl font-semibold mb-4">
                Selecione um baralho
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-80 overflow-y-auto p-2">
                {decks.map((deck) => (
                  <Button
                    key={deck.id}
                    variant={selectedDeckId === deck.id ? "default" : "outline"}
                    className={`justify-start ${
                      selectedDeckId === deck.id
                        ? "ring-2 ring-primary ring-offset-2"
                        : ""
                    }`}
                    onClick={() => setSelectedDeckId(deck.id)}
                  >
                    <BookOpen className="mr-2 h-4 w-4" />
                    {deck.name}
                    {deck.isDefault && (
                      <span className="ml-2 text-xs bg-primary/20 px-2 py-0.5 rounded-full">
                        Padrão
                      </span>
                    )}
                  </Button>
                ))}
              </div>
            </div>

            {selectedDeck && (
              <div className="bg-card rounded-lg p-6 shadow-sm border border-border">
                <h2 className="text-xl font-semibold mb-2">
                  {selectedDeck.name}
                </h2>
                <p className="text-muted-foreground mb-6">
                  {selectedDeck.description}
                </p>

                <Tabs defaultValue="black" className="w-full">
                  <TabsList className="grid grid-cols-2 mb-6">
                    <TabsTrigger value="black">
                      Cartas Pretas ({selectedDeck.blackCards.length})
                    </TabsTrigger>
                    <TabsTrigger value="white">
                      Cartas Brancas ({selectedDeck.whiteCards.length})
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="black" className="space-y-6">
                    <div>
                      <label
                        htmlFor="newBlackCard"
                        className="block text-sm font-medium mb-1"
                      >
                        Adicionar nova carta preta
                      </label>
                      <div className="flex gap-2">
                        <Textarea
                          id="newBlackCard"
                          value={newBlackCard}
                          onChange={(e) => setNewBlackCard(e.target.value)}
                          placeholder="Digite a pergunta ou frase com lacuna..."
                          className="flex-1"
                        />
                        <Button onClick={handleAddBlackCard}>Adicionar</Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h3 className="font-medium">Cartas existentes</h3>
                      <div className="space-y-2 max-h-80 overflow-y-auto p-2">
                        {selectedDeck.blackCards.map((card) => (
                          <div
                            key={card.id}
                            className="flex justify-between items-center p-3 bg-background rounded-md"
                          >
                            <p>{card.text}</p>
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() =>
                                  removeCard(selectedDeck.id, card.id, "black")
                                }
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="white" className="space-y-6">
                    <div>
                      <label
                        htmlFor="newWhiteCard"
                        className="block text-sm font-medium mb-1"
                      >
                        Adicionar nova carta branca
                      </label>
                      <div className="flex gap-2">
                        <Textarea
                          id="newWhiteCard"
                          value={newWhiteCard}
                          onChange={(e) => setNewWhiteCard(e.target.value)}
                          placeholder="Digite a resposta engraçada..."
                          className="flex-1"
                        />
                        <Button onClick={handleAddWhiteCard}>Adicionar</Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h3 className="font-medium">Cartas existentes</h3>
                      <div className="space-y-2 max-h-80 overflow-y-auto p-2">
                        {selectedDeck.whiteCards.map((card) => (
                          <div
                            key={card.id}
                            className="flex justify-between items-center p-3 bg-background rounded-md"
                          >
                            <p>{card.text}</p>
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() =>
                                  removeCard(selectedDeck.id, card.id, "white")
                                }
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            )}

            <div className="bg-card rounded-lg p-6 shadow-sm border border-border">
              <h2 className="text-xl font-semibold mb-4">Criar novo baralho</h2>
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="deckName"
                    className="block text-sm font-medium mb-1"
                  >
                    Nome do baralho
                  </label>
                  <Input
                    id="deckName"
                    value={newDeck.name}
                    onChange={(e) =>
                      setNewDeck({ ...newDeck, name: e.target.value })
                    }
                    placeholder="Ex: Baralho Geek"
                  />
                </div>

                <div>
                  <label
                    htmlFor="deckDescription"
                    className="block text-sm font-medium mb-1"
                  >
                    Descrição
                  </label>
                  <Textarea
                    id="deckDescription"
                    value={newDeck.description}
                    onChange={(e) =>
                      setNewDeck({ ...newDeck, description: e.target.value })
                    }
                    placeholder="Descrição do baralho"
                  />
                </div>

                <Button onClick={handleAddDeck}>Criar baralho</Button>
              </div>
            </div>

            {/* Clean Rooms Section */}
            <div className="bg-card rounded-lg p-6 shadow-sm border border-border">
              <h2 className="text-xl font-semibold mb-4">Limpar Salas</h2>
              <p className="mb-4 text-muted-foreground">
                Esta ação excluirá todas as salas existentes. As salas com
                apenas jogadores fictícios são removidas automaticamente.
              </p>
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-medium">
                    Total de salas: {Object.keys(rooms).length}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Esta ação não pode ser desfeita
                  </p>
                </div>
                <Button variant="destructive" onClick={cleanRooms}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Excluir todas as salas
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Admin;
