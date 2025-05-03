
import Layout from "@/components/Layout";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const Faq = () => {
  return (
    <Layout>
      <div className="max-w-3xl mx-auto py-6">
        <h1 className="text-3xl font-bold mb-8 text-center">Perguntas Frequentes</h1>

        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-1">
            <AccordionTrigger>Como o jogo funciona?</AccordionTrigger>
            <AccordionContent>
              <p className="mb-2">
                Cartas Contra é um jogo de cartas para adultos e amigos onde:
              </p>
              <ol className="list-decimal pl-5 space-y-1">
                <li>Em cada rodada, um jogador é escolhido como o "juiz" e revela uma carta preta, que contém uma pergunta ou frase com lacunas.</li>
                <li>Os outros jogadores selecionam uma carta branca de sua mão que melhor responde ou completa a carta preta.</li>
                <li>O juiz escolhe sua resposta favorita, e o jogador que a jogou ganha um ponto.</li>
                <li>O papel de juiz passa para o próximo jogador, e uma nova rodada começa.</li>
              </ol>
              <p className="mt-2">O jogador com mais pontos no final do jogo vence!</p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-2">
            <AccordionTrigger>Quantos jogadores são necessários?</AccordionTrigger>
            <AccordionContent>
              O jogo funciona melhor com 3 a 10 jogadores. Para este protótipo, recomendamos 3 a 5 jogadores por sala.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-3">
            <AccordionTrigger>Como posso criar uma sala?</AccordionTrigger>
            <AccordionContent>
              Na página inicial, digite seu apelido, depois clique em "Criar sala". Um código de sala único será gerado. Compartilhe este código com seus amigos para que eles possam se juntar à sua sala.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-4">
            <AccordionTrigger>Como entro em uma sala existente?</AccordionTrigger>
            <AccordionContent>
              Na página inicial, digite seu apelido, insira o código da sala no campo "Entrar em sala existente" e clique em "Entrar na sala".
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-5">
            <AccordionTrigger>Posso jogar no celular?</AccordionTrigger>
            <AccordionContent>
              Sim! O jogo foi projetado para funcionar bem em dispositivos móveis e desktops.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-6">
            <AccordionTrigger>Como sugerir novas cartas?</AccordionTrigger>
            <AccordionContent>
              Você pode enviar sugestões de novas cartas através da página de Feedback. Nossa equipe revisará suas sugestões e poderá adicioná-las em futuras atualizações.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-7">
            <AccordionTrigger>O conteúdo é apropriado para todas as idades?</AccordionTrigger>
            <AccordionContent>
              Não. Este jogo contém conteúdo adulto e humor negro, e é recomendado apenas para jogadores com 18 anos ou mais. Existem baralhos temáticos com níveis variados de conteúdo adulto.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-8">
            <AccordionTrigger>É possível jogar offline?</AccordionTrigger>
            <AccordionContent>
              Esta versão é exclusivamente online. Mas você pode imprimir suas próprias cartas se quiser jogar a versão física com amigos.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </Layout>
  );
};

export default Faq;
