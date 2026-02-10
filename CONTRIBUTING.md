# Contributing to AgentMonitor

Thanks for your interest! Here's how to contribute.

## Branch Strategy

```
main        ← stable releases only (protected, requires CI + PR)
develop     ← integration branch (PRs merge here first)
feature/*   ← your feature branches (branch off develop)
fix/*       ← bug fix branches (branch off develop)
```

### Workflow

1. **Fork** the repo
2. **Branch** off `develop`: `git checkout -b feature/my-thing develop`
3. **Code** — make your changes
4. **Test** — `npm test` must pass
5. **PR** into `develop` — CI runs automatically
6. After review, merged to `develop`
7. Periodically, `develop` is merged to `main` and tagged for release

### Rules

- **Never push directly to `main`** — always go through a PR
- **CI must pass** — lint, type-check, tests, build
- **Keep PRs focused** — one feature/fix per PR

## Setup

```bash
git clone https://github.com/ruiqili2/agent-monitor.git
cd agent-monitor
npm install
npm run dev
```

## Commands

| Command | What it does |
|---------|-------------|
| `npm run dev` | Start dev server (http://localhost:3000) |
| `npm run build` | Production build (standalone) |
| `npm test` | Run all 91 tests |
| `npm run lint` | ESLint check |
| `npx tsc --noEmit` | Type-check without emitting |

## Before Submitting a PR

Run the full check locally:

```bash
npm run lint
npx tsc --noEmit
npm test
npm run build
```

All four must pass. CI will verify this too.

## Project Structure

```
plugin.ts               → OpenClaw plugin entry
openclaw.plugin.json    → Plugin manifest
src/
├── app/                → Next.js pages + API routes
├── components/         → React components (office, chat, cards)
├── hooks/              → Custom React hooks
├── lib/                → Core logic (gateway client, state mapper, types)
└── __tests__/          → Test files (Vitest + Testing Library)
```

## Adding a New Agent Behavior

1. Add the behavior to `src/lib/state-mapper.ts` → `BEHAVIORS` object
2. Add sprite drawing in `src/components/office/sprites.ts`
3. Add tests in `src/__tests__/state-mapper.test.ts`
4. Update the behavior count in README if it changes

## Code Style

- TypeScript strict mode
- Functional components with hooks
- Named exports preferred
- Tests alongside the code in `__tests__/`

## Questions?

Open an issue or start a discussion on the repo.
