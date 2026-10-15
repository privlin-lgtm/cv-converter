# CV Converter

Rewrites a CV to another country's hiring norms and explains every change it makes, with a link to where each rule comes from.

It works in both directions through Israel:
- **Israelis applying abroad:** an Israeli CV, including army service, into a US résumé, a UK CV or a German Lebenslauf.
- **Olim and other newcomers:** a CV from abroad into Israeli norms.

## Status
Being built during the Developers Institute hackathon (Full Stack + AI, part-time, May 2026 – December 2026), 15–20 October 2026. Work started on 13 October, the original start date, before the hackathon was postponed. Each milestone lands as its own pull request.

## How it works
1. The country rules (photo, date of birth, date format, length, paper size, how to describe army service and more) live in PostgreSQL, each with its sources.
2. The server sends the target country's rules and the CV to the Claude API, which returns the rewritten CV and a list of changes in a fixed structure.
3. Automatic checks test the result against the key rules, and the app asks for missing facts instead of inventing them.
4. "Save as PDF" uses the browser's print dialog, on A4 or US Letter as the country expects.

**Stack:** TypeScript, React with Redux Toolkit (Vite), Node.js with Express, PostgreSQL with Knex, Vitest.

## Privacy
The app never stores a CV. It is sent to the Claude API to be rewritten and shown only to the user. All tests use made-up CVs.

## Planning documents
- [Intent](intent/2026-10-10-mvp/intent.md)
- [Spec](intent/2026-10-10-mvp/spec.md)
- [Plan](intent/2026-10-10-mvp/plan.md)
- [Research: CV norms by country, with sources](research/cv-norms-2026-10.md)

© 2026 Paul Rivlin. All rights reserved.
