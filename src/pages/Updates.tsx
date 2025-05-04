import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";

// Helper type for updates
type Update = {
  id: number;
  version: string;
  title: string;
  description: string;
  features: {
    text: string;
    status: "planned" | "in-progress" | "completed";
  }[];
  estimatedRelease: string;
};

const Updates = () => {
  const navigate = useNavigate();

  // Sample updates data - in a real app, this would come from an API or CMS
  const updates: Update[] = [
    {
      id: 1,
      version: "v1.2.0",
      title: "Melhorias na Interface e Novos Baralhos",
      description:
        "Estamos trabalhando em uma atualização significativa para melhorar a experiência do usuário e adicionar novas cartas.",
      features: [
        { text: "Novo tema escuro aprimorado", status: "completed" },
        {
          text: "Interface responsiva para dispositivos móveis",
          status: "completed",
        },
        {
          text: "Novo baralho temático: Cultura Brasileira",
          status: "in-progress",
        },
        { text: "Novo baralho temático: Tecnologia", status: "in-progress" },
        { text: "Melhorias de desempenho e estabilidade", status: "planned" },
      ],
      estimatedRelease: "Junho 2025",
    },
    {
      id: 2,
      version: "v1.3.0",
      title: "Sistema de Perfil e Estatísticas",
      description:
        "Adicionaremos perfis de jogador com estatísticas e conquistas para tornar o jogo ainda mais divertido.",
      features: [
        {
          text: "Perfis de jogador com avatares personalizáveis",
          status: "planned",
        },
        { text: "Sistema de estatísticas de jogo", status: "planned" },
        { text: "Conquistas e emblemas", status: "planned" },
        { text: "Histórico de partidas", status: "planned" },
        { text: "Rankings e tabelas de classificação", status: "planned" },
      ],
      estimatedRelease: "Agosto 2025",
    },
    {
      id: 3,
      version: "v1.4.0",
      title: "Modo Torneio e Eventos Especiais",
      description:
        "Estamos planejando adicionar modos de jogo competitivos e eventos limitados.",
      features: [
        { text: "Modo torneio com tabelas eliminatórias", status: "planned" },
        { text: "Eventos sazonais com cartas exclusivas", status: "planned" },
        {
          text: "Salas privadas com configurações personalizadas",
          status: "planned",
        },
        { text: "Integração com redes sociais", status: "planned" },
      ],
      estimatedRelease: "Outubro 2025",
    },
  ];

  // Function to render status badge with appropriate color
  const renderStatusBadge = (status: Update["features"][0]["status"]) => {
    switch (status) {
      case "planned":
        return <Badge variant="outline">Planejado</Badge>;
      case "in-progress":
        return <Badge variant="secondary">Em Desenvolvimento</Badge>;
      case "completed":
        return <Badge variant="default">Concluído</Badge>;
      default:
        return null;
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto py-6 px-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Próximas Atualizações</h1>
          <Button
            onClick={() => navigate("/")}
            variant="outline"
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
        </div>

        <p className="text-center text-muted-foreground mb-8">
          Veja o que estamos desenvolvendo para tornar o jogo ainda melhor!
        </p>

        <div className="space-y-8">
          {updates.map((update) => (
            <Card key={update.id} className="shadow-sm">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <Badge variant="outline" className="mb-2">
                      {update.version}
                    </Badge>
                    <CardTitle>{update.title}</CardTitle>
                  </div>
                  <Badge variant="secondary" className="ml-2">
                    Previsto: {update.estimatedRelease}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-muted-foreground">
                  {update.description}
                </p>
                <h3 className="text-sm font-semibold mb-2">
                  Recursos planejados:
                </h3>
                <ul className="space-y-2">
                  {update.features.map((feature, idx) => (
                    <li key={idx} className="flex justify-between items-center">
                      <span>{feature.text}</span>
                      {renderStatusBadge(feature.status)}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-10 p-4 bg-muted rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Sugestões de Recursos</h2>
          <p className="mb-4">
            Tem uma ideia para melhorar o jogo? Adoraríamos ouvir sua sugestão!
          </p>
          <p className="text-sm text-muted-foreground">
            Envie suas ideias para{" "}
            <a
              href="mailto:weryclison.nandi@gmail.com"
              className="text-primary hover:underline"
            >
              weryclison.nandi@gmail.com
            </a>{" "}
            ou use a página de feedback para compartilhar suas sugestões.
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default Updates;
