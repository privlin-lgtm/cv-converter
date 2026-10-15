# Intent: CV Converter MVP (Developers Institute hackathon build)
Author: Paul Rivlin · Source: idea (Phase 0 screen `phase0-jobseeker-coaches-2026-10.md`, idea V5) · Status: accepted

## Problem
A CV that works in one country works against you in another. An Israeli CV sent to a US, UK or German employer usually breaks local norms. It may carry a date of birth, marital status or ID number. Army service is written in Hebrew acronyms and ranks no one abroad can read. Dates are in the wrong format, and the page is the wrong length or paper size. Olim and other newcomers have the same problem in reverse: a US résumé or German Lebenslauf reads oddly to an Israeli recruiter.

A free chatbot will rewrite a CV, but it doesn't reliably know a given country's current norms, can't say where a rule comes from, and doesn't check its own output against those rules. Paul is a user himself: an Israeli jobseeker applying in Israel and abroad.

## Proposed outcome
A web app that takes a CV (pasted text, or a .docx or text-based .pdf) plus, optionally, the kind of job being applied for, and rewrites it to a target country's norms. It works in both directions through Israel:
- **Israelis applying abroad:** an Israeli CV, including army service, into a US résumé, a UK CV or a German Lebenslauf.
- **Olim and other newcomers:** a CV from abroad into Israeli norms.

The result shows the rewritten CV laid out for the target country. Next to it is a list of every change, each with the reason and a link to the source of the rule. Deterministic checks flag anything in the output that still breaks a rule, and questions ask for facts the app must not guess (such as work authorisation). The user saves it as a PDF from the browser, on the right paper size (A4, or US Letter for the US).

The country-norms rules live in the database: photo, age, date format, length, section order, how to describe army service, and more, each with its sources. That rules data is what a free chatbot doesn't have, and it is the part worth keeping after the hackathon.

v1 is English in, English out. Hebrew CVs are a stretch goal.

## Affected users and systems
- **Users:** Israelis applying to jobs in the US, UK or Germany; olim and other newcomers applying in Israel. First testers are Paul's Developers Institute classmates, running their own CVs, after the hackathon.
- **Judges and instructor:** Developers Institute, Full Stack + AI (part-time, May 2026 – December 2026), Hackathon #2.
- **Systems:** a new public GitHub repo in Paul's account; PostgreSQL via Knex; the Anthropic Claude API (Paul holds credits); Vercel for hosting once testers start (after the hackathon). There are no existing systems to integrate with.

## Constraints
- **Hackathon rules.** The official window is Thu 15 Oct – Tue 20 Oct 2026, 18:00 Israel time, about 4 hours a day, solo. The hackathon was postponed from its original start on Tue 13 Oct; work started on 13 Oct, before the postponement was announced, and the instructor knows and has approved this. No code before the event: planning documents and research notes only. Scaffolding, hooks, fixtures and seed data are written on the day. A document stating the end goal and planned functionality goes to the instructor before it starts.
- **Deliverables.** A public GitHub repo in Paul's own account, and a 2-minute demo video. Judged on functionality, creativity, code quality, teamwork and presentation, with quality of execution over originality.
- **Stack.** TypeScript throughout: React with Redux Toolkit (Vite) for the front end, Node.js with Express for the API, PostgreSQL with Knex. Testing with Vitest; linting with oxlint. These are the tools the course projects used (see `DI-BootCamp`). Libraries and open-source code are allowed.
- **Public repo, no secrets, no real CVs.** Never commit an API key or a real CV. Tests use made-up CVs only.
- **No CV storage.** Uploaded CVs are processed in memory and never written to the database, disk or logs. The database holds the country norms and testers' ratings, not CV text. A CV is sent to Anthropic's API for the rewrite; Anthropic deletes API inputs and outputs within 30 days (up to 2 years only if flagged for a usage-policy breach). The privacy note says this plainly.
- **No licence file; all rights reserved.** Without a licence, default copyright applies and Paul keeps all rights. GitHub's terms still let other users view and fork a public repo. The README says "© 2026 Paul Rivlin. All rights reserved."
- **Export** through a print stylesheet ("Save as PDF" in the browser) rather than a PDF library.
- **Never send CVs to employers.** Passing candidates to employers would count as job brokering under Israel's Employment Service Law, which needs a licence. The app only ever returns the CV to its owner. It is a jobseeker-side tool, which keeps it outside the EU AI Act's high-risk hiring category.
- **Honesty.** The app never invents facts, dates, grades, titles, work status or degree equivalences. Where a rule needs a fact the CV lacks, it asks. It never outputs classified military detail; if the source seems to contain some, it removes it and warns the user.
- **After the hackathon:** a two-week landing page with a Paddle checkout (Paddle sells Resume Worded, so CV tools are acceptable there). Vercel's free Hobby plan is for non-commercial use, so taking money needs Vercel Pro or another host.

## Out of scope
- Hebrew input or output (stretch goal only).
- Countries other than the US, UK, Germany and Israel.
- User accounts, saved CVs, history, or any storage of CV text.
- Cover letters, German Anschreiben, Arbeitszeugnisse, and job-ad tailoring.
- .docx export (the Israeli norm favours Word for agencies; see Open questions).
- Payments, the landing page and the Paddle application (after the hackathon).
- Sending or sharing CVs with anyone other than their owner.
- Photo handling of any kind.

## Open questions
1. **Tester pass mark.** Testers are asked: did it beat pasting your CV into ChatGPT? What result sends this to the landing-page test? A proposal: at least 5 testers, and a majority answering "better".
2. **.docx export.** Israeli sources say recruiters and agencies often want an editable Word file. Add it after the hackathon if olim testers ask for it?
3. **Deploy timing.** The plan deploys the week after the hackathon, before testers start. Should it still be tried on day 3, if time is left after the video, to give judges a live link? (Proposed: no; the video and repo are what's judged.)
4. **Rules in a public repo.** The four-country seed rules will be public in the repo. Proposed: accept it for these four countries, which are compiled from public sources, and keep later country packs and upkeep in a private repo.

## Success measure
- **Hackathon (Tue 20 Oct 2026):** a working end-to-end flow on made-up CVs in all four directions (Israel → US, UK, Germany; abroad → Israel). Every change cites a stored rule, the checks run, and Save as PDF uses the right paper size. Tests, lint and CI are green, the public repo has a README, and a 2-minute video is submitted.
- **Tester round (after the hackathon):** classmates run their own CVs and rate each result against a chatbot (better / same / worse). The pass mark is open question 1.
- **Market test (two weeks, landing page and Paddle checkout):** passes with at least 10 paid orders and at least 3 buyers saying a chatbot wasn't enough. It fails on any of: under 5 orders, buyers saying ChatGPT was enough, or refund requests above 20%.

## Where the rest of the chain lives
- `intent/2026-10-10-mvp/spec.md`: features, routes, pages, schema, AI design, concerns.
- `intent/2026-10-10-mvp/plan.md`: three-day milestones, cut line, first-hour guardrails, proof.
- `research/cv-norms-2026-10.md`: sourced country norms, ready to become seed data.
- `docs/demo-video-outline.md`: the 2-minute video.
