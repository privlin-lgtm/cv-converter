# AGENTS.md

## What this is
CV Converter rewrites a CV to another country's norms: an Israeli CV into a US résumé, a UK CV or a
German Lebenslauf, or a CV from abroad into Israeli norms. The country rules live in Postgres
(`countries`, `norms`), Claude rewrites the CV with structured output, deterministic checks flag
anything that still breaks a rule, and the browser prints it to PDF. Nothing from the CV is stored.
Read the chain before changing anything: [intent](intent/2026-10-10-mvp/intent.md),
[spec](intent/2026-10-10-mvp/spec.md), [plan](intent/2026-10-10-mvp/plan.md), and the sourced
rules in [research/cv-norms-2026-10.md](research/cv-norms-2026-10.md).

npm workspaces: `client/` (Vite, React 19, Redux Toolkit, React Router) and `server/`
(Express 5, Knex, pg, Zod). Config comes from `server/.env` (keys in `server/.env.example`).

## Commands (all from the repo root)
| Command | Healthy output |
|---|---|
| `npm run dev` | `[client] ➜  Local:   http://localhost:5173/` and `[server] API listening on http://localhost:3001` |
| `npm run build` | `tsc -p tsconfig.build.json` silent, then `✓ built in …ms` from Vite |
| `npm test` | `Test Files  8 passed (8)` (server), then `Test Files  2 passed (2)` (client) |
| `npm run lint` | `oxlint --deny-warnings && tsc …` for each workspace, no output, exit 0 |
| `npm run db:migrate` | `Already up to date.` or `Batch N: ran N migration(s): …` |
| `npm run db:seed` | `Ran N seed file(s): …` |

Server tests use `DATABASE_URL_TEST` only: `server/vitest.config.ts` points `DATABASE_URL` at it,
and `test/globalSetup.ts` migrates and seeds it before the run. Test files run one at a time.

## Never
- Commit a real CV, an API key or a `.env`.
- Store CV text anywhere: no table, column, file, temp file or localStorage.
- Log request or response bodies.
- Read `.env` files.
- Write placeholders or TODOs.
- Send a CV anywhere except the Anthropic API.
- Put a literal secret in a test; build fakes by string concatenation.

## Always
- Run `npm run build`, `npm test` and `npm run lint` before reporting done, and paste the output.
- Fix the code, not the test.
- Start `.txt` fixtures with the line `FICTIONAL TEST CV — NOT A REAL PERSON` and use `@example.com` emails only.
- Validate request bodies and model output with Zod.

## Conventions
- TypeScript strict; thin route handlers that call services.
- Server imports use `.js` extensions (NodeNext); `tsx` and Vitest resolve them to `.ts`.
- Required config is read with `requireEnv()` from `server/src/env.ts`, which throws when a value is missing.
- Rules always come from the `norms` table; never hardcode a country rule.
- `why` text and sources come from the database, never from the model.
- The model client stays behind `convertWithModel()`; the JSON schema is written by hand.
- The rule-check column is `check_def`, because `check` is a reserved word in Postgres.
- Knex config lives in `server/src/db.ts`; migrations and seeds are `.ts` files in `server/db/`.

## Known agent mistakes
None yet. Add one the second time it happens; the third time, it becomes a hook.

## Reviews
When reviewing a pull request, apply `REVIEW.md`.
