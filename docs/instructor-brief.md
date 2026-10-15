Hackathon project: CV Converter
Paul Rivlin · Full Stack + AI (part-time, May 2026 – December 2026) · Hackathon 15–20 October 2026 (started 13 October, the original start date) · Solo

END GOAL
A web app that rewrites a CV to the hiring norms of another country and explains every change it makes. It works in both directions through Israel: Israelis applying for jobs in the US, the UK or Germany, and new immigrants (olim) applying for jobs in Israel.

WHY
CV conventions differ a lot between countries: whether to include a photo or date of birth, the date format, the length and paper size, and how to describe army service. A general chatbot can rewrite a CV, but it doesn't know these rules reliably, can't say where they come from, and doesn't check its own work. In this app the rules live in a database, each with its source, and the output is checked against them. I researched the rules (about 140, with sources) before the hackathon; the code is all written during it.

PLANNED FUNCTIONALITY
1. Choose a direction: an Israeli CV to the US, the UK or Germany, or a CV from abroad to Israel. Optionally, say what kind of job you're applying for.
2. Paste the CV text (and, if time allows, upload a .docx or .pdf file).
3. The server loads the target country's rules from PostgreSQL and sends them with the CV to an AI model (the Claude API), which returns the rewritten CV in a fixed structure.
4. The result page shows the CV laid out the way that country expects, with a list of every change, the reason for it, and a link to the source of the rule.
5. Automatic checks flag output that breaks the key rules. Where a fact is missing, such as a work permit, the app asks the user instead of inventing it.
6. "Save as PDF" through the browser, on A4 or US Letter paper as the country expects.
7. If time allows: users rate the result against a general chatbot, and the ratings are stored in the database.

Version 1 works in English only; Hebrew CVs are a later goal.

TECHNOLOGY
TypeScript; React with Redux Toolkit (Vite); Node.js with Express; PostgreSQL with Knex; Vitest for tests; the Claude API for the rewrite.

HOW I'LL WORK
Each milestone is a separate branch and pull request, with automated tests, linting and continuous integration (GitHub Actions) on every change.

DATA AND PRIVACY
The app never stores a CV. The text is sent to the Claude API to be rewritten, and the result is shown only to the user. The database holds only the country rules and anonymous ratings. All tests use made-up CVs.

DELIVERABLES
A public GitHub repository and a 2-minute demo video.
