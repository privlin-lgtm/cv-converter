# Demo video outline (2 minutes)

**Goal:** in two minutes, show the judges a working product (functionality), the rules-in-the-database idea (creativity), clean engineering (code quality) and a clear story (presentation). Quality of execution counts more than originality, so most of the time goes on the product working.

**Use fictional CVs only.** Use the `il-software-dev` and `uk-olah` fixtures. No real CV, API key or `.env` file may appear on screen.

| Time | On screen | Voice-over (draft) |
|---|---|---|
| 0:00–0:15 | An Israeli CV with the problems highlighted: date of birth, ID number, "Mamram, Samal", a years-only date range. | "This is a typical Israeli CV. Send it to a company in Berlin or Boston and half of it works against you: the date of birth, the ID number, and army jargon nobody abroad can read." |
| 0:15–0:27 | The Convert page. | "CV Converter rewrites a CV for another country's hiring norms, and tells you exactly what it changed and why. It works both ways: Israelis applying abroad, and olim applying here." |
| 0:27–0:52 | Choose Israeli CV → Germany. Paste the CV and press Convert; cut the wait. The result shows the tabular Lebenslauf with dates in MM/YYYY, a Personal Details block and a signature line. Scroll the changes list and open one source link (the Federal Employment Agency's guide). | "Germany expects a tabular CV, month-and-year dates and a signature. Every change is listed with the reason and a link to where the rule comes from. The army service became 'Software Developer, Israel Defense Forces, mandatory military service', with no acronyms and nothing classified." |
| 0:52–1:05 | The checks panel (all pass, or one flag). The Questions list: "Do you have a German work permit?" | "Then the app checks its own output against the key rules, so they're verified, not just hoped for. If it needs a fact it doesn't have, like your work permit, it asks instead of guessing." |
| 1:05–1:19 | Switch to Israel → US on the same CV. Show the Letter-size print preview and the word "résumé". | "Same CV to the US: a one-page résumé on US Letter paper, with no date of birth. 'Save as PDF' is the browser's own print dialog, with the right paper size set for you." |
| 1:19–1:31 | The `uk-olah` fixture, CV from abroad → Israel: year-only dates, honest Hebrew level ("conversational, Ulpan Aleph"), the referee details removed. | "And for olim, the other way round: Israeli conventions, and an honest Hebrew level, because overstated languages get caught at interview." |
| 1:31–1:49 | Under the hood: the `norms` table in pgAdmin or psql (rows with sources), then the architecture line from the README, then green CI and the test count. | "The rules live in Postgres: about 140 of them, each with its sources. That's the part a free chatbot doesn't have. React and Redux on the front, Express and Knex behind, Claude for the rewrite, deterministic checks after it. Your CV is never stored." |
| 1:49–2:00 | The rating form, then an end card with the repo URL and "Paul Rivlin · Developers Institute Hackathon, Oct 2026". | "Next: my classmates test it on their own CVs and tell me whether it beat ChatGPT. Thanks for watching." |

**Recording notes**
- The video is submitted as a Loom link. Record in Loom, or edit the clips as before and upload the finished video to Loom. Check it runs no longer than 2:00 and that the link opens for someone who isn't signed in.
- Record each row as its own clip at 1920×1080 with the browser zoomed to 125%, then join them (Clipchamp is built into Windows 11).
- Run the conversions before recording and cut the waiting out of the video. Don't fake any output; just trim the wait.
- Pre-fill the text box from the fixtures; don't type on camera.
- Keep the voice-over at about 150 words a minute. The draft above is about 260 words, roughly 105 seconds, which leaves room for pauses. The timings above give each line enough time. Add captions; judges often watch without sound.
- If M7 (upload) shipped, swap the paste at 0:27 for a .docx upload; it reads better on screen.
- If there's spare time at the end of day 2, record the 0:27–1:31 clips then, as insurance.
- If M8 (ratings) didn't ship, end on the norms table and replace the rating shot with the end card.
