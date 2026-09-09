# Koala Fit

App pessoal de treino: registro de treinos, evolução de peso e carga, e uma
camada de incentivo (ofensiva no estilo Duolingo, recordes pessoais,
sugestões de progressão). Ver `DESIGN.md` para o design system.

Stack: Next.js (App Router, TypeScript) · Tailwind CSS v4 · Drizzle ORM ·
Neon Postgres (driver serverless via HTTP) · deploy na Vercel.

## Rodando localmente

Pré-requisitos: Node 20+, [pnpm](https://pnpm.io), e um projeto na Vercel
com a integração nativa do Neon Postgres já instalada (é de lá que vem a
`DATABASE_URL`).

```bash
pnpm install
```

### 1. Banco de dados (Neon via Vercel)

1. Crie um projeto na Vercel (`vercel link` a partir desta pasta) e instale a
   integração **Neon Postgres** nele (Storage → Marketplace → Neon).
2. Puxe as variáveis de ambiente para desenvolvimento local:
   ```bash
   vercel link
   vercel env pull .env.local
   ```
   Isso cria `.env.local` (gitignored) com a `DATABASE_URL` real. Veja
   `.env.example` para o que é esperado.
3. Gere e aplique as migrations:
   ```bash
   pnpm db:generate   # gera SQL a partir do schema em src/db/schema (não precisa de conexão real)
   pnpm db:migrate    # aplica no banco apontado por DATABASE_URL
   ```
4. Popule o catálogo de exercícios:
   ```bash
   pnpm seed
   ```
   Idempotente — pode rodar de novo sem duplicar exercícios.

### 2. Criar o usuário

Não há tela pública de cadastro. Crie o único usuário via CLI:

```bash
pnpm seed:user
# ou, sem prompts interativos:
pnpm seed:user -- --email voce@example.com --password "senha-forte" --name "Seu Nome" --height 180
```

Rodar de novo com o mesmo email atualiza a senha/dados (útil para reset de
senha).

### 3. Rodar o app

```bash
pnpm dev
```

Acesse `http://localhost:3000` — o login pede o email/senha criados acima.

Depois de logar, configure em **Perfil**: meta semanal de treinos e os dias
da semana em que você pretende treinar (isso alimenta a lógica de ofensiva).
Crie ao menos uma rotina em **Rotinas** antes de usar a tela **Hoje**.

### Outros comandos úteis

| Comando | O que faz |
|---|---|
| `pnpm db:studio` | Abre o Drizzle Studio (inspeção visual do banco) |
| `pnpm lint` | ESLint |
| `pnpm build` | Build de produção (também roda o type-check) |

## Deploy na Vercel

1. `vercel link` (se ainda não feito) e confirme que a integração Neon está
   instalada no projeto — isso já injeta `DATABASE_URL` automaticamente nos
   ambientes de Preview e Production, sem precisar configurar nada a mais.
2. `git push` para o remoto conectado ao projeto Vercel, ou `vercel deploy
   --prod` diretamente.
3. Depois do primeiro deploy, rode as migrations contra o banco de produção
   (a partir da sua máquina, com o `.env.local` de produção via
   `vercel env pull .env.local --environment=production`, ou rodando
   `pnpm db:migrate` num ambiente com a `DATABASE_URL` de produção):
   ```bash
   pnpm db:migrate
   pnpm seed
   pnpm seed:user
   ```
4. PWA: o manifest (`/manifest.webmanifest`) e os ícones já estão
   configurados — "Adicionar à tela de início" funciona direto, sem passos
   extras.

## Estrutura

```
src/
├── app/                  # rotas (App Router)
│   ├── login/            # tela pública
│   └── (app)/             # tudo autenticado — hoje, treino, rotinas,
│                          # histórico, evolução, perfil (+ exportar)
├── design-system/         # tokens (tokens.css) + primitivos (components/)
├── db/
│   ├── schema/            # tabelas Drizzle
│   └── seed/               # catálogo de exercícios + criação de usuário
├── lib/
│   ├── auth/               # senha, sessão, rate limit
│   ├── streak.ts            # motor de ofensiva
│   ├── personal-records.ts  # detecção de recordes
│   ├── progression.ts       # sugestão de progressão de carga
│   ├── export.ts            # montagem do export JSON/CSV
│   └── analysis-prompt.ts   # template do prompt de análise por IA
└── middleware → src/proxy.ts (Next.js 16 renomeou middleware → proxy)
```

## Variáveis de ambiente

Ver `.env.example`. Resumo: só `DATABASE_URL` é necessária — em produção ela
vem da integração Neon da Vercel; localmente, de `vercel env pull`.
