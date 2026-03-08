# SANDECH CRM Starter

Starter inicial de um CRM técnico-comercial para a SANDECH, pensado para venda consultiva de projetos de engenharia.

## Stack

- Next.js (App Router)
- TypeScript
- Tailwind CSS
- Supabase (Postgres + Auth + RLS)
- Vercel

## O que já vem modelado

- Contas / clientes
- Contatos
- Oportunidades com pipeline técnico-comercial
- Propostas por versão
- Histórico de interações
- Histórico de mudança de etapa
- Perfil de usuários com papéis internos
- Segurança com RLS

## Pipeline inicial

1. Lead identificado
2. Qualificação inicial
3. Entendimento do escopo
4. Go / No-Go interno
5. Em elaboração de proposta
6. Proposta enviada
7. Em negociação
8. Aguardando decisão do cliente
9. Ganha
10. Perdida
11. Stand-by

## Setup sugerido

### 1) Criar o projeto

```bash
pnpm create next-app@latest sandech-crm --yes
cd sandech-crm
```

Depois copie os arquivos deste starter para dentro do projeto.

### 2) Instalar dependências

```bash
pnpm add @supabase/ssr @supabase/supabase-js zod clsx lucide-react
```

### 3) Variáveis de ambiente

Crie o arquivo `.env.local` com base em `.env.example`.

### 4) Criar o projeto no Supabase

No Supabase:
- crie um novo projeto
- copie a URL do projeto
- copie a publishable key
- rode a migration SQL em `supabase/migrations/0001_init.sql`

### 5) Rodar localmente

```bash
pnpm dev
```

### 6) Deploy

- suba o repositório no GitHub
- importe o projeto na Vercel
- adicione as mesmas variáveis de ambiente na Vercel
- faça um novo deploy após salvar as variáveis

## Estrutura base

```txt
src/
  app/
    login/
    dashboard/
    oportunidades/
  components/
  lib/
    supabase/
supabase/
  migrations/
```

## Próximos passos recomendados

- módulo de compliance contratual
- biblioteca de premissas e fora de escopo
- automação de aprovação interna
- geração de proposta a partir de template
- dashboard executivo com valor ponderado e aging
- trilha de auditoria completa por proposta
