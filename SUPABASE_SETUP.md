# Configuração do Supabase para o projeto "Risadas Instantâneas"

Este guia explica como configurar o banco de dados Supabase para o projeto.

## 1. Criar uma conta no Supabase

1. Acesse [https://supabase.com/](https://supabase.com/) e clique em "Start your project"
2. Faça login ou crie uma conta (você pode usar GitHub, GitLab, etc)

## 2. Criar um novo projeto

1. Clique em "New Project"
2. Escolha uma organização (ou crie uma nova)
3. Dê um nome ao projeto, como "risadas-instantaneas"
4. Escolha uma senha forte para o banco de dados
5. Escolha a região mais próxima a você (como us-east-1 para América do Norte ou eu-west-1 para Europa)
6. Escolha o plano Free
7. Clique em "Create new project"

## 3. Criar as tabelas do banco de dados

Após a criação do projeto, acesse a seção "Table Editor" no menu lateral e crie as seguintes tabelas:

### Tabela `decks`

1. Clique em "Create a new table"
2. Defina:
   - Nome da tabela: `decks`
   - Descrição (opcional): "Baralhos de cartas do jogo"
   - Marque "Enable Row Level Security (RLS)"
   - Configuração de colunas:
     - `id` (tipo: uuid, Primary Key, Default: gen_random_uuid())
     - `name` (tipo: text)
     - `is_active` (tipo: boolean, Default: true)
     - `data` (tipo: jsonb)
   - Clique em "Save"

### Tabela `black_cards`

1. Clique em "Create a new table"
2. Defina:

   - Nome da tabela: `black_cards`
   - Descrição (opcional): "Cartas pretas do jogo"
   - Marque "Enable Row Level Security (RLS)"
   - Configuração de colunas:
     - `id` (tipo: uuid, Primary Key, Default: gen_random_uuid())
     - `text` (tipo: text)
     - `deck_id` (tipo: uuid)
     - `pick` (tipo: integer, Default: 1)
   - Clique em "Save"

3. Configure a chave estrangeira:
   - Vá para a seção "Foreign keys"
   - Clique em "Add foreign key relation"
   - Coluna: deck_id
   - Tabela referenciada: decks
   - Coluna referenciada: id
   - Escolha "Cascade" para a ação "On Delete"
   - Clique em "Save"

### Tabela `white_cards`

1. Clique em "Create a new table"
2. Defina:

   - Nome da tabela: `white_cards`
   - Descrição (opcional): "Cartas brancas do jogo"
   - Marque "Enable Row Level Security (RLS)"
   - Configuração de colunas:
     - `id` (tipo: uuid, Primary Key, Default: gen_random_uuid())
     - `text` (tipo: text)
     - `deck_id` (tipo: uuid)
   - Clique em "Save"

3. Configure a chave estrangeira:
   - Vá para a seção "Foreign keys"
   - Clique em "Add foreign key relation"
   - Coluna: deck_id
   - Tabela referenciada: decks
   - Coluna referenciada: id
   - Escolha "Cascade" para a ação "On Delete"
   - Clique em "Save"

### Tabela `rooms`

1. Clique em "Create a new table"
2. Defina:
   - Nome da tabela: `rooms`
   - Descrição (opcional): "Salas de jogo"
   - Marque "Enable Row Level Security (RLS)"
   - Configuração de colunas:
     - `id` (tipo: uuid, Primary Key, Default: gen_random_uuid())
     - `created_at` (tipo: timestamp with time zone, Default: now())
     - `name` (tipo: text)
     - `data` (tipo: jsonb)
     - `is_active` (tipo: boolean, Default: true)
   - Clique em "Save"

## 4. Configurar políticas de segurança (RLS)

Para cada tabela, você precisa configurar políticas de segurança para permitir acesso público (já que o aplicativo não requer autenticação):

### Para a tabela `decks`

1. Vá para a tabela "decks"
2. Clique na aba "Policies"
3. Clique em "New Policy"
4. Escolha "Create a policy from scratch"
5. Defina:
   - Policy name: "Enable all operations for all users"
   - Policy definition: FOR ALL USING (true) WITH CHECK (true)
   - Clique em "Review" e depois em "Save policy"

Alternativamente, crie políticas separadas para cada operação (SELECT, INSERT, UPDATE, DELETE) com expressão `true`.

### Para a tabela `black_cards`

Repita o mesmo processo da tabela `decks`.

### Para a tabela `white_cards`

Repita o mesmo processo da tabela `decks`.

### Para a tabela `rooms`

1. Vá para a tabela "rooms"
2. Clique na aba "Policies"
3. Clique em "New Policy"
4. Escolha "Create a policy from scratch"
5. Defina:
   - Policy name: "Enable all operations for all users"
   - Policy definition: FOR ALL USING (true) WITH CHECK (true)
   - Clique em "Review" e depois em "Save policy"

## 5. Habilitar o Realtime

Para garantir que as atualizações nas salas de jogo sejam propagadas em tempo real:

1. No menu lateral, vá para "Database" → "Replication"
2. Na seção "Realtime", habilite:
   - Checkbox "Select tables to replicate" (no plano Free, são limitadas a 5 tabelas)
   - Selecione a tabela `rooms` (essa é a mais importante para funcionalidades em tempo real)
3. Clique em "Save changes"

## 6. Obter as credenciais de API

1. No menu lateral, vá para "Project Settings" → "API"
2. Anote:
   - Project URL (algo como https://[string-aleatória].supabase.co)
   - anon public key (começa com "eyJ...")
3. Crie um arquivo `.env.local` na raiz do seu projeto com as seguintes variáveis:
   ```
   VITE_SUPABASE_URL=sua_url_do_projeto
   VITE_SUPABASE_ANON_KEY=sua_chave_anon
   VITE_ADMIN_PASSWORD=senha_para_acesso_admin
   ```

## 7. Testando a configuração

1. Volte ao seu projeto de desenvolvimento
2. Execute-o localmente com `npm run dev`
3. Verifique se o aplicativo consegue se conectar ao Supabase criando um novo baralho ou sala

Se precisar limpar os dados para testes, você pode usar as seguintes consultas SQL em "Database" → "SQL Editor":

```sql
-- Limpar todas as salas
UPDATE rooms SET is_active = false;

-- Ou deletar completamente
DELETE FROM rooms;

-- Resetar dados de teste, se necessário
DELETE FROM white_cards;
DELETE FROM black_cards;
DELETE FROM decks;
```
