# Risadas Instantâneas

Um jogo de cartas divertido inspirado em "Cards Against Humanity", projetado para jogar com amigos. Este jogo funciona completamente no navegador e pode ser hospedado na Vercel com integração ao Supabase para armazenamento persistente de dados.

## Como Jogar

1. Acesse o jogo através do link do seu deploy na Vercel
2. Insira seu nome de jogador
3. Crie uma sala ou junte-se a uma sala existente
4. Para teste local, você pode adicionar jogadores fictícios
5. Quando tiver pelo menos 2 jogadores, o jogo pode começar!

## Regras do Jogo

1. Um jogador é designado como "juiz" da rodada
2. Uma carta preta com uma pergunta ou frase incompleta é revelada
3. Os outros jogadores escolhem uma carta branca de sua mão para responder
4. O juiz escolhe a resposta mais engraçada
5. O jogador cuja carta foi escolhida ganha um ponto
6. O papel de juiz passa para o próximo jogador
7. Quem tiver mais pontos no final do jogo é o vencedor!

## Recursos Técnicos

- Frontend React com TypeScript e Tailwind CSS
- Gerenciamento de estado usando Context API
- Sistema de banco de dados Supabase para persistência de dados
- Suporte a atualizações em tempo real com Supabase Realtime
- Design responsivo para desktop e dispositivos móveis
- Deploy na Vercel

## Recursos Online

Com a integração do Supabase, o jogo possui os seguintes recursos online:

1. **Persistência de Dados**: Todos os baralhos, cartas e salas são armazenados em um banco de dados Supabase.

2. **Jogo Multijogador Online**: Jogadores em diferentes dispositivos podem jogar juntos em tempo real.

3. **Atualizações em Tempo Real**: As ações dos jogadores são sincronizadas instantaneamente em todos os dispositivos.

4. **Convites por Link**: Compartilhe facilmente um link para que amigos entrem na sua sala.

## Configuração do Projeto

### Pré-requisitos

- Node.js 16+ e npm
- Conta na Vercel (para deploy)
- Conta no Supabase (para banco de dados)

### Instalação e Execução Local

1. Clone o repositório

```bash
git clone https://github.com/seu-usuario/risadas-instantaneas.git
cd risadas-instantaneas
```

2. Instale as dependências

```bash
npm install
```

3. Configure o Supabase seguindo as instruções em `SUPABASE_SETUP.md`

4. Crie um arquivo `.env.local` com suas variáveis de ambiente

```
VITE_SUPABASE_URL=sua_url_do_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anon
VITE_ADMIN_PASSWORD=senha_admin
```

5. Execute o projeto em modo de desenvolvimento

```bash
npm run dev
```

6. Acesse `http://localhost:5173` no seu navegador

### Deploy

Siga as instruções no arquivo `DEPLOY_VERCEL.md` para fazer o deploy do projeto na Vercel.

## Contribuição

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues ou enviar pull requests.

## Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo LICENSE para detalhes.

## Agradecimentos

- Inspirado no jogo "Cards Against Humanity"
- Construído com React, TypeScript, Tailwind CSS, Shadcn UI
- Banco de dados e autenticação com Supabase
- Hospedagem com Vercel

## Desenvolvimento

### Requisitos

- Node.js 18+
- npm, yarn ou bun
- Conta no Supabase (plano gratuito)

### Instalação

```bash
git clone https://github.com/seu-usuario/risadas-instantaneas-online.git
cd risadas-instantaneas-online
npm install
```

### Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto com as seguintes variáveis:

```
VITE_ADMIN_PASSWORD=sua_senha_admin
VITE_SUPABASE_URL=sua_url_do_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anon_do_supabase
```

### Configuração do Supabase

Consulte o arquivo [SUPABASE_SETUP.md](SUPABASE_SETUP.md) para obter instruções detalhadas sobre como configurar o banco de dados Supabase para este projeto.

### Executar localmente

```bash
npm run dev
```

### Construir para produção

```bash
npm run build
```

### Implantar na Vercel

Consulte o arquivo [DEPLOY_VERCEL.md](DEPLOY_VERCEL.md) para obter instruções detalhadas sobre como implantar este projeto na Vercel.

### Estrutura do Projeto

```
src/
├── components/     # Componentes reutilizáveis
├── contexts/       # Contextos React (GameContext, etc)
├── data/           # Dados estáticos (decks de cartas)
├── hooks/          # Hooks personalizados
├── lib/            # Utilitários e funções auxiliares
├── pages/          # Páginas da aplicação
├── services/       # Serviços para comunicação com APIs externas
└── types/          # Definições de tipos TypeScript
```

## Acesso Admin

Para acessar o painel de administração:

1. Vá para `/admin` na URL
2. Digite a senha configurada em VITE_ADMIN_PASSWORD (padrão: "admin123")
3. No painel admin, você pode gerenciar decks e cartas
4. Agora todas as alterações serão salvas no Supabase e disponíveis para todos os usuários!

## Tecnologias Utilizadas

- React
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui
- React Router
- Supabase (banco de dados e API)
- Vercel (hospedagem)

## Banco de Dados e Persistência

- Todos os baralhos e cartas são armazenados no Supabase
- Os baralhos padrão são carregados automaticamente ao iniciar
- Administradores podem adicionar, editar e remover baralhos e cartas
- As alterações são visíveis para todos os usuários

## Roadmap para Futuras Implementações

- Comunicação em tempo real com Supabase Realtime
- Sistema de autenticação de usuários
- Mais decks e cartas
- Opções de customização do jogo
- Estatísticas e histórico de partidas

## Licença

MIT

## Autores

- [Seu Nome]
