# Koala Fit — Design System

Identidade coala: cinzas quentes e carvão como base, verde eucalipto como
primária, âmbar como destaque (conquistas, streak). Mobile-first, 375px como
largura de referência.

## Tokens

Definidos em `src/design-system/tokens.css` via `@theme` do Tailwind v4 — cada
token vira automaticamente uma classe utilitária (`bg-primary`, `text-lg`,
`rounded-md`, `shadow-md`...). **Nunca hardcode cores/tamanhos nas telas** —
use as classes utilitárias, que resolvem para as CSS variables.

- **Cores**: `bg`, `bg-elevated`, `surface`, `surface-hover`, `border`, `text`,
  `text-secondary`, `text-tertiary`, `primary` (+ `-hover`, `-fg`, `-soft`),
  `accent` (idem), `danger` (idem), `success`.
- **Dark mode**: override completo sob `[data-theme="dark"]`, com fallback via
  `@media (prefers-color-scheme: dark)` para quando a preferência ainda não
  foi resolvida no cliente. Preferência do usuário (`light`/`dark`/`system`)
  persiste em cookie (`koala-theme`) e, quando logado, em `users.theme`.
- **Espaçamento**: escala de 4px — é a escala padrão do Tailwind v4
  (`--spacing: 0.25rem`), não reinventamos tokens próprios aqui. `p-2` = 8px,
  `p-4` = 16px, etc.
- **Raios**: `radius-sm/md/lg/xl/full`.
- **Sombras**: `shadow-sm/md/lg`, mais suaves no dark mode.
- **Tipografia**: `text-xs` a `text-4xl` com line-heights pareadas, pesos
  `font-weight-regular/medium/semibold/bold`. Fonte: Geist (via
  `next/font`), exposta como `--font-sans`.

## Primitivos (`src/design-system/components`)

Todos consomem tokens, nenhum valor hardcoded.

- **Button** — `variant`: primary/secondary/ghost/danger · `size`: md (44px,
  padrão) / lg (52px) · `loading` (spinner + disabled automático) ·
  `fullWidth`.
- **Input** — label, hint, error, qualquer prop nativa de `<input>`.
- **NumberStepper** — o componente crítico para uso na academia: botões +/−
  de 48px, campo central `inputMode="decimal"` editável por toque direto,
  `step`/`min`/`max`, sufixo opcional (`kg`, `reps`). Pensado para uso com
  uma mão só.
- **Card** — container com borda, fundo elevado e sombra sutil.
- **Sheet** — modal que sobe de baixo (via portal), fecha no backdrop ou
  Esc, trava scroll do body, respeita `safe-area-inset-bottom`.
- **Toast** — `ToastProvider` no layout + hook `useToast().show(msg, variant)`,
  variantes default/success/danger, auto-dismiss em 3.5s, fica acima da
  bottom tab bar.
- **ProgressRing** — anel SVG de progresso (ex.: treinos da semana vs meta).
- **EmptyState** — ícone + título + descrição + ação, para toda tela com
  estado vazio.
- **Skeleton** — placeholder pulsante para loading.

## Convenções mobile-first

- Layout desenhado para 375px primeiro; desktop é a mesma tela centralizada
  com `max-width`.
- Alvos de toque ≥ 44×44px (`Button` `md` já garante isso).
- Bottom tab bar fixa, com `padding-bottom: env(safe-area-inset-bottom)`.
- Inputs numéricos sempre via `NumberStepper`, nunca teclado numérico puro.
