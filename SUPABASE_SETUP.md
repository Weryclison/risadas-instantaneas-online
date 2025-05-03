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

```sql
CREATE TABLE decks (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  is_default BOOLEAN DEFAULT FALSE
);
```

### Tabela `black_cards`

```sql
CREATE TABLE black_cards (
  id UUID PRIMARY KEY,
  text TEXT NOT NULL,
  deck_id UUID REFERENCES decks(id) ON DELETE CASCADE
);
```

### Tabela `white_cards`

```sql
CREATE TABLE white_cards (
  id UUID PRIMARY KEY,
  text TEXT NOT NULL,
  deck_id UUID REFERENCES decks(id) ON DELETE CASCADE
);
```

## 4. Configurar as políticas de segurança (RLS)

Por padrão, o Supabase aplica Row Level Security, o que significa que nenhum dado é acessível sem configuração adicional. Como este é um aplicativo de demonstração, vamos criar políticas que permitem acesso público para leitura e escrita:

Para cada tabela, acesse a aba "Authentication" > "Policies" e adicione:

### Políticas para `decks`

1. Clique em "New Policy" e selecione "Create a policy from scratch"
2. Nome da política: "Enable read access for all users"
3. Tipo de política: SELECT
4. Usando expressão: TRUE
5. Clique em "Save policy"

6. Clique em "New Policy" novamente
7. Nome da política: "Enable insert access for all users"
8. Tipo de política: INSERT
9. Usando expressão: TRUE
10. Clique em "Save policy"

11. Adicione políticas semelhantes para UPDATE e DELETE

### Repita o processo para `black_cards` e `white_cards`

Crie políticas de SELECT, INSERT, UPDATE e DELETE para cada tabela.

## 5. Obter as credenciais de API

1. No menu lateral, acesse "Project Settings" > "API"
2. Copie a "Project URL" e "anon public" key
3. Crie um arquivo `.env.local` na raiz do seu projeto e adicione:

```
VITE_SUPABASE_URL=https://ddhcveruewixmxboyblj.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRkaGN2ZXJ1ZXdpeG14Ym95YmxqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYyOTE0MzksImV4cCI6MjA2MTg2NzQzOX0.Gnt017F9h_Nut5qzlXSsty7bSOyLeMhIG79LfNexfsM
VITE_ADMIN_PASSWORD=66/'9>PCm+<
```

## 6. Verificação (opcional)

Para verificar se a configuração está correta, você pode adicionar alguns dados manualmente no Supabase usando o "Table Editor" e depois verificar se eles aparecem no seu aplicativo.
