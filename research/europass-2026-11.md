# CV norms research: EU — Europass CV

Researched 7 Nov 2026, as phase 1 of adding a Europass target alongside Germany (brief: `briefs/2026-11-07-europass-research.md` in the project files). This file is research only: no seed, schema or UI change depends on it yet. Phase 2 turns the rules table into `norms` rows once Paul has reviewed it.

It follows the format of [cv-norms-2026-10.md](cv-norms-2026-10.md): the same column mapping to the `norms` table, the same status legend (CONFIRMED means an authoritative source states it, or two independent sources agree; UNVERIFIED means one weak source, or the researcher's inference) and the same wording rule for legal and sensitive-data rows. Every source below was opened during this pass.

**What "Europass" means here.** Europass is the EU's free online tool for profiles, CVs and cover letters (europass.europa.eu), run by the European Commission in 31 languages, with National Europass Centres in 38 countries. The tool has no fixed public style guide for the CV it generates. The most complete official writing guidance is the older *Instructions for using the Europass curriculum vitae* (© European Union 2002–2010), which EU bodies still link from their vacancy pages. The rules below use the current tool's structure (profile sections, templates, CEFR grid, digital skills) and that guidance for how to fill each section. Where the two differ, the row says so.

**Source key.** To keep rows short, these sources are cited by name:

| Name | URL |
|---|---|
| Europass instructions (EEAS copy) | https://www.eeas.europa.eu/sites/default/files/europass_cv_instructions.pdf |
| Europass: Create your CV | https://europass.europa.eu/en/create-europass-cv |
| Europass: profile content | https://europass.europa.eu/en/what-type-information-should-i-include-my-europass-profile |
| Europass: mandatory fields | https://europass.europa.eu/en/do-i-need-complete-all-sections-europass-profile |
| Europass FAQ p1 | https://europass.europa.eu/en/faq?page=1 |
| Europass FAQ p2 | https://europass.europa.eu/en/faq?page=2 |
| Europass: 2022 tool changes | https://europass.europa.eu/en/news/new-improvements-europass-tools |
| CEFR self-assessment grid | https://europass.europa.eu/system/files/2020-05/CEFR%20self-assessment%20grid%20EN.pdf |
| National Europass Centres | https://europass.europa.eu/en/about-europass/contact-us/national-europass-centres |
| EURES: 6 steps (part 2) | https://eures.europa.eu/6-steps-starting-professional-career-abroad-part-2-2019-07-12_en |
| AMPEU leaflet (Croatian Europass centre) | https://www.ampeu.hr/files/europass-letak_ENG_za-web_2025.pdf |
| Europass Ukraine | https://europass.nqa.gov.ua/en/?p=442 |
| Omnia guide | https://www.omnia.fi/en/media/507/download |
| Tempus HR survey (Hungarian Europass centre) | https://tka.hu/new/5274/europass-documents-through-the-eyes-of-hr-professionals |
| EURES living and working: *country* | https://eures.europa.eu/living-and-working/living-and-working-conditions/living-and-working-conditions-<country>_en |

---

## EU — Europass CV (output in English)

| key | rule | why | check | sources | status |
|---|---|---|---|---|---|
| document_name | Title the document "Curriculum Vitae" and head it with the person's name. Call it a Europass-style CV in notes to the user. Never add the Europass logo or say the CV was made with the official Europass tool. | Employers recognise the Europass layout, but the app does not produce the official tool's output, and the official output carries the Europass logo. | none | Europass: Create your CV ; Omnia guide | UNVERIFIED (the logo point is inference) |
| section_order | Use the Europass section order: Personal information → Job applied for / About me → Work experience → Education and training → Language skills → Digital skills → other skills (communication, organisational, job-related) → Driving licence → Additional information (publications, projects, memberships, volunteering) → Annexes. Delete any section with nothing relevant in it. | This is the structure European recruiters know from the Europass template, and empty headings waste space. | heading order | Europass instructions (EEAS copy) ; Omnia guide ; Europass FAQ p2 (sections can be reordered) | CONFIRMED |
| section_order_by_level | With little work experience, put Education and training before Work experience. | Lead with the strongest evidence; the Europass tool lets you reorder the main sections. | none | Europass instructions (EEAS copy) ; Europass FAQ p2 | CONFIRMED |
| length_pages | Keep the CV to two pages at most. Use short sentences and only relevant information. | Europass guidance and EURES both say two pages are enough, and three can read as too long. | `max_words` (see checks) | Europass instructions (EEAS copy) ; AMPEU leaflet ; EURES: 6 steps (part 2) | CONFIRMED |
| paper_size | Use A4. | A4 is the paper standard across the EU and EEA, and EURES country guides give CV length in A4 pages. | PDF page size is 210×297 mm | EURES living and working: Netherlands ; EURES living and working: Denmark ; EURES living and working: Austria | CONFIRMED |
| chronology | List entries newest first in every section. | Europass and national guidance both put the most recent role first. | start dates descend within each section | Europass: Create your CV ("Use reverse chronological order") ; Europass instructions (EEAS copy) ; AMPEU leaflet | CONFIRMED |
| personal_information | Open with Personal information: name, a contactable address including the country (city and country is enough), phone in international format with a "+" and country code (e.g. +972 50 123 4567), and email. Only name and surname are required by the tool. | Recruiters abroad need to reach you, and the international format works from any country. | email regex present; phone starts with "+" | Europass instructions (EEAS copy) ; Europass: mandatory fields | CONFIRMED |
| optional_personal_data | Treat date of birth, nationality and gender as optional fields. Keep them only if the user supplied them, and never invent or ask for them. If nationality is kept, add a work-authorisation line only from what the user states (e.g. "EU citizen" or "Requires a work permit"). | The Europass template has these fields but marks them optional, and only name and surname are mandatory. | none | Europass instructions (EEAS copy) ; Europass: mandatory fields | CONFIRMED |
| sensitive_data | Remove health, disability, religion or beliefs, and marital status or children. Don't add anything that is not relevant to the job. | The Europass portal tells users never to include sensitive personal information such as health or beliefs, or information not relevant to their career. | `absent` marital status (see checks) | Europass: profile content ; Europass instructions (EEAS copy) (marital status only "if you judge it important") | CONFIRMED (health and beliefs); marital status UNVERIFIED |
| photo | Never insert, require or generate a photo. Add a note that the Europass template has an optional photo field, and that a photo is only worth adding when the employer asks for one or the target country expects it. | Europass guidance says a photo is not essential unless the employer asks. | none | Europass instructions (EEAS copy) ; Europass Ukraine ("only if the job posting requires it") ; Europass FAQ p1 (photo upload) | CONFIRMED |
| headline_about_me | Under Personal information, add "Job applied for" (the target role) and a short "About me" of 2–4 sentences with no "I" or "my", tailored to the role. | HR staff surveyed by the Hungarian Europass centre found the "job applied for" line the most useful section, and Europass guidance says to tailor each CV. | none | Europass instructions (EEAS copy) ; Tempus HR survey ; Europass Ukraine | CONFIRMED |
| work_experience | Make one entry per relevant job: dates, job title, employer, city and country, then the main activities as bullets, with numbers where they help. Explain any gap in the career with a dated one-line entry giving the user's real reason; never invent one. | Europass entries are compared side by side, and unexplained gaps raise questions. | flag gaps over 3 months between consecutive date ranges | Europass instructions (EEAS copy) ; Europass Ukraine | CONFIRMED |
| education | Make one entry per qualification: dates, the exact qualification title in English (no abbreviation on its own), institution, city and country. Add the EQF level only if the user knows it. Drop schooling below the highest relevant level (e.g. high school when there is a degree). | The full title and level let recruiters in other countries compare foreign qualifications. | none | Europass instructions (EEAS copy) | CONFIRMED |
| date_format | Write every period as MM/YYYY – MM/YYYY, with "Current" for an ongoing role. | Month and year are the norm in continental European CVs, and day-first or month-name formats are read differently across countries. | `all_dates_match` (see checks) | Europass instructions (EEAS copy) (uses "From March 1994 to December 1999", an older style) | UNVERIFIED (the current tool's date display was not opened) |
| language_grid | List mother tongue(s) first. For every other language, give a CEFR self-assessment (A1–C2) for Listening, Reading, Spoken production, Spoken interaction and Writing, plus any certificate with its level and date. Never overstate a level, and never use stars, bars or percentages. | The language grid is the Europass section HR staff rate most highly, and the six CEFR levels are comparable across Europe. | `present` CEFR level (see checks) | Europass instructions (EEAS copy) ; CEFR self-assessment grid ; Omnia guide ; Tempus HR survey | CONFIRMED |
| digital_skills | Group digital skills by theme (e.g. "Programming: Python, TypeScript"), using the tool names from the job ad. Add a Europass digital skills test result only if the user supplied one. | The Europass tool groups digital skills under user-named headings and can attach the digital skills test result. | none | Omnia guide ; Europass: 2022 tool changes | CONFIRMED |
| references | Remove referee names and contact details unless the user says the referees agreed to be listed. "References available on request" is optional. | Europass guidance says never to give a referee's details without their agreement. | none | Europass instructions (EEAS copy) ; EURES: 6 steps (part 2) | CONFIRMED |
| signature | Add no place, date or signature block. Note to the user that some countries (e.g. Germany) still expect one. | Neither the Europass guidance nor the tool's documentation mentions a signature. | `absent` /\[Signature\]/ (optional) | Europass instructions (EEAS copy) ; Europass FAQ p1 ; Europass FAQ p2 | UNVERIFIED (absence of evidence) |
| application_language | Output in English, with a note that many employers expect the local language unless the ad is in English, and that the Europass tool can produce the same CV in 31 languages. | Paul's 7 Nov decision keeps every output in English; EURES country guides often ask for the local language. | none | EURES living and working: Croatia ("in Croatian, unless otherwise requested") ; EURES living and working: Netherlands (letters in Dutch) ; Europass FAQ p1 (31 languages) | CONFIRMED |

### Army service for the Europass target

The existing [army-service rows](cv-norms-2026-10.md#israeli-military-and-national-service-on-cvs-abroad) apply. Proposed seeding:

- Every `all` row (`military_context_line`, `military_ranks`, `military_jargon`, `military_unit_names`, `military_classified`, `military_skills`, `security_clearance`, `national_service`, `reserve_duty`) is copied to EU unchanged.
- **Placement:** use the German rule (`military_placement_de`): always a dated entry, never dropped. Europass guidance asks you to explain career gaps and lists military service under Additional information "if important", and the strictest EU market (Germany) expects a CV with no gaps. Relevant service goes under Work experience as a job; other service goes as one dated line. Status: UNVERIFIED (inference from Europass instructions (EEAS copy) and the DE source).
- `us_veteran_status` is not copied.

**Nuance (Europass)**
- **Official guidance is old.** The fullest Europass writing guidance dates from 2002–2010; the 2020 tool replaced the fixed template with a profile, several templates and a "Create CV" step, but published no new style guide. Rows that rest on the old instructions still match what the current tool asks for (fields, sections, CEFR grid).
- **Marital status:** the old instructions allow it "if you judge it important"; the portal now says to leave out information not relevant to your career. v1 removes it, in line with the other four targets.
- **Photo:** the tool supports a photo (PNG or JPG under 20 MB), and since 2022 it can be included when a CV is published on EURES. The guidance still calls it optional.
- **Date of birth format:** the old instructions show dd/mm/yyyy (with dots in the example). Only relevant if the user supplied it.
- **Couldn't load:** the EEA's copy of the instructions, the Europass CV XML schema documentation and the EEAS's 2026 Word template (all failed from this sandbox).

---

## Where Europass fits

How employers in each country treat a Europass CV, by what an opened source says. "Recommended" means a national or EU employment service tells jobseekers to use it; "Accepted" means a source says it is used or can be used; "Poor fit" means a source says employers don't know it or prefer a national or personalised CV; "Unknown" means no source opened says either way. Many EURES country pages carry the same generic paragraph about Europass; that paragraph is not counted as evidence.

| Country | Fit | Evidence (quoted or paraphrased) | Source |
|---|---|---|---|
| Austria | Recommended | "The Europass CV is required by many companies and can provide great support in this context." | EURES living and working: Austria |
| Belgium | Unknown | Generic paragraph only. | EURES living and working: Belgium |
| Bulgaria | Recommended | "The use of the European CV format available on the Europass website is recommended." | EURES living and working: Bulgaria |
| Croatia | Unknown | Generic paragraph only; CV "in Croatian, unless otherwise requested". | EURES living and working: Croatia |
| Cyprus | Accepted | "There is no standardised CV, but the EUROPASS CV is disseminated very quickly to the Cyprus business world." | EURES living and working: Cyprus |
| Czechia | Unknown | Generic paragraph only. | EURES living and working: Czechia |
| Denmark | Unknown | Generic paragraph only. | EURES living and working: Denmark |
| Estonia | Unknown | Generic paragraph only. | EURES living and working: Estonia |
| Finland | Accepted | "The Europass CV is a harmonised European CV format and can be used in Finland as well." | EURES living and working: Finland |
| France | Unknown | No mention on EURES or the LSE France profile. | EURES living and working: France ; https://info.lse.ac.uk/current-students/careers/information-and-resources/country-profiles/france |
| Germany | Mixed: poor fit for private employers | EURES: "We also recommend that you use the Europass format". LSE: "German companies prefer applications to be personalised … rather than use the Europass template". Keep the DE target as the default for Germany. | EURES living and working: Germany ; https://info.lse.ac.uk/current-students/careers/information-and-resources/country-profiles/germany |
| Greece | Accepted (common) | The most common CV is "the CV that can be obtained from the DYPA online portal, or the European EUROPASS template"; many companies use application forms instead. | EURES living and working: Greece |
| Hungary | Accepted | In a 2015 survey of HR staff at 70 companies, all knew the Europass CV and about 3.75 in 10 CVs received used it. | Tempus HR survey |
| Ireland | Unknown | No mention. | EURES living and working: Ireland |
| Italy | Accepted | Jobseekers "can fill in the European template". Separately, Italian CVs "must contain permission for personal data processing" (a consent line), which the Europass target does not add. | EURES living and working: Italy |
| Latvia | Unknown | Link to model CVs only. | EURES living and working: Latvia |
| Lithuania | Accepted | The European CV "is gaining in popularity in Lithuania". | EURES living and working: Lithuania |
| Luxembourg | Unknown | No mention. | EURES living and working: Luxembourg |
| Malta | Recommended | "It is recommended to use the standard European CV format." | EURES living and working: Malta |
| Netherlands | Poor fit | The Europass CV "is not yet widely known and/or well established amongst employers in the Netherlands"; for unsolicited applications the standard Dutch CV is recommended. | EURES living and working: Netherlands |
| Poland | Unknown | Templates on the Europass site are mentioned; nothing on employers. | EURES living and working: Poland |
| Portugal | Unknown | No mention. | EURES living and working: Portugal |
| Romania | Recommended | "Regarding the CV format, the EURES network in Romania recommends the use of the Europass platform." | EURES living and working: Romania |
| Slovakia | Unknown | Link only. | EURES living and working: Slovakia |
| Slovenia | Unknown | No mention. | EURES living and working: Slovenia |
| Spain | Unknown | No mention. | EURES living and working: Spain |
| Sweden | Recommended (by the employment service) | "It is a good idea to use Europass"; Arbetsförmedlingen: "When looking for jobs in Europe, you can use the Europass CV tool." | EURES living and working: Sweden ; https://arbetsformedlingen.se/other-languages/english-engelska/find-your-new-job/find-a-job-abroad |
| Iceland (EEA) | Unknown | No mention. | EURES living and working: Iceland |
| Liechtenstein (EEA) | Unknown | Employment sections "under construction". | EURES living and working: Liechtenstein |
| Norway (EEA) | Unknown | No mention. | EURES living and working: Norway |
| Switzerland | Unknown | No mention, though Switzerland has a National Europass Centre. | EURES living and working: Switzerland ; National Europass Centres |
| United Kingdom | Unknown | No UK careers source opened mentions Europass (Oxford Careers CV page checked). The UK target already exists; use it for UK jobs. | https://www.careers.ox.ac.uk/cvs |
| Ukraine (non-EU) | Accepted | Europass Ukraine says the CV is "widely recognised by employers, universities, and other institutions in Ukraine and EU countries" (the national centre's own claim). | Europass Ukraine |
| Bosnia and Herzegovina, Moldova, Montenegro, North Macedonia, Serbia, Türkiye (non-EU) | Unknown | Each has a National Europass Centre, so the tool is supported there; no source opened says how employers treat it. | National Europass Centres |

**Summary.** Recommended by a national or EU employment service: Austria, Bulgaria, Malta, Romania, Sweden. Accepted or common: Cyprus, Finland, Greece, Hungary, Italy, Lithuania, plus Ukraine outside the EU. Poor fit: the Netherlands, and German private employers (where the DE target fits better). Unknown: the other 17 EU/EEA countries, Switzerland, the UK and the rest of the non-EU Europass countries. EURES also says generally that the format "allows your qualifications and experience to be easily compared across countries" and suits both vocational and academic graduates (EURES: 6 steps (part 2)); EU institutions themselves ask for it in their own vacancies (Europass instructions (EEAS copy)).

**Gaps in the evidence.** The EURES pages are long and were read up to 100,000 characters each; the "applying for a job" sections fall inside that range on every page checked. No source found rates Europass against applicant-tracking systems; commercial résumé sites that discuss this were not used as sources.

---

## Proposed checks (at most 4)

| Rule key | Check |
|---|---|
| length_pages | `max_words` 900 (two A4 pages, the same budget as DE) |
| sensitive_data | `absent` the shared `MARITAL_STATUS` pattern from `server/db/seeds/02_norms.ts` (matches personal-status lines only, after PR #17), flags `i` |
| language_grid | `present` /\b[ABC][12]\b/ (flags a CV with no CEFR level; a monolingual CV will also be flagged, which is acceptable for a review flag) |
| date_format | `all_dates_match` /^\d{2}\/(19\|20)\d{2}$/ (allowed word: "Current"); only if the lane accepts the UNVERIFIED date rule |

---

## Open design questions for the lane (not decided)

1. **Country code.** `countries.code` is free text, so `EU` fits the column. The request schema's `to` enum and the pair rule (`IL` to US, GB or DE) would gain `EU`. Should the source direction also allow `EU` → IL later (a Europass CV from abroad), or does `ABROAD` already cover it?
2. **A non-country in `countries`.** `name` would be "European Union (Europass)". Should the table gain a `kind` column (country vs. regional format) so the UI can group it, or is a naming convention enough?
3. **Document name.** "Curriculum Vitae (Europass)", "Europass-style CV" or just "CV"? The app should not imply it is the official Europass output.
4. **Layout.** Keep the current single-column printable layout, or add a Europass-style two-column layout (labels in a narrow left column, as in the Europass templates)? A two-column layout is also closer to the DE `tabular_layout` rule, so it could serve both.
5. **How the "where it fits" note reaches the user.** Options: a static note under the target select; a note on the result page; or a `norms` row with no check whose `why` carries the fit summary. The table above changes over time, so it may belong in the database rather than in the UI code.
6. **Germany overlap.** When a user picks EU but the job is in Germany (or the Netherlands), should the app suggest the DE target, and how would it know the job's country (a new optional field)?
7. **Language grid size.** A full five-skill grid per language takes space. Allow a compact form ("English – C1") when the CV runs long, or always use the grid?
8. **Photo note.** The EU target will tell users a photo is optional. Should it name the countries where a photo is still common (e.g. Germany, France per LSE), which needs more sourcing?
