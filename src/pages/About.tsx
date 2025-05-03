import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ExternalLink } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const About = () => {
  const navigate = useNavigate();

  return (
    <Layout>
      <div className="max-w-4xl mx-auto py-6 px-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Sobre o Jogo</h1>
          <Button
            onClick={() => navigate("/")}
            variant="outline"
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="overflow-hidden border-t-4 border-t-primary">
            <CardHeader className="bg-muted/50">
              <CardTitle className="flex items-center gap-2">
                <span className="text-primary text-2xl">🎮</span>
                Cartas Contra a Humanidade
              </CardTitle>
              <CardDescription>
                A inspiração por trás do nosso jogo
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="mb-4">
                Cartas Contra a Humanidade é um jogo de cartas famoso por seu
                humor irreverente e criativo. O objetivo principal é divertir os
                jogadores ao combinar perguntas com respostas que, juntas,
                formam situações engraçadas ou absurdas.
              </p>
              <p>
                Nosso jogo é inspirado no conceito de Cartas Contra a
                Humanidade, mas não é afiliado ou associado ao jogo original.
                Foi criado como uma alternativa para proporcionar diversão
                similar, adaptada com nosso próprio toque de criatividade.
              </p>
            </CardContent>
            <CardFooter className="bg-muted/30 flex justify-end">
              <Button
                variant="outline"
                className="flex items-center gap-2"
                onClick={() =>
                  window.open("https://www.cardsagainsthumanity.com/", "_blank")
                }
              >
                <span>Visitar site oficial</span>
                <ExternalLink className="h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>

          <Card className="overflow-hidden border-t-4 border-t-indigo-500">
            <CardHeader className="bg-muted/50">
              <CardTitle className="flex items-center gap-2">
                <span className="text-indigo-500 text-2xl">💡</span>
                Nossa Versão Única
              </CardTitle>
              <CardDescription>O que nos diferencia</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="mb-4">
                Enquanto seguimos a essência do humor e da interação social,
                nosso jogo inclui cartas exclusivas em português que oferecem
                uma experiência diferente.
              </p>
              <p>
                Nosso objetivo é trazer o mesmo nível de diversão, mas de forma
                online e gratuita, permitindo que você jogue com seus amigos de
                qualquer lugar, a qualquer momento.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="text-center p-6 hover:shadow-md transition-shadow">
            <div className="mb-4 mx-auto bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center">
              <span className="text-3xl">🔍</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Humor Irreverente</h3>
            <p className="text-muted-foreground">
              Diversão garantida com respostas inesperadas e combinações
              hilárias.
            </p>
          </Card>

          <Card className="text-center p-6 hover:shadow-md transition-shadow">
            <div className="mb-4 mx-auto bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center">
              <span className="text-3xl">🌐</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Jogo Online</h3>
            <p className="text-muted-foreground">
              Jogue com seus amigos de qualquer lugar, sem precisar estar
              fisicamente juntos.
            </p>
          </Card>

          <Card className="text-center p-6 hover:shadow-md transition-shadow">
            <div className="mb-4 mx-auto bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center">
              <span className="text-3xl">🔄</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Sempre Evoluindo</h3>
            <p className="text-muted-foreground">
              Constantemente adicionamos novas cartas e funcionalidades para
              manter a diversão.
            </p>
          </Card>
        </div>

        <Card className="border-t-4 border-t-amber-500 mb-8">
          <CardHeader className="bg-muted/50">
            <CardTitle className="flex items-center gap-2">
              <span className="text-amber-500 text-2xl">⚠️</span>
              Declaração de Isenção
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <p>
              Este jogo não é um produto oficial de Cartas Contra a Humanidade e
              não possui qualquer vínculo com os criadores do jogo original.
              Todas as referências são feitas apenas para destacar a inspiração
              por trás da nossa ideia.
            </p>
          </CardContent>
        </Card>

        <div className="text-center bg-primary/5 rounded-lg p-8 mb-8">
          <h2 className="text-2xl font-bold mb-4">Obrigado por jogar!</h2>
          <p className="mb-6 max-w-2xl mx-auto">
            Esperamos que você se divirta jogando e compartilhando momentos
            memoráveis com seus amigos.
          </p>
          <Button size="lg" onClick={() => navigate("/")} className="px-8">
            Jogar Agora
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default About;
