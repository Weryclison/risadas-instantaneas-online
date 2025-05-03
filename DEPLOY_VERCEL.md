# Guia de Implantação na Vercel

Este guia explica como implantar o projeto "Risadas Instantâneas" na Vercel gratuitamente.

## Pré-requisitos

- Conta no GitHub (ou GitLab/Bitbucket)
- Projeto configurado no Supabase (siga o arquivo SUPABASE_SETUP.md)
- Código atualizado com as modificações para uso do Supabase

## Passo 1: Preparar o código para implantação

1. Certifique-se de que todas as alterações para uso do Supabase estão implementadas
2. Verifique se o projeto funciona localmente com as variáveis de ambiente configuradas
3. Faça commit de todas as alterações para o seu repositório Git

## Passo 2: Criar uma conta na Vercel

1. Acesse [https://vercel.com/](https://vercel.com/)
2. Clique em "Sign Up" e escolha fazer login com GitHub (ou outro provedor)
3. Conclua o processo de inscrição

## Passo 3: Importar o projeto

1. No painel da Vercel, clique em "Add New..." e selecione "Project"
2. Encontre seu repositório na lista e clique em "Import"
3. Configure o projeto:
   - **Framework Preset**: Selecione "Vite"
   - **Root Directory**: Mantenha em branco (se o projeto está na raiz do repositório)
   - **Build and Output Settings**: Mantenha as configurações padrão, a menos que você tenha alterado seus comandos de build

## Passo 4: Configurar variáveis de ambiente

1. Expanda a seção "Environment Variables"
2. Adicione as seguintes variáveis:

   - `VITE_SUPABASE_URL` = URL do seu projeto Supabase
   - `VITE_SUPABASE_ANON_KEY` = Chave anônima do Supabase
   - `VITE_ADMIN_PASSWORD` = Senha para acesso à área de administração

3. Clique em "Deploy"

## Passo 5: Aguardar a implantação

1. A Vercel iniciará o processo de build e implantação
2. Aguarde até que o projeto seja implantado com sucesso
3. Quando concluído, você receberá um URL para seu site (por exemplo, risadas-instantaneas.vercel.app)

## Passo 6: Verificar a implantação

1. Acesse o URL fornecido pela Vercel
2. Verifique se o projeto está funcionando corretamente:
   - As cartas são carregadas do Supabase?
   - É possível criar baralhos e adicionar cartas (na área de admin)?
   - As alterações persistem entre sessões?

## Solução de problemas

Se você encontrar problemas durante a implantação:

1. **Erros de build**: Verifique os logs de build na Vercel para identificar o problema
2. **Erros de conexão com o Supabase**: Verifique se as variáveis de ambiente estão configuradas corretamente
3. **Problema com CORS**: Verifique as configurações do Supabase e adicione o domínio da Vercel às origens permitidas

## Atualizações futuras

Para implementar atualizações:

1. Faça as alterações no seu repositório local
2. Faça commit e push para o GitHub
3. A Vercel automaticamente iniciará uma nova implantação

## Domínio personalizado (opcional)

Para configurar um domínio personalizado:

1. Na página do seu projeto na Vercel, acesse "Settings" > "Domains"
2. Clique em "Add" e siga as instruções para adicionar seu domínio
3. Configure os registros DNS conforme as instruções da Vercel
