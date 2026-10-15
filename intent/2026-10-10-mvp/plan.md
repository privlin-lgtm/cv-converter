# Plan: CV Converter MVP  (from spec.md, 2026-10-10) · Status: approved

## Time budget

### Revised schedule (from 15 Oct 2026)
The hackathon was postponed. The official window is Thu 15 Oct – Tue 20 Oct 2026, 18:00 Israel time. Work started on 13 Oct, the original start date, before the postponement was announced; the instructor knows and has approved this.

| Day | Work |
|---|---|
| Tue 13 Oct | Repo setup, M1, M2, M3 (done) |
| Wed 14 Oct | M3 merged; M4 opened as PR #5. Hackathon postponed. |
| Thu 15 Oct | Merge PR #5 and this docs PR; start M5 |
| Fri 16 – Sat 17 Oct | M5, M6 |
| Sun 18 Oct | M7 and M8 in a 90-minute time box |
| Mon 19 Oct | M9: README, final check, video |
| Tue 20 Oct | Submit by 12:00 (deadline 18:00) |

### Original schedule (13–15 Oct)
- Three sessions, Tue 13 – Thu 15 Oct 2026, about 4 hours each: roughly 12 hours, solo.
- Days 1 and 2 build the whole core. If day 3 shrinks, what's left is still a complete, demoable product.
- Day 3 is for the two "Should" features, the README and the video.
- Each milestone is one branch and one PR. Paul merges once CI is green, so there are nine small PRs, which also shows the process to the judges.

| Day | Planned | Buffer |
|---|---|---|
| Tue 13 Oct | Repo setup 10 + M1 75 + M2 60 + M3 85 + verifier 10 = 240 min | None; see checkpoint 1 |
| Wed 14 Oct | M4 60 + M5 110 + M6 40 + verifier 10 = 220 min | 20 min (record insurance clips if it's spare) |
| Thu 15 Oct | M7 + M8 in a 90-min box, then M9 90 min = 180 min | 60 min, which goes to M9 |

## Before Tuesday (planning only, no code)
1. **Move the Phase 0 screen out of this folder.** It contains personal details and must never reach the public repo.
2. **Read and accept the chain.** Set `Status: accepted` in `intent.md`, then `approved` in `spec.md` and `plan.md`, committing each gate separately (commands below).
3. **Send the instructor brief.**
4. **Anthropic Console.** Create a key named `cv-converter-dev` and set a monthly spend limit for its workspace (about $20 is plenty). Don't paste the key anywhere but `server/.env` on Tuesday.
5. **Database.** Create two local Postgres databases, `cv_converter_dev` and `cv_converter_test`. If Postgres isn't installed locally, use a free Neon project with two branches instead, and decide which before Tuesday.
6. **Tools.** Check the Node version (LTS), `gh auth status`, and that Claude Code starts.

```
# Run from: C:\Users\privlin\Projects\cv-converter  (Git Bash: cd /c/Users/privlin/Projects/cv-converter)
mv phase0-jobseeker-coaches-2026-10.md "/g/My Drive/Planning/"
git init -b main
git add intent research docs
git commit -m "intent: draft MVP intent, spec, plan and research notes"
```

After setting `Status: accepted` in `intent.md`:
```
# Run from: C:\Users\privlin\Projects\cv-converter  (Git Bash: cd /c/Users/privlin/Projects/cv-converter)
git commit -am "intent: accept"
```

After setting `Status: approved` in `spec.md`:
```
# Run from: C:\Users\privlin\Projects\cv-converter  (Git Bash: cd /c/Users/privlin/Projects/cv-converter)
git commit -am "spec: approve"
```

After setting `Status: approved` in `plan.md`:
```
# Run from: C:\Users\privlin\Projects\cv-converter  (Git Bash: cd /c/Users/privlin/Projects/cv-converter)
git commit -am "plan: approve"
```

Databases (or right-click **Databases → Create** in pgAdmin). `winpty` lets Git Bash show the password prompt:
```
# Run from: any folder (Git Bash, PostgreSQL's bin folder on PATH)
winpty createdb -U postgres cv_converter_dev
winpty createdb -U postgres cv_converter_test
```
```
# Run from: any folder
gh auth status
node --version
```

## Milestones
The day headings and checkpoint notes below follow the original 13–15 Oct schedule. Where they differ, the revised schedule under 'Time budget' and the re-dated checkpoints under 'Cut line' apply.

### Day 1 — Tue 13 Oct: rules in, conversion out (API)

**Repo setup** (about 10 minutes; Paul, on `main`, before any code)
1. Create the public repo and push `main`, which so far holds only the planning commits. Push protection for secrets is on by default for public repos.
2. In GitHub → Settings → Rules → Rulesets, add a ruleset on `main`: require a pull request (0 approvals, since Paul can't approve his own PR; the merge is the approval), block force pushes, empty bypass list. "Require status checks" gets added after M1 merges, once the CI check exists.
3. Start the first branch.

```
# Run from: C:\Users\privlin\Projects\cv-converter  (Git Bash: cd /c/Users/privlin/Projects/cv-converter)
gh repo create cv-converter --public --source . --push
git switch -c m1-scaffold
```

**M1. Scaffold and guardrails** (about 75 minutes; Opus plans, Sonnet builds)
- **Workspaces:**
  - `client/` from the Vite `react-ts` template, plus `@reduxjs/toolkit`, `react-redux`, `react-router-dom`; dev dependencies `vitest`, `jsdom`, `@testing-library/react`, `@testing-library/dom` (a required peer for React 19), `@testing-library/jest-dom`.
  - `server/` with `express` 5, `knex`, `pg`, `zod`, `@anthropic-ai/sdk`, `multer`; dev dependencies `typescript`, `tsx`, `vitest`, `supertest` and the `@types` packages.
  - The root `package.json` runs both halves (`concurrently` for `dev`).
- **One command per check, from the repo root,** each non-zero on failure:
  - `npm run build`: `tsc` for the server, `vite build` for the client.
  - `npm test`: Vitest in both workspaces.
  - `npm run lint`: `oxlint`, plus a typecheck: `tsc -b` for the client (the Vite template's root tsconfig is just project references, so `tsc --noEmit` there checks nothing) and `tsc --noEmit` for the server.
- **Repo files:**
  - `AGENTS.md` (outline below); `CLAUDE.md` containing only `@AGENTS.md`.
  - `REVIEW.md` from the workflow skill, with the tenant-scoping line replaced by "no CV text stored, logged or persisted in the browser".
  - `.gitattributes` (`* text=auto eol=lf`).
  - `.gitignore`: `node_modules`, `dist`, `.env`, `.env.*.local`, `*.pdf`, `*.docx`, `!server/test/fixtures/**`, `phase0-*.md`, `.claude/settings.local.json`, `.claude/worktrees/`.
  - `server/.env.example`, with key names only: `ANTHROPIC_API_KEY`, `ANTHROPIC_MODEL=claude-sonnet-5-5`, `DATABASE_URL`, `DATABASE_URL_TEST`, `PORT=3001`.
- **`.claude/settings.json`**, from the skill's template:
  - Manual mode; PowerShell tool off.
  - Deny `Read` of `**/.env` and `**/.env.*.local`.
  - Deny `gh pr merge` and pushes to `main`.
  - Allow named git subcommands and `npm run *` / `npm test`.
- **Hooks** in `.claude/hooks/`:
  - **no-placeholders:** copied from the skill.
  - **production-gate:** copied from the skill. It already blocks `vercel --prod`, `gh pr merge` and pushes to `main`.
  - **secret-guard** (new, PreToolUse on Edit/Write). It blocks added text matching real secret shapes only:
    - an Anthropic key, `sk-ant-(api|admin)[0-9]{2}-` followed by 20+ key characters;
    - a private-key header line;
    - a Postgres URL with a password, except `postgres:postgres@localhost`, which is CI's throwaway service container.
    - It skips files under `.claude/hooks/`. Tests that need a fake secret build it by string concatenation, so the literal never sits in the repo.
- **Fixture guard:** a test fails if any `.txt` file in `server/test/fixtures/` lacks the first line `FICTIONAL TEST CV — NOT A REAL PERSON`, or contains an email outside `@example.com`. M7's binary fixtures are checked through their extracted text instead.
- **Test database:**
  - A Vitest `globalSetup` in `server/` migrates and seeds the test DB (through `tsx`) before the run.
  - Server tests run with `fileParallelism: false`, so the files don't race on one database.
- **Smoke test:** `GET /api/health` returns 200, via supertest.
- **CI:** `.github/workflows/ci.yml` on every PR and every push to `main`.
  - Node LTS, with a Postgres service container.
  - Steps: `npm ci`, `npm run lint`, `npm run build`, `npm test` (the global setup migrates and seeds).
- **Trigger each hook once on purpose:**
  - leave a `TODO`;
  - ask Claude to write a file containing a fake Anthropic key;
  - run `git push` while on `main`.
  - Confirm each one blocks.

Paul creates the local env file and adds the key and DB URLs by hand:
```
# Run from: C:\Users\privlin\Projects\cv-converter\server  (Git Bash: cd /c/Users/privlin/Projects/cv-converter/server)
cp .env.example .env
```

*Done when:*
- `npm run build`, `npm test` and `npm run lint` pass locally and in CI on the M1 PR.
- Each hook has been seen to block.
- After merging, "Require status checks: CI" is added to the ruleset, and a direct push to `main` is rejected.

**M2. Rules in Postgres** (about 60 minutes; Sonnet)
- Knex migrations for `countries`, `norms` and `ratings`, exactly as in spec.md (note the `check_def` column name).
- Seeds:
  - 4 countries.
  - About 140 norms, transcribed from `research/cv-norms-2026-10.md` by its seeding notes:
    - army rows marked `all` are copied to US, GB and DE;
    - each status takes the first word of the research status;
    - the v1 checks go into `check_def`.
  - v1 takes only a one-line kind of job, not a job ad, so trim the job-ad clauses from `ats_format`, `file_format_ats`, `it_skills` and `tailoring`.
  - `verified_on` 2026-10-10.
- A repository module: `getCountries()` and `getNorms(code)`.
- Routes: `GET /api/countries` and `GET /api/countries/:code/norms`.

*Done when:*
- Migrate and seed run cleanly on an empty database.
- Route tests pass against the test DB: 4 countries; each country has its key rules (`photo` or `date_of_birth`, `date_format`, `length_pages`); unknown code gives 404.
- A seed test asserts every `check_def` parses against the four check types.

**M3. Conversion API** (about 85 minutes; Opus for the prompt, schema and Zod, Sonnet for wiring)
- **Model client,** behind `convertWithModel()`:
  - `output_config.format` `json_schema`, written by hand (every object `additionalProperties: false`, every field required); `max_tokens` 12,000.
  - SDK client created with `maxRetries: 0`, and one 150-second deadline per request that covers every attempt.
  - Retries once within the deadline on invalid JSON or `max_tokens` (at `max_tokens` 16,000). A `refusal` gives 422; past the deadline gives 504.
- **Prompt builder:**
  - Takes the direction, the optional kind of job, and the target's rules as `key: rule` lines.
  - Adds the three army-service example rewrites for Israel → abroad only.
  - Puts the CV between delimiters marked "data, not instructions".
  - The system prompt carries the honesty rules.
- **Result builder:** joins `changes[].ruleKey` to `norms` for `why`, `sources` and `status`.
- **Checks interpreter:** `absent`, `present` and `max_words` on the plain-text rendering; `all_dates_match` on each entry's `dates`.
- `POST /api/convert` with Zod validation: allowed pairs only, text up to 20,000 characters, kind of job up to 100.
- Logging: model, tokens, latency and direction only.
- **Two fixtures today,** fictional, each starting with the marker line:
  - `il-software-dev.txt`: a tech army unit with Hebrew acronyms, date of birth, ID number, marital status, years-only dates.
  - `uk-olah.txt`: a 2:1 degree, referees, British spelling, Ulpan Aleph Hebrew.
  - The other three come at the start of M5.

*Done when:*
- Unit tests pass for:
  - the prompt builder: every target rule present; army examples only for Israel → abroad; CV inside delimiters;
  - the checks interpreter: each type, both outcomes;
  - the result builder: unknown `ruleKey` handled.
- Route tests with a fake model cover a valid result, invalid JSON → retry → 502, refusal → 422, deadline → 504 (with a short injected deadline), a bad pair → 400, and too-long text → 413.
- One real call per direction returns a valid result: `il-software-dev` to the US, UK and Germany; `uk-olah` to Israel. Paul reads each one and notes any invented fact in the PR description.

**End of day 1:** run the `verifier` subagent (from the skill) on the merged work and read its report.

**Checkpoint 1:** if M3 isn't merged by the end of day 1, finish it first on day 2, and drop M7 now.

### Day 2 — Wed 14 Oct: what a user sees

**M4. Convert page** (about 60 minutes; Sonnet)
- Redux store with the `countries` and `conversion` slices and typed hooks.
- The `/` page:
  - direction toggle and target select;
  - text box with a counter, and the optional "What kind of job are you applying for?" line;
  - privacy note;
  - Convert button with progress ("can take up to a minute") and error states.
- Plain CSS, responsive down to 390 px.

*Done when:* component tests cover the target select appearing only for "Israeli CV → abroad", the button disabled on empty text, and the error message showing with the text kept. A manual pass at 1280 and 390 px.

**M5. Result page and checks panel** (about 110 minutes; Sonnet)
- Start by writing the other three fixtures (about 10 minutes):
  - `il-ops-combat-reserves.txt`: a combat squad leader with untranslated ranks, a 2024 reserve-duty gap, marital status and children.
  - `de-lebenslauf.txt`: date of birth, marital status, MM/YYYY dates, a signature line.
  - `us-resume.txt`: a Letter-style résumé, GPA, US spelling.
- `/result` with the CV preview in the target layout: single column for US, UK and Israel; for Germany, a tabular date column, a "Personal Details" block, and place, date and signature lines.
- The side panel shows checks (pass or flagged), questions, changes grouped by kind (with why, source links and the "common practice" label), and notes.
- A reload redirects to `/` with the "not saved, by design" message.
- "Edit and convert again" keeps the text.

*Done when:*
- Component tests cover changes rendering with source links, an unverified rule showing the label, the German layout showing a date column and signature block, and the reload redirect.
- The full fixture matrix (see Proof), run end to end in the browser, reads correctly.
- Screenshots at 1280 and 390 px are saved to `docs/screens/`.

**Checkpoint 2:** if M5 passes 2½ hours, simplify the German layout to a single column with date-first lines, and move on.

**M6. Print to PDF** (about 40 minutes; Sonnet)
- A print stylesheet that hides everything but `.cv-sheet`, and resets `height` and `overflow` on its ancestors so every page prints.
- `@page { size: …; margin: 0 }` injected from `paperSize` (Letter for the US, A4 for the rest). 18 mm of padding on `.cv-sheet` replaces the page margin, which stops Chrome printing the URL and date.
- `break-inside: avoid` on entries.
- "Save as PDF" sets `document.title` to "Firstname-Lastname-CV", calls `window.print()`, then restores the title.

*Done when:*
- In Chrome's print preview, Israel → US shows Letter and Israel → Germany shows A4. Neither shows app chrome, a URL or a date, and entries aren't split.
- A two-page CV prints both pages, the PDF's suggested file name is right, and the saved PDF has selectable text.
- A component test checks the injected style carries the right size.

**Checkpoint 3 (end of day 2):** feature freeze. If M6 isn't merged, finish it first on day 3 and drop M7. If there's spare time, record the core demo clips (rows 0:27–1:31 of the video outline) now, as insurance.

### Day 3 — Thu 15 Oct: should-haves, proof and presentation

**M7 and M8 share a 90-minute time box from the start of the session.** Whatever isn't merged by then is dropped (its branch stays unmerged), and M9 starts.

**M7. Upload a .docx or .pdf** (about 45 minutes; Sonnet). *Should.*
- `POST /api/extract`:
  - `multer` memory storage with a 2 MB limit; `LIMIT_FILE_SIZE` maps to 413.
  - `mammoth` for .docx; a PDF text extractor such as `unpdf` for .pdf.
  - 415 for other types; 422 when no text is found.
- The client fills the text box with the extracted text, so the user can review it before converting.

*Done when:* route tests pass with a fictional .docx and .pdf fixture (Paul makes these from `us-resume.txt` in Word with Save As, so they carry the marker line, which the test checks in the extracted text) plus a .txt upload (415). Nothing is written to disk (assert no temp file is created).

**M8. Ratings** (about 40 minutes; Sonnet). *Should.*
- An inline form on `/result`: better / same / worse / didn't try, 1–5, and an optional comment of up to 500 characters with a "no personal details" hint.
- The `rating` slice, and `POST /api/ratings` with Zod. The server fills `model` from `ANTHROPIC_MODEL`.

*Done when:* the route test covers a valid row (with `model` set), `score` 6 → 400, and a 501-character comment → 400. The component test checks the thank-you state.

**M9. README, final check and video** (about 90 minutes plus the day's buffer; Opus for the review, Paul for the video). *Must.*
- **README:**
  - what it does and who it's for, with a screenshot or GIF;
  - how it works (CV → rules from Postgres → Claude structured output → checks → print);
  - how to run it locally, test and lint;
  - where the rules come from (link to the research notes) and privacy;
  - limitations;
  - "© 2026 Paul Rivlin. All rights reserved."
- **Final check:** the `verifier` subagent on `main`. Then scan the whole history for secrets; the command below must print nothing.
- **Video:** recorded and edited from `docs/demo-video-outline.md`.

```
# Run from: C:\Users\privlin\Projects\cv-converter  (Git Bash: cd /c/Users/privlin/Projects/cv-converter)
git log -p --all | grep -nE "sk-ant-(api|admin)[0-9]{2}-[A-Za-z0-9_-]{20,}|-----BEGIN [A-Z ]*PRIVATE KEY-----|postgres(ql)?://[^:/ ]+:[^@/ ]+@" | grep -v "postgres:postgres@localhost"
```

### Cut line
**Above the line (must ship):** M1–M6 and M9.

**Drops, in the order they come up:**
1. **Checkpoint 1** (was: end of day 1): passed. M3 merged on 14 Oct, so M7 stays.
2. **Checkpoint 2** (day 2): M5 past 2½ hours → single-column German layout.
3. **Checkpoint 3** (end of Sat 17 Oct): M6 not merged → drop M7.
4. **M7/M8 time box (Sun 18 Oct):** whatever of M7 and M8 isn't merged at 90 minutes. Ratings move to the week after, before testers; paste still works without upload.

**Already below the line (after the hackathon):**
- The Vercel deploy and rate limiting, before the tester round.
- F9 rules browser.
- The `npm run eval` script.
- .docx export.
- Hebrew.

## AGENTS.md outline (written in M1)
- **What this is:** one paragraph, with links to `intent/`, `spec.md`, `plan.md` and the research notes.
- **Commands,** each with a sample of healthy output: `npm run dev`, `npm run build`, `npm test`, `npm run lint`, `npm run db:migrate`, `npm run db:seed` (all from the repo root).
- **Never:**
  - commit a real CV, an API key or a `.env`;
  - store CV text anywhere (no table, column, file, temp file or localStorage);
  - log request or response bodies;
  - read `.env` files;
  - write placeholders or TODOs;
  - send a CV anywhere except the Anthropic API;
  - put a literal secret in a test; build fakes by concatenation.
- **Always:**
  - run build, test and lint before reporting done, and paste the output;
  - fix the code, not the test;
  - start `.txt` fixtures with the marker line and use `@example.com` emails only;
  - validate request bodies and model output with Zod.
- **Conventions:**
  - TypeScript strict; thin route handlers that call services.
  - Rules always come from the `norms` table; never hardcode a country rule.
  - `why` text and sources come from the database, never from the model.
  - The model client stays behind `convertWithModel()`; the JSON schema is written by hand.
  - The rule-check column is `check_def`, because `check` is a reserved word in Postgres.
- **Known agent mistakes:** start empty; add the second time a mistake happens (the third time, it becomes a hook).
- "When reviewing a pull request, apply `REVIEW.md`."

## Files that change
```
cv-converter/
  AGENTS.md  CLAUDE.md  REVIEW.md  README.md
  .gitignore  .gitattributes  package.json  package-lock.json
  .claude/settings.json  .claude/hooks/{no-placeholders,production-gate,secret-guard}.mjs  .claude/agents/verifier.md
  .github/workflows/ci.yml
  intent/2026-10-10-mvp/{intent,spec,plan}.md    research/cv-norms-2026-10.md
  docs/{demo-video-outline,instructor-brief}.md  docs/screens/
  client/  package.json  vite.config.ts  index.html
           src/{main.tsx, App.tsx, store.ts, hooks.ts}
           src/features/{countries,conversion,rating}/  (slices + thunks)
           src/pages/{ConvertPage,ResultPage,NotFound}.tsx
           src/components/{CvSheet,ChangesList,ChecksPanel,QuestionsList,RatingForm}.tsx
           src/styles/{app.css,print.css}
  server/  package.json  vitest.config.ts  .env.example
           src/{app.ts, index.ts, db.ts, env.ts}
           src/routes/{health,countries,convert,extract,ratings}.ts
           src/services/{norms,prompt,model,result,checks,extract}.ts
           src/schemas/{request,modelOutput}.ts  (Zod, plus the hand-written JSON schema)
           db/run.ts  db/migrations/  db/seeds/{01_countries,02_norms}.ts
           test/  test/globalSetup.ts  test/fixtures/
```

## Schema delta
All new: `countries`, `norms` and `ratings`, as in spec.md. They are created in M2 by additive migrations only.

## Model split
- **Opus 5.5** for anything where a wrong choice is expensive: the M1 plan, M3's prompt, JSON schema and Zod shapes, and the M9 review. Switch to it whenever the same test fails two cycles running.
- **Sonnet 5.5** for routine implementation: M2 and M4–M8.
- **The verifier subagent** (Sonnet, read-only by instruction) at the end of each day.

## Proof
- Each milestone's "Done when" list, pasted into its PR with the command output.
- **The fixture matrix:** five fictional CVs run through every allowed direction (the two Israeli fixtures → US, UK and Germany; the UK, German and US fixtures → Israel). That is 9 runs. For each, record the checks result and Paul's read of it in the M5 PR. Every flag is either fixed in the prompt or rules, or explained.
- CI green on `main`; the ruleset blocks direct pushes; the three hooks have each been seen to block.
- Print previews: Letter for the US, A4 for the others; two-page CVs print both pages.
- History scan clean before submission.

## Risks
| Risk | Mitigation |
|---|---|
| 12 hours solo is tight; day 1 has no buffer | The three checkpoints and the day-3 time box, one milestone per PR, no new ideas mid-build (they go in a `later.md`) |
| The model invents facts or keeps classified detail | Honesty rules in the system prompt; `questions` for missing facts; regex flags; Paul reads every fixture result; the standing note on army details |
| Structured-output schema rejected or slow on first use | Keep the schema flat and small and write it by hand; first-call compile latency is normal (cached 24 h afterwards); test it in the first 20 minutes of M3 |
| Responses take up to a minute | Progress message; SDK retries off; one 150-second deadline; the text stays in the box on error |
| Army-service placement depends on the job | The optional kind-of-job line; without it the model infers from the latest civilian role and says so |
| Two-column PDFs extract in the wrong order | Extracted text goes into the box for review; paste is always available |
| Print CSS differs across browsers | Target Chrome and Edge; test print preview in Chrome |
| A real CV or key reaches the public repo | `.gitignore`, the secret-guard hook, the fixture-marker test, GitHub push protection, the history scan before submission |
| Local Postgres setup eats day-1 time | Decide local vs Neon before Tuesday |
| Knex with a TypeScript knexfile fights back | Done in M1: no knexfile. `server/src/db.ts` holds the Knex config; `npm run db:migrate` / `db:seed` run `db/run.ts` through `tsx`, and the Vitest global setup calls `db.migrate.latest()` and `db.seed.run()` directly |
| Rules data becomes public | Accepted for v1 if Paul agrees (intent question 4) |

## Rejected alternatives
- **EJS server-rendered pages:** superseded by React with Redux.
- **RTK Query:** not in the course; `createAsyncThunk` covers four calls.
- **Next.js or another framework:** not covered by the course.
- **A PDF library or Puppeteer:** the print stylesheet is enough, and Puppeteer is heavy on Vercel.
- **Saving conversions or adding accounts:** conflicts with the no-storage rule and the minimal schema.
- **OpenAI or Gemini:** no credits; Claude's structured outputs fit the result shape.
- **Opus 5.5 at runtime:** twice the cost, slower, no clear gain. **Haiku 5.5:** cheaper but untested; compare after the hackathon.
- **A decision model (Jev):** no classify or score feature in v1; checks are deterministic.
- **A Claude Design pass:** no time, and its export is code.
- **Tailwind:** not in the course projects; plain CSS is easier to control for print.
- **Generating the JSON schema from Zod:** `.max()` limits would leak into `maxLength`, which structured outputs reject.
- **The Claude GitHub review app:** setup time during a 12-hour build; the local verifier subagent gives a fresh-context review for now. Add it before the tester round.
- **Deploying during the hackathon:** not planned, because testers start afterwards. Intent question 3 asks whether to try it on day 3 if time is left.

## Tuesday kickoff (Claude Code desktop, in the repo folder, Manual mode, after Repo setup)
```
Read intent/2026-10-10-mvp/intent.md, spec.md and plan.md, and research/cv-norms-2026-10.md. Follow my vibe-coding-mvp-workflow skill. The hackathon has started. The repo is on GitHub with main pushed and a ruleset on main, and I'm on a new branch, m1-scaffold. Do milestone M1 (scaffold and guardrails) only, in the order plan.md lists it, using the hook and settings templates from the skill and the secret-guard patterns in plan.md. Stop when M1's "Done when" list is met, paste the output of npm run build, npm test and npm run lint, and tell me which hooks you triggered and what they printed. Then push the branch and open a PR; I'll merge it. Don't start M2.
```
