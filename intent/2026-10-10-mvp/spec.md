# Spec: CV Converter MVP  (from intent.md, 2026-10-10) · Status: draft

## Features

Priority: **Must** ships in the hackathon. **Should** ships if time allows; it's the first to drop at the cut line. **Stretch** is after the hackathon unless time is left over.

| # | Feature | Priority |
|---|---|---|
| F1 | **Choose a direction and target.** "My Israeli CV → abroad" (target: US, UK or Germany) or "My CV from abroad → Israel". | Must |
| F2 | **Paste a CV** as plain text (up to 20,000 characters), with an optional one-line "kind of job you're applying for" (up to 100 characters). Without the job line the model infers the target from the latest civilian role, and says so in `notes`. Several rules (where army service goes, what to keep) depend on what's relevant to the job. | Must |
| F3 | **Convert.** The server loads the target country's rules from Postgres, sends them with the CV to Claude, and gets back a structured result: the rewritten CV, a list of changes, questions and notes. Nothing is stored. | Must |
| F4 | **Explain every change.** Each change shows what was changed, why (the stored rule's `why` text, not the model's wording) and the source links. Rules with status `unverified` carry a "common practice" label. | Must |
| F5 | **Check the output.** Deterministic checks (regex and word count, defined in the rules data) run on the rewritten CV and show pass or flagged for each one. Nothing is auto-fixed. | Must |
| F6 | **Lay it out for the country and save as PDF.** The preview follows the target layout (single column for US, UK and Israel; tabular with a date column and signature block for Germany). "Save as PDF" uses the browser's print dialog, with A4 or US Letter set from the country's `paper_size`. | Must |
| F7 | **Upload a file.** .docx or text-based .pdf, up to 2 MB, parsed in memory. The extracted text goes into the text box so the user sees and can edit exactly what will be sent. | Should |
| F8 | **Rate the result.** "Compared with pasting your CV into ChatGPT or another chatbot, this was: Better / About the same / Worse / I didn't try one", a 1–5 score and an optional comment of up to 500 characters. Stored in `ratings`. | Should |
| F9 | **Browse the rules.** A page per country listing each rule with why, sources, status and verified date. | Stretch |
| F10 | **Hebrew CVs** (right-to-left, Hebrew headings). | Stretch (post-hackathon) |

## Architecture

- **Repo layout** follows the course's full-stack projects (`DI-BootCamp/Week12/Day6/challenge`): an npm-workspaces repo with `client/` (Vite + React 19 + TypeScript + Redux Toolkit + React Router) and `server/` (Express 5 + TypeScript + Knex + pg). The root `package.json` runs both halves for `dev`, `build`, `test` and `lint`.
- **Dev:** Vite's dev-server proxy forwards `/api` to Express on port 3001, so there's no CORS in development.
- **Server entry:** `server/src/app.ts` builds and exports the Express app (used by tests through supertest, and by Vercel). `server/src/index.ts` only calls `listen` for local runs.
- **AI client** sits behind a small interface (`convertWithModel(input) → ModelOutput`), so tests inject a fake and never call the API.
- **Hosting (after the hackathon):** Vercel, with Postgres from Neon through the Vercel Marketplace. Vercel's Express runtime ignores `express.static`, so the React build deploys as its own static project (or via `public/`). Decided at deploy time; see Concerns.

## Screens / routes

### Pages (React Router)

**`/` — Convert**
- Direction toggle: "My Israeli CV → abroad" / "My CV from abroad → Israel".
- Target select (US, UK, Germany), shown only for the first direction.
- Input: a "Paste text" text box with a character counter. An "Upload .docx or .pdf" button (F7) fills the same box.
- "What kind of job are you applying for? (optional)", a one-line input, for example "Backend developer" or "Logistics coordinator".
- A privacy note, always visible (wording below).
- Convert button. While waiting it shows "Rewriting for Germany… this can take up to a minute". Errors appear inline with a retry button; the text stays in the box.

**`/result` — Result**
- Desktop: two columns. On the left, the CV preview (`.cv-sheet`) in the target layout. On the right, a panel with four parts:
  - **Checks:** one line per check, pass or flagged.
  - **Questions for you:** facts the app needs and won't guess, such as work authorisation or the reason for a gap.
  - **Changes:** grouped by kind (removed, added, reworded, reordered, reformatted, flagged). Each shows what, why and source links, plus the "common practice" label where the rule is unverified.
  - **Notes:** for example "German employers usually expect the CV in German" or "Check your army details are cleared for publication".
- Mobile: stacked, preview first.
- Buttons: **Save as PDF** (`window.print()`), **Edit and convert again** (back to `/` with the text kept), and **Rate this result** (F8, inline form).
- If the page is reloaded the result is gone (it lives only in Redux state). Redirect to `/` with "Results aren't saved, by design. Paste your CV again to convert it."

**`/norms/:code` — Rules for a country** (F9, stretch). A table of rules with why, sources, status and verified date.

**`*` — Not found.**

**Privacy note (shown on `/`):**
> Your CV isn't saved by this app. It's sent to Anthropic's Claude API to be rewritten, and the result is shown only to you, in this browser tab. Anthropic deletes API data within 30 days (it keeps it for up to 2 years only if it's flagged for breaking their usage policy). Reloading the page clears everything. Please remove anything you wouldn't want processed, such as your ID number.

### Print stylesheet
- `@media print` hides everything except `.cv-sheet`.
- **Page size:** `@page { size: A4 | letter; margin: 0 }`, injected as a `<style>` element from the target's `paper_size`. A zero page margin stops Chrome printing the URL and date in the margins; the page margin comes from 18 mm of padding on `.cv-sheet` instead.
- **Multi-page output:** reset `height` and `overflow` on every ancestor of `.cv-sheet` in print, or only the first page prints.
- **File name:** before `window.print()`, set `document.title` to "Firstname-Lastname-CV" (the UK and Israeli rules ask for it; Chrome uses it as the PDF file name), then restore it.
- `break-inside: avoid` on entries; links print as plain text; system fonts at 10.5–11 pt.

### API routes (Express, all under `/api`)

| Method | Path | Input | Success | Errors |
|---|---|---|---|---|
| GET | `/api/health` | — | `{ ok: true, db: true }` | 503 if the DB is unreachable |
| GET | `/api/countries` | — | `[{ code, name, documentName, paperSize }]` | — |
| GET | `/api/countries/:code/norms` | `code` ∈ US, GB, DE, IL | `[{ key, rule, why, sources, status, verifiedOn }]` | 404 unknown code |
| POST | `/api/extract` | multipart `file` (.docx or .pdf, ≤2 MB) | `{ text, warnings }` | 413 too big (map multer's `LIMIT_FILE_SIZE`, or Express 5 returns 500); 415 other types; 422 no text found (e.g. a scanned PDF) |
| POST | `/api/convert` | `{ from: "IL" \| "ABROAD", to: "US" \| "GB" \| "DE" \| "IL", text, targetRole? }` | `ConversionResult` (below) | 400 invalid body or an impossible pair (IL→IL, ABROAD→US/GB/DE); 413 text over 20,000 chars; 422 the model refused; 502 model failed or returned invalid output after one retry; 504 past the 150-second deadline |
| POST | `/api/ratings` | `{ from, to, vsChatbot, score, comment }` (the server adds `model` from its own config) | 201 `{ id }` | 400 invalid |

Rules for every route:
- Request bodies are validated with Zod (a library; the course didn't use it, but it's the simplest way to validate both requests and the model's JSON).
- JSON body limit 100 kB. Uploads use `multer` with memory storage only and a 2 MB limit.
- A request logger records method, path, status and duration only. It never logs bodies.
- Before deploy: `express-rate-limit` on `/api/convert` and `/api/extract` (for example 10 per hour per IP) to protect API credit.

`ConversionResult`:

| Field | Shape | Source |
|---|---|---|
| `cv.header` | `name`, `headline`, `contactLines[]` | model |
| `cv.sections[]` | `kind` (summary, experience, military_service, education, skills, languages, volunteering, additional, personal_details, signature), `heading`, `text`, `entries[]` of `{ dates, title, organisation, location, lines[] }` | model |
| `changes[]` | `kind`, `what`, `ruleKey`, plus `why`, `sources[]` and `status` joined from `norms` by `ruleKey` (`null` if the model cited an unknown key; shown as "General edit") | model + server |
| `questions[]` | `text`, `ruleKey` | model |
| `notes[]` | `text`, `ruleKey` | model |
| `checks[]` | `ruleKey`, `result` (pass \| flagged), `detail` | server (deterministic) |
| `meta` | `model`, `country`, `paperSize`, `documentName` | server |

### Redux (Redux Toolkit; `createSlice` and `createAsyncThunk`, no RTK Query)
- **`countries`:** the list from `/api/countries`, loaded once.
- **`conversion`:** `from`, `to`, `text`, `targetRole`, `status` (idle, extracting, converting, done, error), `result`, `error`. Thunks `extractFile` and `convertCv`.
- **`rating`:** `status` (idle, sending, sent, error). Thunk `submitRating`.
- Typed `useAppDispatch` and `useAppSelector` hooks. Nothing goes in localStorage: CV text must not outlive the tab.

## Schema
Three tables, created with Knex migrations. Every column is tied to a feature.

**`countries`** (seeded, 4 rows: US, GB, DE, IL)

| Column | Type | Why it exists |
|---|---|---|
| `code` | text, PK | Target picker and foreign key (F1) |
| `name` | text, not null | Labels ("United Kingdom") (F1) |
| `document_name` | text, not null | What the result is called: résumé, CV, Curriculum Vitae (Lebenslauf) (F6) |
| `paper_size` | text, not null, check in (`A4`, `Letter`) | Print stylesheet `@page size` (F6) |

**`norms`** (seeded from `research/cv-norms-2026-10.md`, about 140 rows)

| Column | Type | Why it exists |
|---|---|---|
| `id` | serial, PK | Row identity |
| `country_code` | text, FK → countries, not null | Load the target's rules (F3) |
| `key` | text, not null; unique (`country_code`, `key`) | The model cites it; the server joins on it (F4) |
| `rule` | text, not null | Instruction sent to the model (F3) |
| `why` | text, not null | Explanation shown next to each change (F4) |
| `sources` | text[], not null, default `{}` | Source links shown to the user (F4) |
| `status` | text, not null, check in (`confirmed`, `unverified`) | The "common practice" label (F4) |
| `check_def` | jsonb, null | Deterministic check definition: `absent`, `present`, `max_words` or `all_dates_match` (F5). Not named `check`, which is a reserved word in Postgres. |
| `verified_on` | date, not null | Shows how fresh each rule is; drives upkeep (F9, and the data's long-term value) |

**`ratings`** (written by testers)

| Column | Type | Why it exists |
|---|---|---|
| `id` | serial, PK | Row identity |
| `created_at` | timestamptz, default now() | When it was rated |
| `from_code` | text, not null, check in (`IL`, `ABROAD`) | Which direction was rated (F8) |
| `to_code` | text, FK → countries, not null | Which target was rated (F8) |
| `vs_chatbot` | text, not null, check in (`better`, `same`, `worse`, `not_tried`) | The key test question (F8) |
| `score` | smallint, not null, check 1–5 | Overall quality (F8) |
| `comment` | text, null, check length ≤ 500 | Why; must not contain the CV (F8) |
| `model` | text, not null | Which model produced the rated result, so a later model switch can be compared (F8). Filled by the server from its `ANTHROPIC_MODEL` setting, not sent by the client. |

Deliberately absent: users, sessions, saved CVs or conversions, and the extracted text. There's no index beyond the primary keys and the `(country_code, key)` unique index, which also serves lookups by country.

## AI features

**F3, the CV rewrite: LLM.** One call per conversion.
- **Provider and model:** Anthropic Claude API (Paul holds credits), model `claude-sonnet-5-5` at $2 per million input tokens and $10 per million output tokens. Called through the official `@anthropic-ai/sdk`.
- **Why Claude Sonnet 5.5:**
  - Paul has the credits.
  - Structured outputs are generally available: `output_config.format` with `type: "json_schema"`. The reply is constrained to the result shape, which the UI depends on.
  - It is strong at careful rewriting and at following long rule lists.
  - Opus 5.5 costs twice as much and is slower, with no clear gain for this task. Haiku 5.5 is much cheaper but untested on this task; compare it on the fixtures after the hackathon.
- **Request:**
  - **System prompt:** role, the honesty rules (never invent facts, dates, grades, titles, work status or degree equivalences; ask through `questions` instead; never output classified military detail), and the output instructions.
  - **User message:**
    - the direction;
    - the kind of job, if given;
    - the target's rules, as a numbered list of `key: rule` lines;
    - for Israel → abroad only, the three army-service example rewrites from the research notes;
    - the CV text inside clear delimiters, marked as data, not instructions.
  - `max_tokens` 8,000.
- **Schema constraints** (from the structured-outputs docs):
  - Write the JSON schema by hand, kept beside the Zod schema. Generating it from Zod would leak `.max()` limits into `maxLength`, which the API rejects.
  - Every object sets `additionalProperties: false`, and every property is required (empty strings or arrays when not applicable), which keeps the schema inside the optional-parameter limits.
  - `kind` fields are enums. There are no length or number constraints in the JSON schema; Zod enforces those after parsing.
- **Timeouts and retries:**
  - Create the SDK client with `maxRetries: 0`, because the SDK otherwise retries twice by default.
  - One overall deadline of 150 seconds per request (an `AbortController`) covers every attempt; past it the route returns 504. This stays well inside Vercel's 300-second function limit.
- **Validation and failure:**
  - The response is parsed with Zod.
  - If parsing fails, or `stop_reason` is `max_tokens`, the server retries once within the same deadline (with `max_tokens` 12,000 for truncation).
  - A `refusal` returns 422 with a plain message. Any other failure returns 502.
  - The text stays in the browser so the user can retry.
- **Threshold and below-threshold behaviour:** the LLM gives no confidence score. Its uncertainty goes into `questions` (facts it needs) and `notes`. The deterministic checks (F5) then verify the output against the rules. Each check is either pass or flagged; a flag is shown to the user and never auto-fixed. Checks are code, not a model, so there is no "unsure" state.
- **Fallback:** none in v1. If the API is down, the user sees a clear error and a retry button. A second provider isn't worth it for the hackathon.
- **Cost:**
  - Input is about 6,000 tokens (system prompt and rules about 3,000, CV 1,500–3,000), about $0.012.
  - Output is about 2,500–4,000 tokens, about $0.03.
  - That is **about $0.04–0.05 per conversion**, so a 50-conversion tester round costs about $2.50.
  - There is no monthly cost per user because use is one-off. At a paid price, model cost stays well under $0.25 per order even with retries.
- **Logging:** model ID, input and output token counts, latency, direction and target. Never CV text.
- **Later:**
  - Prompt caching for the system prompt and rules block, which is identical for every conversion to the same country.
  - An `npm run eval` script that runs the fixtures through the real API and reports the check pass rate per direction. Not in CI, because it costs money and needs a key.

**F5, the checks: deterministic code, not AI.** A small interpreter runs each rule's `check_def` JSON against the rewritten CV.
- `absent`, `present` and `max_words` work on the plain-text rendering of the CV.
- `all_dates_match` works on each `entries[].dates` value. It splits the value on "–" or "-", and each part must match the pattern or be an allowed word ("Present", or "since MM/YYYY").
- There are 27 checks for about 140 rules. They cover the rules that text can verify; the rest rely on the prompt and the user's own read.

**Decision model (Jev): not used.** v1 has no classify, score or route feature that needs one; verification is deterministic. Revisit if a feature like "does this still read as an Israeli CV?" is wanted.

## Out of scope
Everything listed under the intent's Out of scope, plus:
- RTK Query (the course used plain Redux Toolkit; `createAsyncThunk` is enough).
- Tailwind and component libraries (plain CSS suits the print stylesheet).
- A Claude Design pass (no time, and its export is code).
- A PDF-rendering library.
- Server-side sessions.
- Job-ad keyword tailoring (several rules mention it; v1 takes only a one-line kind of job, not a job ad).

## Concerns
1. **The rules data will be public.** The seed rules (the part worth keeping) sit in a public repo. *Open (intent question 4).* Proposed answer: accept it for these four countries, since they're compiled from public sources, and keep later country packs and upkeep in a private repo.
2. **Israeli file-format norm vs print-only export.** Israeli sources say agencies often want an editable .docx; v1 exports a text-based (unlocked) PDF only. *Open (intent question 2).* A `docx` library is the likely fix if olim testers ask.
3. **Vercel Hobby is non-commercial.** *Resolved:* the tester round is non-commercial; the paid market test moves to Vercel Pro or another host.
4. **Express on Vercel ignores `express.static`.** *Resolved for the hackathon* (no deploy needed). At deploy time, choose between two Vercel projects from one repo (root directories `client/` and `server/`, with CORS limited to the client's origin) or building the client into the server's `public/`. Keep `app.ts` free of `listen` so either works.
5. **CVs go to a third party.** *Resolved:* the privacy note says so; the app stores and logs nothing from the CV; Anthropic's 30-day API retention (and the 2-year exception for flagged content) is stated.
6. **Classified military content can't be guaranteed out.** *Partly resolved:* a prompt rule, regex flags (Hebrew characters, jargon blocklist), and a standing note on any CV with army service: "Check your army details are cleared for publication."
7. **The model may invent facts.** *Resolved as far as possible:* honesty rules, a `questions` field, a human review of every fixture result during the build, and checks. It stays a risk in `plan.md`.
8. **Unverified rules.** *Resolved:* used, but labelled "common practice", with source links where they exist.
9. **Personal data in rating comments.** *Resolved:* 500-character limit, a "don't include personal details" hint, and no CV text in `ratings`.
10. **Structured-output schema limits.** *Resolved:* no min, max or length constraints in the JSON schema; all fields required; Zod enforces the rest.
11. **The Phase 0 screen in the project folder holds personal details** (Paul's coach, email excerpts, application counts). *Resolved:* it must never be committed. Move it out of `cv-converter/` before `git init`, and `.gitignore` it as a backstop.
12. **Stack change from the original brief** (EJS and JavaScript → TypeScript, React and Redux). *Resolved:* Paul confirmed the course covered React, Redux and TypeScript; the course projects confirm Vite, Redux Toolkit, Vitest, oxlint, Express 5, Knex and pg.
13. **A public URL can burn API credit.** *Resolved:* rate limiting before deploy, plus a monthly spend limit in the Anthropic Console.
