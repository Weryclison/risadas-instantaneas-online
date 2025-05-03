
import { Deck } from "@/types/game";
import { v4 as uuidv4 } from "uuid";

// Função auxiliar para criar IDs únicos
const createId = () => uuidv4();

// Deck básico com cartas gerais (para todas idades)
const basicDeckId = createId();
const basicDeck: Deck = {
  id: basicDeckId,
  name: "Baralho Básico",
  description: "Cartas gerais para todas as idades",
  isDefault: true,
  blackCards: [
    {
      id: createId(),
      text: "O que me faz rir incontrolavelmente?",
      deckId: basicDeckId,
    },
    {
      id: createId(),
      text: "O que eu sempre esqueço de fazer antes de sair de casa?",
      deckId: basicDeckId,
    },
    {
      id: createId(),
      text: "Qual é o segredo para um relacionamento perfeito?",
      deckId: basicDeckId,
    },
    {
      id: createId(),
      text: "O melhor presente que já recebi foi _____.",
      deckId: basicDeckId,
    },
    {
      id: createId(),
      text: "Minha maior habilidade escondida é _____.",
      deckId: basicDeckId,
    },
    {
      id: createId(),
      text: "Se eu pudesse mudar uma coisa no mundo, seria _____.",
      deckId: basicDeckId,
    },
    {
      id: createId(),
      text: "O que realmente me faz feliz?",
      deckId: basicDeckId,
    },
    {
      id: createId(),
      text: "Se eu fosse um super-herói, meu poder seria _____.",
      deckId: basicDeckId,
    },
    {
      id: createId(),
      text: "A pior ideia para uma primeira impressão é _____.",
      deckId: basicDeckId,
    },
    {
      id: createId(),
      text: "O que todo brasileiro tem em comum?",
      deckId: basicDeckId,
    },
  ],
  whiteCards: [
    { id: createId(), text: "Passar vergonha em público.", deckId: basicDeckId },
    { id: createId(), text: "Rir nos momentos mais inapropriados.", deckId: basicDeckId },
    { id: createId(), text: "Fingir que está ouvindo quando alguém fala.", deckId: basicDeckId },
    { id: createId(), text: "Tentar pegar o elevador em último segundo.", deckId: basicDeckId },
    { id: createId(), text: "Responder a mensagens antigas como se fossem novas.", deckId: basicDeckId },
    { id: createId(), text: "Usar a mesma roupa por vários dias.", deckId: basicDeckId },
    { id: createId(), text: "Dançar quando ninguém está olhando.", deckId: basicDeckId },
    { id: createId(), text: "Falar sozinho(a) e ser pego(a).", deckId: basicDeckId },
    { id: createId(), text: "Esquecer nomes de pessoas que acabei de conhecer.", deckId: basicDeckId },
    { id: createId(), text: "Usar Google para responder perguntas simples.", deckId: basicDeckId },
    { id: createId(), text: "Comer o último pedaço de comida sem perguntar.", deckId: basicDeckId },
    { id: createId(), text: "Atualizar o feed de redes sociais a cada 5 minutos.", deckId: basicDeckId },
    { id: createId(), text: "Stalkear o perfil de ex nas redes sociais.", deckId: basicDeckId },
    { id: createId(), text: "Mentir sobre ter lido um livro famoso.", deckId: basicDeckId },
    { id: createId(), text: "Prometer começar a dieta na segunda-feira.", deckId: basicDeckId },
    { id: createId(), text: "Pedir desculpas por coisas insignificantes.", deckId: basicDeckId },
    { id: createId(), text: "Usar várias abas abertas ao mesmo tempo no navegador.", deckId: basicDeckId },
    { id: createId(), text: "Colocar alarmes com intervalos de 5 minutos.", deckId: basicDeckId },
    { id: createId(), text: "Adiar tarefas importantes até o último minuto.", deckId: basicDeckId },
    { id: createId(), text: "Comprar comida em vez de cozinhar.", deckId: basicDeckId },
    { id: createId(), text: "Falar com animais de estimação como se fossem pessoas.", deckId: basicDeckId },
    { id: createId(), text: "Ignorar ligações desconhecidas.", deckId: basicDeckId },
    { id: createId(), text: "Ficar acordado até tarde sem motivo.", deckId: basicDeckId },
    { id: createId(), text: "Tomar banho com água quente mesmo no verão.", deckId: basicDeckId },
    { id: createId(), text: "Deixar a louça para lavar depois.", deckId: basicDeckId },
    { id: createId(), text: "Ter conversas imaginárias no chuveiro.", deckId: basicDeckId },
    { id: createId(), text: "Fazer planos para cancelar depois.", deckId: basicDeckId },
    { id: createId(), text: "Passar horas escolhendo o que assistir.", deckId: basicDeckId },
    { id: createId(), text: "Tirar foto da comida antes de comer.", deckId: basicDeckId },
    { id: createId(), text: "Esconder o lixo em lugares estranhos.", deckId: basicDeckId },
  ],
};

// Deck Brasil - referências à cultura brasileira
const brazilDeckId = createId();
const brazilDeck: Deck = {
  id: brazilDeckId,
  name: "Baralho Brasil",
  description: "Cartas com referências à cultura brasileira",
  isDefault: true,
  blackCards: [
    {
      id: createId(),
      text: "O que todo brasileiro faz na praia?",
      deckId: brazilDeckId,
    },
    {
      id: createId(),
      text: "O que não pode faltar no churrasco de domingo?",
      deckId: brazilDeckId,
    },
    {
      id: createId(),
      text: "A maior prova de que você é brasileiro é _____.",
      deckId: brazilDeckId,
    },
  ],
  whiteCards: [
    { id: createId(), text: "Comer pão de queijo no café da manhã.", deckId: brazilDeckId },
    { id: createId(), text: "Usar 'mano' no início de cada frase.", deckId: brazilDeckId },
    { id: createId(), text: "Colocar ketchup na pizza.", deckId: brazilDeckId },
    { id: createId(), text: "Dizer que vai chegar em 5 minutos quando ainda nem saiu de casa.", deckId: brazilDeckId },
    { id: createId(), text: "Tomar banho três vezes por dia no verão.", deckId: brazilDeckId },
    { id: createId(), text: "Ter um tio que é palmeirense fanático.", deckId: brazilDeckId },
    { id: createId(), text: "Fazer um churrasco na laje.", deckId: brazilDeckId },
    { id: createId(), text: "Reclamar do governo mas não votar.", deckId: brazilDeckId },
    { id: createId(), text: "Chamar refrigerante de diferentes marcas pelo mesmo nome.", deckId: brazilDeckId },
    { id: createId(), text: "Conhecer todas as músicas do Zeca Pagodinho.", deckId: brazilDeckId },
    { id: createId(), text: "Guardar potes de margarina para colocar feijão.", deckId: brazilDeckId },
    { id: createId(), text: "Torcer contra a Argentina em qualquer esporte.", deckId: brazilDeckId },
    { id: createId(), text: "Aplaudir quando o avião pousa.", deckId: brazilDeckId },
    { id: createId(), text: "Fazer piada com o nome Xerox.", deckId: brazilDeckId },
    { id: createId(), text: "Colocar música alta no carro com os vidros abertos.", deckId: brazilDeckId },
    { id: createId(), text: "Usar chinelo de dedo o ano inteiro.", deckId: brazilDeckId },
    { id: createId(), text: "Colocar apelidos em todo mundo.", deckId: brazilDeckId },
    { id: createId(), text: "Dar um jeitinho brasileiro em tudo.", deckId: brazilDeckId },
    { id: createId(), text: "Discutir sobre política no grupo da família.", deckId: brazilDeckId },
    { id: createId(), text: "Falar 'vou te ligar' e nunca ligar.", deckId: brazilDeckId },
  ],
};

// Deck Adulto - para maiores de 18 anos (versão mais suave para o protótipo)
const adultDeckId = createId();
const adultDeck: Deck = {
  id: adultDeckId,
  name: "Baralho Adulto (+18)",
  description: "Para maiores de 18 anos",
  isDefault: true,
  blackCards: [
    {
      id: createId(),
      text: "Qual é o segredo mais embaraçoso que vocês já guardaram?",
      deckId: adultDeckId,
    },
    {
      id: createId(),
      text: "O que seria um péssimo nome para um drink?",
      deckId: adultDeckId,
    },
  ],
  whiteCards: [
    { id: createId(), text: "Acordar com uma tatuagem misteriosa depois de uma festa.", deckId: adultDeckId },
    { id: createId(), text: "Histórias da faculdade que nunca contei aos meus pais.", deckId: adultDeckId },
    { id: createId(), text: "Mensagens de texto enviadas para a pessoa errada.", deckId: adultDeckId },
    { id: createId(), text: "Desculpas mal elaboradas para furar compromissos.", deckId: adultDeckId },
    { id: createId(), text: "Ficar sem bateria no celular em momentos críticos.", deckId: adultDeckId },
    { id: createId(), text: "Inventar histórias para parecer interessante.", deckId: adultDeckId },
    { id: createId(), text: "Misteriosas manchas na roupa após uma festa.", deckId: adultDeckId },
    { id: createId(), text: "Uma coleção secreta de memes embaraçosos.", deckId: adultDeckId },
    { id: createId(), text: "Tomar decisões questionáveis após a terceira caipirinha.", deckId: adultDeckId },
    { id: createId(), text: "Confundir os nomes de pessoas importantes.", deckId: adultDeckId },
  ],
};

export const defaultDecks: Deck[] = [basicDeck, brazilDeck, adultDeck];
