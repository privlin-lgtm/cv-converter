import type { Knex } from 'knex'
import type { CheckDef } from '../../src/schemas/checkDef.js'

type CountryCode = 'US' | 'GB' | 'DE' | 'IL'

interface NormRow {
  key: string
  rule: string
  why: string
  sources: string[]
  status: 'confirmed' | 'unverified'
  check?: CheckDef
}

interface ArmyRow extends NormRow {
  targets: CountryCode[]
}

// Transcribed from research/cv-norms-2026-10.md, following its seeding notes. Checks are the
// "Suggested v1 checks" from the same file; every other rule has no check.
const VERIFIED_ON = '2026-10-10'

const us: NormRow[] = [
  {
    key: 'document_name',
    rule: 'Title and refer to the document as a résumé. Never head it "Curriculum Vitae" or "CV" for private-sector roles.',
    why: 'In the US a CV is a longer academic/research document.',
    sources: [
      'https://capd.mit.edu/jobs-and-internships/resumes-cvs-cover-letters-and-linkedin/resumes',
      'https://career.oregonstate.edu/students/career-resources-international-students',
    ],
    status: 'confirmed',
    check: { type: 'absent', pattern: 'curriculum vitae', flags: 'i' },
  },
  {
    key: 'length_pages',
    rule: 'Keep to 1–2 full pages. Cut to fit, and never exceed 2.',
    why: 'Recruiters expect a brief, skimmable document.',
    sources: [
      'https://career.unm.edu/career-tools/resumeguide2024.pdf',
      'https://career.oregonstate.edu/students/career-resources-international-students',
    ],
    status: 'confirmed',
    check: { type: 'max_words', max: 1100 },
  },
  {
    key: 'length_by_level',
    rule: "Use 1 page for students, new grads and anyone with under ~10 years' experience. Use 2 pages only for longer, relevant careers.",
    why: 'One page is the usual expectation unless experience fills two.',
    sources: [],
    status: 'unverified',
  },
  {
    key: 'paper_size',
    rule: 'Set page size to US Letter (8.5 × 11 in), not A4.',
    why: 'US printers and readers use Letter.',
    sources: [],
    status: 'unverified',
  },
  {
    key: 'photo',
    rule: 'Remove any photo, headshot or image of the candidate.',
    why: 'US employers avoid photos because they reveal protected traits. EEOC says employers should not ask for one before an offer.',
    sources: [
      'https://www.eeoc.gov/prohibited-employment-policiespractices',
      'https://career.unm.edu/career-tools/resumeguide2024.pdf',
    ],
    status: 'confirmed',
  },
  {
    key: 'date_of_birth',
    rule: 'Remove date of birth, age and place of birth.',
    why: 'Age is irrelevant to the job and can trigger age bias.',
    sources: [
      'https://www.uvm.edu/career/international-students',
      'https://career.oregonstate.edu/students/career-resources-international-students',
    ],
    status: 'confirmed',
    check: { type: 'absent', pattern: '\\b(date of birth|DOB|born on)\\b', flags: 'i' },
  },
  {
    key: 'graduation_years',
    rule: 'Keep graduation years for recent degrees. For degrees 15+ years old, ask the user whether to drop the year.',
    why: "Disclosing age is the candidate's choice.",
    sources: [
      'https://career.unm.edu/career-tools/resumeguide2024.pdf',
    ],
    status: 'unverified',
  },
  {
    key: 'personal_status',
    rule: 'Remove marital status, children, nationality/citizenship, religion, gender, height/weight and health.',
    why: 'These are irrelevant to the job and invite discrimination.',
    sources: [
      'https://career.oregonstate.edu/students/career-resources-international-students',
      'https://www.eeoc.gov/prohibited-employment-policiespractices',
    ],
    status: 'confirmed',
    check: { type: 'absent', pattern: '\\b(married|single|divorced|children)\\b', flags: 'i' },
  },
  {
    key: 'national_id',
    rule: 'Remove Social Security, passport and Israeli ID (teudat zehut) numbers.',
    why: "They aren't needed until hiring paperwork, and they are an identity-theft risk.",
    sources: [],
    status: 'unverified',
  },
  {
    key: 'address',
    rule: 'Show City, State (or City, Country) only. Remove the street address and any full foreign address.',
    why: 'Employers ask for a street address later if they need it.',
    sources: [
      'https://career.unm.edu/career-tools/resumeguide2024.pdf',
      'https://www.uvm.edu/career/international-students',
    ],
    status: 'confirmed',
  },
  {
    key: 'work_authorization',
    rule: 'Do not state visa status or a need for sponsorship; handle it in the application form. Add "Authorized to work in the US" only if the user confirms it is true and wants it.',
    why: 'Flagging sponsorship can cost the interview, and status must never be misstated.',
    sources: [
      'https://drexel.edu/scdc/career-services/searching-for-job/international-job-seeking-tips',
      'https://career.unm.edu/career-tools/resumeguide2024.pdf',
    ],
    status: 'confirmed',
  },
  {
    key: 'contact_details',
    rule: 'Header: name, phone with country code, professional email, city/state and LinkedIn URL. Add GitHub or a portfolio if relevant.',
    why: 'Missing contact details is one of the top résumé mistakes.',
    sources: [
      'https://career.unm.edu/career-tools/resumeguide2024.pdf',
      'https://careerservices.fas.harvard.edu/resources/hes-create-impactful-resumes-and-cover-letters/',
    ],
    status: 'confirmed',
  },
  {
    key: 'summary',
    rule: 'Replace an "Objective" with a short professional summary without pronouns, or omit it.',
    why: 'A summary says what you offer; an objective says what you want.',
    sources: [
      'https://career.unm.edu/career-tools/resumeguide2024.pdf',
    ],
    status: 'confirmed',
  },
  {
    key: 'section_order',
    rule: 'Experienced: Summary → Experience → Skills → Education. New grads: Education → Experience/Projects → Skills.',
    why: 'Lead with your strongest evidence.',
    sources: [
      'https://career.unm.edu/career-tools/resumeguide2024.pdf',
    ],
    status: 'unverified',
  },
  {
    key: 'chronology',
    rule: 'List entries in reverse chronological order within each section.',
    why: 'Readers look for your latest role first.',
    sources: [
      'https://careerservices.fas.harvard.edu/resources/hes-create-impactful-resumes-and-cover-letters/',
    ],
    status: 'confirmed',
  },
  {
    key: 'date_format',
    rule: 'Write dates as Mon YYYY – Mon YYYY (e.g. Mar 2021 – Aug 2024), with "Present" for current roles. Put dates at the end of the line, and never use DD/MM/YYYY.',
    why: 'US readers misread day-first dates.',
    sources: [
      'https://careerservices.fas.harvard.edu/resources/hes-create-impactful-resumes-and-cover-letters/',
    ],
    status: 'unverified',
    check: {
      type: 'all_dates_match',
      pattern: '^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) (19|20)\\d{2}$',
      allow: ['^Present$'],
    },
  },
  {
    key: 'bullet_style',
    rule: 'Start each bullet with an action verb and quantify results (numbers, %, $). No "I/my/we". Use past tense for past roles and present tense for the current one.',
    why: 'Recruiters skim for impact.',
    sources: [
      'https://careerservices.fas.harvard.edu/resources/hes-create-impactful-resumes-and-cover-letters/',
      'https://career.unm.edu/career-tools/resumeguide2024.pdf',
    ],
    status: 'confirmed',
  },
  {
    key: 'education_gpa',
    rule: 'Include GPA only if it is 3.5+/4.0; otherwise omit it.',
    why: 'A modest GPA adds nothing.',
    sources: [
      'https://career.unm.edu/career-tools/resumeguide2024.pdf',
    ],
    status: 'confirmed',
  },
  {
    key: 'foreign_grade_scale',
    rule: 'Do not convert a 0–100 average to 4.0. Omit it or state the scale ("Average 88/100").',
    why: 'Unofficial conversions can look misleading.',
    sources: [],
    status: 'unverified',
  },
  {
    key: 'foreign_degree',
    rule: 'Keep the real degree and institution in English (e.g. "B.Sc. Computer Science, Technion"). If it has been evaluated, add "Evaluated as equivalent to a U.S. bachelor\'s degree by WES, Mar 2024." Never relabel it as a US degree without an evaluation.',
    why: 'An evaluation shows your degree meets their requirement.',
    sources: [
      'https://www.wes.org/how-to-market-your-international-education-to-employers/',
      'https://ece.org/Blogs/How-to-reference-your-credential-evaluation-report-on-a-resume.htm',
    ],
    status: 'confirmed',
  },
  {
    key: 'language_levels',
    rule: 'List non-English languages with plain levels (e.g. "Hebrew (native), Russian (conversational)"). Omit English for US roles, and replace bare CEFR codes with words.',
    why: 'Languages are a plus, and English is assumed.',
    sources: [
      'https://www.uvm.edu/career/international-students',
      'https://career.unm.edu/career-tools/resumeguide2024.pdf',
    ],
    status: 'confirmed',
  },
  {
    key: 'references',
    rule: 'Remove referees and the line "References available upon request".',
    why: 'Employers request references separately.',
    sources: [
      'https://careerservices.fas.harvard.edu/resources/hes-create-impactful-resumes-and-cover-letters/',
      'https://career.unm.edu/career-tools/resumeguide2024.pdf',
    ],
    status: 'confirmed',
  },
  {
    key: 'hobbies',
    rule: 'Remove hobbies unless they are job-relevant or a notable achievement.',
    why: 'Space is better spent on evidence.',
    sources: [
      'https://career.unm.edu/career-tools/resumeguide2024.pdf',
    ],
    status: 'confirmed',
  },
  {
    key: 'spelling',
    rule: 'Use US spelling (organize, center, program). Give money in USD, or add a USD figure.',
    why: 'British spelling and shekel amounts read as foreign.',
    sources: [],
    status: 'unverified',
  },
  {
    key: 'ats_format',
    rule: 'Use a single column, with no tables, text boxes, graphics, icons or skill bars. Use common fonts at 10 pt or more, and keep contact info out of headers and footers.',
    why: 'Applicant tracking systems scramble or drop such content.',
    sources: [
      'https://capd.mit.edu/resources/make-your-resume-ats-friendly/',
      'https://careerservices.fas.harvard.edu/resources/hes-create-impactful-resumes-and-cover-letters/',
    ],
    status: 'confirmed',
  },
  {
    key: 'legal_basis',
    rule: 'When explaining removals, call them US norms that reduce bias risk, not legal bans on the candidate.',
    why: 'EEOC says employers should not request photos, and that questions about protected traits can be evidence of bias. The ADEA protects people aged 40+.',
    sources: [
      'https://www.eeoc.gov/prohibited-employment-policiespractices',
      'https://www.eeoc.gov/pre-employment-inquiries-and-race',
      'https://www.eeoc.gov/age-discrimination',
    ],
    status: 'confirmed',
  },
  {
    key: 'federal_resume',
    rule: 'If the target is a US federal job, use the federal format instead: max 2 pages, with MM/YYYY dates and hours per week for each job.',
    why: 'Federal résumés follow different rules.',
    sources: [
      'https://www.opm.gov/policy-data-oversight/hiring-information/merit-hiring-plan-resources/agency-guidance-on-the-two-page-limit-on-resume-length',
    ],
    status: 'confirmed',
  },
]

const gb: NormRow[] = [
  {
    key: 'document_name',
    rule: 'Call it a "CV", never "résumé". Head it with the person\'s name, not "Curriculum Vitae".',
    why: 'UK employers say CV, and your name is the most useful heading.',
    sources: [
      'https://targetjobs.co.uk/careers-advice/cvs-applications-and-tests/big-guide-cv-writing-make-our-template-your-own',
      'https://nationalcareers.service.gov.uk/careers-advice/cv-sections',
    ],
    status: 'confirmed',
    check: { type: 'absent', pattern: 'r[ée]sum[ée]', flags: 'i' },
  },
  {
    key: 'length_pages',
    rule: 'Keep to two pages. Allow three only for senior candidates with a lot of recent experience.',
    why: 'Recruiters expect a short, two-page CV.',
    sources: [
      'https://www.prospects.ac.uk/careers-advice/cvs-and-cover-letters/how-to-write-a-cv',
      'https://www.careers.ox.ac.uk/cvs',
      'https://studentservices.on.worc.ac.uk/wp-content/uploads/CV-and-Covering-Letters-Int-students-DR-020626.pdf',
    ],
    status: 'confirmed',
    check: { type: 'max_words', max: 1100 },
  },
  {
    key: 'paper_size',
    rule: 'Set A4 (not US Letter), margins of about 2.5 cm, and one plain font (Arial, Calibri) at 10–12 pt.',
    why: 'The UK uses A4 paper, and plain fonts are easy to read.',
    sources: [
      'https://www.prospects.ac.uk/careers-advice/cvs-and-cover-letters/how-to-write-a-cv',
      'https://nationalcareers.service.gov.uk/careers-advice/cv-sections',
    ],
    status: 'confirmed',
  },
  {
    key: 'photo',
    rule: 'Remove any photo.',
    why: "UK CVs don't include photos, except for acting and modelling jobs.",
    sources: [
      'https://www.prospects.ac.uk/careers-advice/cvs-and-cover-letters/how-to-write-a-cv',
      'https://targetjobs.co.uk/careers-advice/cvs-applications-and-tests/big-guide-cv-writing-make-our-template-your-own',
      'https://studentservices.on.worc.ac.uk/wp-content/uploads/CV-and-Covering-Letters-Int-students-DR-020626.pdf',
    ],
    status: 'confirmed',
  },
  {
    key: 'date_of_birth',
    rule: 'Remove date of birth and age.',
    why: 'Your age is irrelevant to the job, and it is a protected characteristic under UK law.',
    sources: [
      'https://nationalcareers.service.gov.uk/careers-advice/cv-sections',
      'https://www.prospects.ac.uk/careers-advice/cvs-and-cover-letters/how-to-write-a-cv',
      'https://www.careers.ox.ac.uk/cvs',
      'https://www.acas.org.uk/sites/default/files/2024-04/age-discrimination-key-points-for-the-workplace.pdf',
    ],
    status: 'confirmed',
    check: { type: 'absent', pattern: '\\b(date of birth|DOB|born on)\\b', flags: 'i' },
  },
  {
    key: 'marital_status_gender',
    rule: 'Remove marital status and gender/sex.',
    why: "They aren't relevant to the job, and UK employers don't expect them.",
    sources: [
      'https://nationalcareers.service.gov.uk/careers-advice/cv-sections',
      'https://www.careers.ox.ac.uk/cvs',
      'https://studentservices.on.worc.ac.uk/wp-content/uploads/CV-and-Covering-Letters-Int-students-DR-020626.pdf',
    ],
    status: 'confirmed',
    check: { type: 'absent', pattern: '\\b(married|single|divorced)\\b', flags: 'i' },
  },
  {
    key: 'personal_other',
    rule: 'Remove details about children, religion, ethnicity, and health or disability.',
    why: 'These are protected characteristics, and employers may not ask about health before a job offer.',
    sources: [
      'https://www.acas.org.uk/recruitment/follow-discrimination-law',
      'https://www.gov.uk/discrimination-your-rights',
    ],
    status: 'unverified',
  },
  {
    key: 'nationality',
    rule: 'Remove the "Nationality" line. Where it helps, add a right-to-work line instead.',
    why: 'Employers need to know whether you can work in the UK, not which passport you hold.',
    sources: [
      'https://nationalcareers.service.gov.uk/careers-advice/cv-sections',
      'https://www.careers.ox.ac.uk/cvs',
    ],
    status: 'confirmed',
  },
  {
    key: 'id_numbers',
    rule: 'Remove Israeli ID (teudat zehut), passport and National Insurance numbers.',
    why: 'The personal details on a CV should be contact details only.',
    sources: [
      'https://nationalcareers.service.gov.uk/careers-advice/cv-sections',
    ],
    status: 'unverified',
  },
  {
    key: 'address',
    rule: 'Cut to town/city and country (or the UK postcode area). Remove the street address.',
    why: "A full address isn't needed and can be a fraud risk.",
    sources: [
      'https://www.careers.ox.ac.uk/cvs',
      'https://www.prospects.ac.uk/careers-advice/cvs-and-cover-letters/how-to-write-a-cv',
      'https://studentservices.on.worc.ac.uk/wp-content/uploads/CV-and-Covering-Letters-Int-students-DR-020626.pdf',
    ],
    status: 'confirmed',
  },
  {
    key: 'contact_linkedin',
    rule: 'Include name, mobile number with country code (e.g. +972), a professional email address, and a LinkedIn URL if the profile is up to date.',
    why: 'Employers need a way to contact you.',
    sources: [
      'https://nationalcareers.service.gov.uk/careers-advice/cv-sections',
      'https://www.prospects.ac.uk/careers-advice/cvs-and-cover-letters/how-to-write-a-cv',
      'https://targetjobs.co.uk/careers-advice/cvs-applications-and-tests/big-guide-cv-writing-make-our-template-your-own',
    ],
    status: 'confirmed',
  },
  {
    key: 'work_authorization',
    rule: 'If the user states their status, add one line in the header with the visa type, any work restrictions and the expiry date, or "Will require Skilled Worker visa sponsorship". Never make up a status.',
    why: 'Employers must check your right to work before hiring, so saying it up front saves time.',
    sources: [
      'https://www.careers.manchester.ac.uk/international/ukworkafterstudy/talkingtoemployersaboutyourvisa',
      'https://www.careers.ox.ac.uk/cvs',
      'https://www.gov.uk/check-job-applicant-right-to-work',
      'https://warwick.ac.uk/services/careers/international/students/essential_information/application_visa_questions/answering-visa-related-questions-on-job-application-forms-feb-2026.pdf',
    ],
    status: 'confirmed',
  },
  {
    key: 'summary',
    rule: 'Open with an untitled paragraph of up to 150 words, tailored to the job. Use first or third person and keep to one. Avoid clichés such as "team player".',
    why: 'A short, specific opening shows quickly that you fit the job.',
    sources: [
      'https://www.prospects.ac.uk/careers-advice/cvs-and-cover-letters/writing-a-personal-statement-for-your-cv',
      'https://nationalcareers.service.gov.uk/careers-advice/cv-sections',
    ],
    status: 'confirmed',
  },
  {
    key: 'section_order',
    rule: 'Order the sections: contact details, profile, experience, education, skills/languages, interests, references line. Put education first only for students and recent graduates.',
    why: 'Relevant experience matters most.',
    sources: [
      'https://nationalcareers.service.gov.uk/careers-advice/cv-sections',
      'https://www.prospects.ac.uk/careers-advice/cvs-and-cover-letters/how-to-write-a-cv',
    ],
    status: 'confirmed',
  },
  {
    key: 'chronology',
    rule: 'List experience and education in reverse chronological order (most recent first).',
    why: 'Recruiters want to see your most recent work first.',
    sources: [
      'https://nationalcareers.service.gov.uk/careers-advice/cv-sections',
      'https://www.prospects.ac.uk/careers-advice/cvs-and-cover-letters/how-to-write-a-cv',
      'https://www.careers.ox.ac.uk/cvs',
    ],
    status: 'confirmed',
  },
  {
    key: 'date_format',
    rule: 'Write date ranges as "Mon YYYY – Mon YYYY" and the current job as "Sep 2021 – Present". No all-number dates. Use one format throughout.',
    why: 'Month names avoid confusion between UK and US day/month order.',
    sources: [
      'https://www.careers.ox.ac.uk/cvs',
    ],
    status: 'unverified',
    check: {
      type: 'all_dates_match',
      pattern: '^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) (19|20)\\d{2}$',
      allow: ['^Present$'],
    },
  },
  {
    key: 'bullets',
    rule: 'Keep each bullet to two lines and one idea. Start with an action verb and give numbers where possible.',
    why: 'Specific bullets that show results are quick to read.',
    sources: [
      'https://www.careers.ox.ac.uk/cvs',
      'https://targetjobs.co.uk/careers-advice/cvs-applications-and-tests/big-guide-cv-writing-make-our-template-your-own',
      'https://nationalcareers.service.gov.uk/careers-advice/cv-sections',
    ],
    status: 'confirmed',
  },
  {
    key: 'degree_classification',
    rule: 'Give UK degree classifications exactly as awarded: First, 2:1, 2:2, Third (Distinction/Merit/Pass for a taught master\'s). Mark unfinished degrees "predicted". Never raise a grade.',
    why: 'Misstating a degree classification counts as degree fraud.',
    sources: [
      'https://www.prospects.ac.uk/applying-for-university/university-life/understanding-university-grades-in-the-uk/',
      'https://www.prospects.ac.uk/careers-advice/cvs-and-cover-letters/how-to-write-a-cv',
      'https://targetjobs.co.uk/careers-advice/cvs-applications-and-tests/big-guide-cv-writing-make-our-template-your-own',
    ],
    status: 'confirmed',
  },
  {
    key: 'foreign_degree',
    rule: 'Give the degree name in English with the institution, country and grading scale (e.g. "average 88/100"). Don\'t convert it to a UK classification.',
    why: "Recruiters can't judge an unfamiliar grade without its scale.",
    sources: [
      'https://www.careers.ox.ac.uk/cvs',
      'https://studentservices.on.worc.ac.uk/wp-content/uploads/CV-and-Covering-Letters-Int-students-DR-020626.pdf',
    ],
    status: 'confirmed',
  },
  {
    key: 'enic_comparability',
    rule: 'If the user has a UK ENIC Statement of Comparability, add the comparison it states. Never claim UK comparability without one.',
    why: "The statement is the official comparison of your qualification with UK ones; it doesn't cover grades.",
    sources: [
      'https://www.enic.org.uk/qualifications/soc',
    ],
    status: 'confirmed',
  },
  {
    key: 'language_levels',
    rule: 'Give each language a level (Native, Fluent, Conversational, Basic), plus any test score or CEFR level. Leave the section out if there is only one language.',
    why: 'Employers need to know how well you actually speak each language.',
    sources: [
      'https://www.careers.ox.ac.uk/cvs',
      'https://targetjobs.co.uk/careers-advice/cvs-applications-and-tests/big-guide-cv-writing-make-our-template-your-own',
    ],
    status: 'confirmed',
  },
  {
    key: 'references',
    rule: 'Remove referee names and contact details. At most write "References available on request", and drop that line if space is short.',
    why: 'Employers ask for referees later, usually when they make an offer.',
    sources: [
      'https://nationalcareers.service.gov.uk/careers-advice/cv-sections',
      'https://www.prospects.ac.uk/careers-advice/cvs-and-cover-letters/how-to-write-a-cv',
      'https://www.careers.ox.ac.uk/cvs',
    ],
    status: 'confirmed',
  },
  {
    key: 'hobbies',
    rule: 'Keep only specific interests that show relevant skills. Delete generic ones such as reading or socialising.',
    why: 'Generic interests waste space.',
    sources: [
      'https://www.prospects.ac.uk/careers-advice/cvs-and-cover-letters/how-to-write-a-cv',
      'https://www.careers.ox.ac.uk/cvs',
      'https://nationalcareers.service.gov.uk/careers-advice/cv-sections',
    ],
    status: 'confirmed',
  },
  {
    key: 'spelling',
    rule: 'Use British English: analyse, organise, colour, centre, programme (except for software).',
    why: 'US spellings look careless to UK readers.',
    sources: [
      'https://www.careers.ox.ac.uk/cvs',
    ],
    status: 'unverified',
  },
  {
    key: 'file_format_ats',
    rule: 'Text only, no images or graphics. Name the file "Firstname-Lastname-CV".',
    why: "Applicant tracking systems (ATS) can't read graphics, and not all of them accept PDFs.",
    sources: [
      'https://www.prospects.ac.uk/careers-advice/cvs-and-cover-letters/how-to-write-a-cv',
      'https://www.careers.ox.ac.uk/cvs',
    ],
    status: 'confirmed',
  },
  {
    key: 'legal_basis',
    rule: "When explaining why personal details were removed, describe it as UK convention linked to employers' equality duties, not as a law that binds candidates.",
    why: 'The Equality Act 2010 protects nine characteristics during hiring.',
    sources: [
      'https://www.acas.org.uk/recruitment/follow-discrimination-law',
      'https://www.acas.org.uk/sites/default/files/2024-04/age-discrimination-key-points-for-the-workplace.pdf',
      'https://www.gov.uk/discrimination-your-rights',
    ],
    status: 'confirmed',
  },
]

const de: NormRow[] = [
  {
    key: 'application_package',
    rule: 'Title the document "Curriculum Vitae" (Lebenslauf) and lay it out as a tabular CV. Output only the CV. Add a note that a full application also includes a cover letter (Anschreiben, often only if requested), Arbeitszeugnisse (employer references) and certificate copies; the app produces none of these. Don\'t suggest a paper Bewerbungsmappe.',
    why: 'German employers judge the whole package, including employer references.',
    sources: [
      'https://www.make-it-in-germany.com/en/jobs/it-specialist-in-germany/how-to-get-started',
      'https://www.deutschland.de/en/topic/business/tips-on-applying-for-a-job-in-germany',
      'https://www.arbeitsagentur.de/vor-ort/datei/bewerbungskompass_arbeit_ba273273.pdf',
    ],
    status: 'confirmed',
  },
  {
    key: 'length_pages',
    rule: 'Keep the CV to 2 pages at most, or 1 page for a new graduate.',
    why: 'Recruiters expect 2 pages at most.',
    sources: [
      'https://info.lse.ac.uk/current-students/careers/information-and-resources/country-profiles/germany',
      'https://www.bfit.uni-koeln.de/sites/wiso_career/pdf/Allgemeines_UEbergreifendes/Bewerbungshilfen/Kurzinfo_Lebenslauf.pdf',
    ],
    status: 'confirmed',
    check: { type: 'max_words', max: 900 },
  },
  {
    key: 'paper_size',
    rule: 'Use DIN A4 and a plain font (Arial, Calibri or Helvetica) at 10–12 pt. No nested tables and no text over graphics.',
    why: 'A4 is the German standard, and simple layouts are read correctly by application software.',
    sources: [
      'https://www.bfit.uni-koeln.de/sites/wiso_career/pdf/Allgemeines_UEbergreifendes/Bewerbungshilfen/Kurzinfo_Lebenslauf.pdf',
      'https://www.arbeitsagentur.de/vor-ort/datei/bewerbungskompass_arbeit_ba273273.pdf',
    ],
    status: 'confirmed',
  },
  {
    key: 'photo',
    rule: 'Never insert, require or generate a photo. Add a note that a photo is optional but common. If the user adds one, it should be professional, under a year old, about 4×6 cm, placed top right, and not a selfie or AI-edited.',
    why: 'A photo is no longer obligatory, but many applicants still include one.',
    sources: [
      'https://www.arbeitsagentur.de/vor-ort/datei/bewerbungskompass_arbeit_ba273273.pdf',
      'https://www.make-it-in-germany.com/en/jobs/it-specialist-in-germany/how-to-get-started',
      'https://www.deutschland.de/en/topic/business/tips-on-applying-for-a-job-in-germany',
    ],
    status: 'confirmed',
  },
  {
    key: 'personal_data_block',
    rule: 'Open with "Personal Details" (Persönliche Daten) in the body of the page, not the page header. Include name, postal address, phone with country code (e.g. +972) and a professional email. The target job title may go under the name.',
    why: 'Recruiters and application software look for contact details at the top.',
    sources: [
      'https://www.arbeitsagentur.de/vor-ort/datei/bewerbungskompass_arbeit_ba273273.pdf',
      'https://info.lse.ac.uk/current-students/careers/information-and-resources/country-profiles/germany',
    ],
    status: 'confirmed',
  },
  {
    key: 'date_of_birth',
    rule: 'Keep date and place of birth only if the user supplied them. Never invent them or ask for them.',
    why: 'They were traditionally standard but are no longer required, and age is a ground protected by the AGG.',
    sources: [
      'https://info.lse.ac.uk/current-students/careers/information-and-resources/country-profiles/germany',
      'https://www.arbeitsagentur.de/vor-ort/datei/bewerbungskompass_arbeit_ba273273.pdf',
      'https://bzkj.de/resource/blob/239448/267006a6e2cbea8717cdbbaf141e2e6f/leitfaden-fuer-diskriminierungsfreie-einstellungsverfahren-data.pdf',
    ],
    status: 'confirmed',
  },
  {
    key: 'marital_status',
    rule: "Delete marital status, children and parents' details unless the job ad asks for them.",
    why: 'The Federal Employment Agency lists family details among the things to cut.',
    sources: [
      'https://www.arbeitsagentur.de/vor-ort/datei/bewerbungskompass_arbeit_ba273273.pdf',
      'https://bzkj.de/resource/blob/239448/267006a6e2cbea8717cdbbaf141e2e6f/leitfaden-fuer-diskriminierungsfreie-einstellungsverfahren-data.pdf',
    ],
    status: 'confirmed',
    check: { type: 'absent', pattern: '\\b(married|single|divorced)\\b', flags: 'i' },
  },
  {
    key: 'work_authorization',
    rule: 'For applicants who are not German, add a Nationality line and a Work authorisation line, using only what the user states (e.g. "EU citizen – no work permit required" or "Requires a visa"). Never guess the status.',
    why: 'Employers need to know at once whether you can legally work.',
    sources: [
      'https://www.bfit.uni-koeln.de/sites/wiso_career/pdf/Allgemeines_UEbergreifendes/Bewerbungshilfen/Kurzinfo_Lebenslauf.pdf',
      'https://info.lse.ac.uk/current-students/careers/information-and-resources/country-profiles/germany',
    ],
    status: 'confirmed',
  },
  {
    key: 'section_order',
    rule: 'Use this order: Personal Details → short Profile (no "I" or "my") → Professional Experience → Further Training → Education → Skills (languages, IT, driving licence, certificates) → Additional Information → place, date and signature. Leave out empty sections.',
    why: "This order follows the Federal Employment Agency's current model CV.",
    sources: [
      'https://www.arbeitsagentur.de/vor-ort/datei/bewerbungskompass_arbeit_ba273273.pdf',
      'https://www.deutschland.de/en/topic/business/tips-on-applying-for-a-job-in-germany',
    ],
    status: 'confirmed',
  },
  {
    key: 'tabular_layout',
    rule: 'Put the dates in a narrow left column and the role, employer, place and details on the right, with one row per entry.',
    why: 'German recruiters scan the date column to follow your career.',
    sources: [
      'https://www.make-it-in-germany.com/en/jobs/it-specialist-in-germany/how-to-get-started',
      'https://www.bfit.uni-koeln.de/sites/wiso_career/pdf/Allgemeines_UEbergreifendes/Bewerbungshilfen/Kurzinfo_Lebenslauf.pdf',
    ],
    status: 'confirmed',
  },
  {
    key: 'date_format',
    rule: 'Write every period as MM/YYYY – MM/YYYY. Do not use year-only ranges or month names.',
    why: 'German CVs give the month and year for every entry.',
    sources: [
      'https://www.arbeitsagentur.de/vor-ort/datei/bewerbungskompass_arbeit_ba273273.pdf',
      'https://www.ihk.de/pfalz/produktmarken/fachkraeftesicherung/berufsorientierung/bewerbung/tipps-lebenslauf-3791838',
      'https://www.bfit.uni-koeln.de/sites/wiso_career/pdf/Allgemeines_UEbergreifendes/Bewerbungshilfen/Kurzinfo_Lebenslauf.pdf',
    ],
    status: 'confirmed',
    check: { type: 'all_dates_match', pattern: '^\\d{2}/(19|20)\\d{2}$', allow: ['^since \\d{2}/(19|20)\\d{2}$'] },
  },
  {
    key: 'current_role_date',
    rule: 'Write the current role as "since MM/YYYY" (German: "seit MM/JJJJ").',
    why: 'This is a common German way to show a job you still hold.',
    sources: [],
    status: 'unverified',
  },
  {
    key: 'chronology',
    rule: 'Put the newest entry first in every section.',
    why: 'Current German guidance says to start with your current or most recent job.',
    sources: [
      'https://www.arbeitsagentur.de/vor-ort/datei/bewerbungskompass_arbeit_ba273273.pdf',
      'https://www.deutschland.de/en/topic/business/tips-on-applying-for-a-job-in-germany',
    ],
    status: 'confirmed',
  },
  {
    key: 'language_levels',
    rule: 'Write each language as "Language – level in words (CEFR)", e.g. "Hebrew – native", "English – business fluent (C1)", "German – B1". Use no stars, bars or percentages, and state the German level honestly.',
    why: "Employers want levels they can compare, and graphics don't show what you can actually do.",
    sources: [
      'https://www.h-brs.de/files/related/leitfaden_fuer_eine_erfolgreiche_bewerbung_deutsch.pdf',
      'https://info.lse.ac.uk/current-students/careers/information-and-resources/country-profiles/germany',
      'https://europass.europa.eu/en/common-european-framework-reference-language-skills',
    ],
    status: 'confirmed',
    check: {
      type: 'absent',
      pattern: '[★☆●○]|\\b(?:Hebrew|English|German|Arabic|French|Spanish|Russian)\\b[^\\n%]{0,30}\\d+\\s?%',
    },
  },
  {
    key: 'it_skills',
    rule: 'List tools under "IT Skills" (EDV-Kenntnisse), each with a level in words (basic, advanced or expert).',
    why: 'Recruiters match tool names against the ad.',
    sources: [
      'https://www.arbeitsagentur.de/vor-ort/datei/bewerbungskompass_arbeit_ba273273.pdf',
      'https://www.bfit.uni-koeln.de/sites/wiso_career/pdf/Allgemeines_UEbergreifendes/Bewerbungshilfen/Kurzinfo_Lebenslauf.pdf',
    ],
    status: 'confirmed',
  },
  {
    key: 'education_grades',
    rule: 'For each degree, give the dates, institution, degree, subject and final grade with its scale (e.g. "88/100"). You may add "(approx. German grade X)" using the modified Bavarian formula X = 1 + 3 × (Nmax − Nd) / (Nmax − Nmin). Take Nmax and Nmin from anabin and round in the candidate\'s favour.',
    why: 'German recruiters read grades on the 1.0–4.0 scale instantly.',
    sources: [
      'https://www.uni-wuppertal.de/fileadmin/data/bu/Internationales/Auslandsmobilit%C3%A4t/Dokumente/Anerkennung/Bayrische_Formel.pdf',
      'https://backend.uni-heidelberg.de/de/dokumente/modifizierte-bayerische-formel-0/download',
      'https://www.bfit.uni-koeln.de/sites/wiso_career/pdf/Allgemeines_UEbergreifendes/Bewerbungshilfen/Kurzinfo_Lebenslauf.pdf',
    ],
    status: 'confirmed',
  },
  {
    key: 'degree_recognition',
    rule: "If the user has a ZAB Statement of Comparability (Zeugnisbewertung), cite it next to the degree. For regulated professions, note that formal recognition is required. Never claim a recognition the user hasn't stated.",
    why: 'A ZAB evaluation shows employers that your foreign degree matches a German one.',
    sources: [
      'https://www.kmk.org/zab/zentralstelle-fuer-auslaendisches-bildungswesen/ueber-die-zab.html',
      'https://make-it-in.rlp.de/arbeiten/jobsuche/bewerbung',
    ],
    status: 'confirmed',
  },
  {
    key: 'cv_gaps',
    rule: "Leave gaps of 3 months or less as they are. For longer gaps, add a dated one-line entry giving the user's real reason (job search, caregiving, training, sabbatical, volunteering). Never invent a reason; ask.",
    why: 'Short breaks need no explanation, but long unexplained ones raise questions.',
    sources: [
      'https://www.arbeitsagentur.de/vor-ort/datei/bewerbungskompass_arbeit_ba273273.pdf',
      'https://www.bfit.uni-koeln.de/sites/wiso_career/pdf/Allgemeines_UEbergreifendes/Bewerbungshilfen/Kurzinfo_Lebenslauf.pdf',
    ],
    status: 'confirmed',
  },
  {
    key: 'hobbies_interests',
    rule: 'Treat the section as optional. Keep only interests that are relevant or show a skill (volunteering, leadership, team sport), and delete generic ones such as reading or TV.',
    why: 'Irrelevant hobbies take up space and add nothing.',
    sources: [
      'https://www.arbeitsagentur.de/vor-ort/datei/bewerbungskompass_arbeit_ba273273.pdf',
      'https://www.h-brs.de/files/related/leitfaden_fuer_eine_erfolgreiche_bewerbung_deutsch.pdf',
    ],
    status: 'confirmed',
  },
  {
    key: 'references',
    rule: 'Delete referee contacts and any "References available on request" line. Tell the user to attach Arbeitszeugnisse or recommendation letters instead.',
    why: "German CVs don't list referees; written employer references do that job.",
    sources: [
      'https://www.bfit.uni-koeln.de/sites/wiso_career/pdf/Allgemeines_UEbergreifendes/Bewerbungshilfen/Kurzinfo_Lebenslauf.pdf',
      'https://www.deutschland.de/en/topic/business/tips-on-applying-for-a-job-in-germany',
    ],
    status: 'confirmed',
    check: { type: 'absent', pattern: 'references available', flags: 'i' },
  },
  {
    key: 'signature',
    rule: 'End with "[City], [DD Month YYYY]" and a "[Signature]" placeholder. Note that a scanned signature is still advised for PDF and email applications.',
    why: 'Signing confirms your details, and most German guides still expect it.',
    sources: [
      'https://www.arbeitsagentur.de/vor-ort/datei/bewerbungskompass_arbeit_ba273273.pdf',
      'https://www.bfit.uni-koeln.de/sites/wiso_career/pdf/Allgemeines_UEbergreifendes/Bewerbungshilfen/Kurzinfo_Lebenslauf.pdf',
      'https://www.stepstone.de/magazin/artikel/lebenslauf-unterschreiben',
    ],
    status: 'confirmed',
    check: { type: 'present', pattern: '\\[Signature\\]' },
  },
  {
    key: 'file_format',
    rule: 'Advise sending a text-based PDF, not a scan. By email, send one combined PDF (cover letter, CV, certificates) of 5 MB or less, unless the employer says otherwise.',
    why: 'A PDF keeps the layout intact.',
    sources: [
      'https://www.arbeitsagentur.de/vor-ort/datei/bewerbungskompass_arbeit_ba273273.pdf',
      'https://www.deutschland.de/en/topic/business/tips-on-applying-for-a-job-in-germany',
    ],
    status: 'confirmed',
  },
  {
    key: 'application_language',
    rule: 'Output in English (v1), with a note that employers generally expect German unless the ad is in English or the company asks for English. Any German version should be checked by a native speaker.',
    why: 'German is the default working language for most employers.',
    sources: [
      'https://www.make-it-in-germany.com/en/jobs/it-specialist-in-germany/how-to-get-started',
      'https://www.deutschland.de/en/topic/business/tips-on-applying-for-a-job-in-germany',
    ],
    status: 'confirmed',
  },
  {
    key: 'agg_sensitive_data',
    rule: "Don't add religion, ethnic origin, health or disability, or sexual identity. Never say the AGG forbids applicants from including a photo or birth date; the law governs employers.",
    why: "The AGG (2006) bars discrimination on six grounds (ethnic origin, sex, religion or belief, disability, age, sexual identity); it doesn't dictate what goes in your CV.",
    sources: [
      'https://bzkj.de/resource/blob/239448/267006a6e2cbea8717cdbbaf141e2e6f/leitfaden-fuer-diskriminierungsfreie-einstellungsverfahren-data.pdf',
    ],
    status: 'confirmed',
  },
]

const il: NormRow[] = [
  {
    key: 'document_name',
    rule: 'Head the page with the full name (no "Curriculum Vitae" title); name the file Firstname-Lastname-CV.',
    why: 'Recruiters file CVs under your name.',
    sources: [
      'https://www.nbn.org.il/life-in-israel/employment/managing-the-job-search/career-guidance-for-students-managing-the-job-search-employment/adjusting-your-resume-for-the-israeli-market/',
    ],
    status: 'unverified',
  },
  {
    key: 'cv_language',
    rule: 'Output English for hi-tech/international roles; tell the user a Hebrew version usually does better with Hebrew-speaking employers.',
    why: 'English CVs are normal in Israeli hi-tech; Hebrew is preferred elsewhere.',
    sources: [
      'https://www.drushim.co.il/article/118/',
      'https://www.nbn.org.il/life-in-israel/employment/managing-the-job-search/career-guidance-for-students-managing-the-job-search-employment/adjusting-your-resume-for-the-israeli-market/',
    ],
    status: 'confirmed',
  },
  {
    key: 'length_pages',
    rule: "1 page for students and up to ~10 years' experience; 2 pages maximum for seniors; strongest material on page 1.",
    why: 'Israeli recruiters skim; one page is the norm, two the ceiling.',
    sources: [
      'https://drushim.co.il/article/13/',
      'https://www.drushim.co.il/article/118/',
      'https://www.telfed.org.il/resume-writing-for-the-israeli-job-market/',
      'https://www.nbn.org.il/life-in-israel/employment/managing-the-job-search/career-guidance-for-students-managing-the-job-search-employment/adjusting-your-resume-for-the-israeli-market/',
    ],
    status: 'confirmed',
    check: { type: 'max_words', max: 1100 },
  },
  {
    key: 'paper_size',
    rule: 'Render on A4, not US Letter.',
    why: 'Israel uses A4.',
    sources: [],
    status: 'unverified',
  },
  {
    key: 'formatting',
    rule: 'Single column, Arial/Calibri/Verdana 10–12 pt; no tables, tabs, graphics or strong colours; contact details in the body, not the page header.',
    why: 'Fancy layouts break when opened or parsed.',
    sources: [
      'https://www.telfed.org.il/resume-writing-for-the-israeli-job-market/',
      'https://drushim.co.il/article/13/',
    ],
    status: 'confirmed',
  },
  {
    key: 'photo',
    rule: 'Remove any photo.',
    why: 'Israeli CVs normally carry no photo.',
    sources: [
      'https://www.telfed.org.il/resume-writing-for-the-israeli-job-market/',
      'https://www.drushim.co.il/article/118/',
    ],
    status: 'confirmed',
  },
  {
    key: 'id_number',
    rule: 'Delete teudat zehut, passport and social-security numbers.',
    why: "Old templates listed the ID number; current guides don't, and it's an identity-theft risk.",
    sources: [],
    status: 'unverified',
    check: { type: 'absent', pattern: '\\b\\d{9}\\b' },
  },
  {
    key: 'date_of_birth',
    rule: 'Delete date of birth and age.',
    why: "Age isn't needed and is a protected ground.",
    sources: [
      'https://drushim.co.il/article/13/',
      'https://www.telfed.org.il/resume-writing-for-the-israeli-job-market/',
      'https://www.kolzchut.org.il/he/אפליה_אסורה_בעבודה',
    ],
    status: 'confirmed',
    check: { type: 'absent', pattern: '\\b(date of birth|DOB|born on)\\b', flags: 'i' },
  },
  {
    key: 'marital_status',
    rule: 'Delete marital status, spouse, children and pregnancy.',
    why: 'These invite discrimination and are protected grounds.',
    sources: [
      'https://www.nbn.org.il/life-in-israel/employment/managing-the-job-search/career-guidance-for-students-managing-the-job-search-employment/adjusting-your-resume-for-the-israeli-market/',
      'https://www.kolzchut.org.il/he/איסור_אפליית_עובד_בשל_מעמדו_האישי',
    ],
    status: 'confirmed',
    check: { type: 'absent', pattern: '\\b(married|single|divorced|children)\\b', flags: 'i' },
  },
  {
    key: 'address',
    rule: 'Remove the street address; keep city/region only if near the job.',
    why: 'A distant address can get you screened out automatically.',
    sources: [
      'https://drushim.co.il/article/13/',
      'https://www.nbn.org.il/life-in-israel/employment/managing-the-job-search/career-guidance-for-students-managing-the-job-search-employment/adjusting-your-resume-for-the-israeli-market/',
      'https://www.telfed.org.il/resume-writing-for-the-israeli-job-market/',
    ],
    status: 'confirmed',
  },
  {
    key: 'nationality',
    rule: 'Remove nationality, citizenship, religion, country of birth and aliyah date unless the user insists.',
    why: 'Nationality and country of origin are protected grounds; olim are citizens anyway.',
    sources: [
      'https://www.kolzchut.org.il/he/אפליה_אסורה_בעבודה',
    ],
    status: 'unverified',
  },
  {
    key: 'contact_details',
    rule: 'One mobile in +972 format (+972-54-123-4567) and a professional email.',
    why: 'That is all recruiters need.',
    sources: [
      'https://drushim.co.il/article/13/',
      'https://www.nbn.org.il/life-in-israel/employment/managing-the-job-search/career-guidance-for-students-managing-the-job-search-employment/adjusting-your-resume-for-the-israeli-market/',
    ],
    status: 'confirmed',
  },
  {
    key: 'linkedin',
    rule: 'Add the LinkedIn URL if the user has one.',
    why: 'Israel is a network-based market.',
    sources: [
      'https://www.ynetnews.com/article/b1fuliaome',
    ],
    status: 'unverified',
  },
  {
    key: 'summary',
    rule: 'Open with a 2–4 sentence profile: professional title first, then key strengths, tailored to the role.',
    why: 'Recruiters expect a short opening paragraph on who you are and what you want.',
    sources: [
      'https://drushim.co.il/article/13/',
      'https://www.nbn.org.il/life-in-israel/employment/managing-the-job-search/career-guidance-for-students-managing-the-job-search-employment/adjusting-your-resume-for-the-israeli-market/',
      'https://www.telfed.org.il/resume-writing-for-the-israeli-job-market/',
    ],
    status: 'confirmed',
  },
  {
    key: 'section_order',
    rule: 'Experienced: Contact → Summary → Skills → Experience → Education → Military service (if any) → Languages → Volunteering. New graduates: Education before Experience.',
    why: 'Relevant experience goes early; languages and extras last.',
    sources: [
      'https://drushim.co.il/article/13/',
      'https://www.drushim.co.il/article/118/',
      'https://www.nbn.org.il/life-in-israel/employment/managing-the-job-search/career-guidance-for-students-managing-the-job-search-employment/adjusting-your-resume-for-the-israeli-market/',
      'https://www.telfed.org.il/resume-writing-for-the-israeli-job-market/',
    ],
    status: 'confirmed',
  },
  {
    key: 'chronology',
    rule: 'Reverse-chronological in Experience and Education.',
    why: 'Most recent first is the Israeli norm.',
    sources: [
      'https://www.nbn.org.il/life-in-israel/employment/managing-the-job-search/career-guidance-for-students-managing-the-job-search-employment/adjusting-your-resume-for-the-israeli-market/',
      'https://drushim.co.il/article/13/',
    ],
    status: 'confirmed',
  },
  {
    key: 'date_format',
    rule: 'Use year ranges (2019–2023); MM/YYYY only if short roles need it; one format throughout.',
    why: 'Israeli CVs traditionally show years only.',
    sources: [
      'https://www.hachvana.mod.gov.il/Documents/קורות%20חיים%20לדוגמא%202%202016.pdf',
    ],
    status: 'unverified',
    check: { type: 'all_dates_match', pattern: '^((19|20)\\d{2}|\\d{2}/(19|20)\\d{2})$', allow: ['^Present$'] },
  },
  {
    key: 'military_service',
    rule: 'If the user served (IDF, Sherut Leumi or a foreign army), keep a short "Military Service" entry: years, role, unit type, discharge rank, relevant achievements. Don\'t state current reserve-duty load.',
    why: 'Israeli employers read army roles as experience.',
    sources: [
      'https://www.drushim.co.il/article/118/',
      'https://drushim.co.il/article/13/',
      'https://www.hachvana.mod.gov.il/Documents/קורות%20חיים%20לדוגמא%202%202016.pdf',
    ],
    status: 'confirmed',
  },
  {
    key: 'military_none',
    rule: 'If the user never served, omit the section; no "N/A", no explanation.',
    why: "Olim who arrived as adults aren't expected to have served.",
    sources: [],
    status: 'unverified',
    check: { type: 'absent', pattern: '\\b(did not serve|N/A)\\b', flags: 'i' },
  },
  {
    key: 'language_levels',
    rule: 'Own section, one line per language, one level word: Native, Fluent, Conversational, Basic. Never inflate.',
    why: 'Overstated languages get exposed at interview.',
    sources: [
      'https://www.nbn.org.il/life-in-israel/employment/managing-the-job-search/career-guidance-for-students-managing-the-job-search-employment/adjusting-your-resume-for-the-israeli-market/',
      'https://www.telfed.org.il/resume-writing-for-the-israeli-job-market/',
      'https://www.hachvana.mod.gov.il/Documents/קורות%20חיים%20לדוגמא%202%202016.pdf',
    ],
    status: 'confirmed',
  },
  {
    key: 'hebrew_level',
    rule: 'Always list Hebrew honestly; if learned at ulpan, add the level, e.g. "Hebrew — conversational (Ulpan Aleph)". Never "fluent" on Ulpan Aleph alone.',
    why: 'Ulpan Aleph is the basic state course (~420–450 hours).',
    sources: [
      'https://www.kolzchut.org.il/he/מימון_לימודי_השפה_העברית_באולפן_לעולים_חדשים',
      'https://www.telfed.org.il/resume-writing-for-the-israeli-job-market/',
    ],
    status: 'unverified',
    check: { type: 'absent', pattern: 'Ulpan Aleph[^\\n]*(fluent|native)', flags: 'i' },
  },
  {
    key: 'education',
    rule: 'Degree abbreviation (B.A., B.Sc., M.A., M.Sc., Ph.D.), field, institution, country, year; drop high school once a degree exists.',
    why: 'A foreign institution needs its country to be understood.',
    sources: [
      'https://www.nbn.org.il/life-in-israel/employment/managing-the-job-search/career-guidance-for-students-managing-the-job-search-employment/adjusting-your-resume-for-the-israeli-market/',
      'https://www.telfed.org.il/resume-writing-for-the-israeli-job-market/',
    ],
    status: 'confirmed',
  },
  {
    key: 'degree_recognition',
    rule: 'Never claim Israeli equivalence unless the user holds the evaluation certificate; if so, add "(evaluated as equivalent to Israeli B.A., Ministry of Aliyah and Integration)".',
    why: 'The evaluation mainly sets public-sector salary grading and tender eligibility.',
    sources: [
      'https://www.gov.il/he/service/foreign-degree-evaluation-for-new-olim',
    ],
    status: 'confirmed',
  },
  {
    key: 'bullets',
    rule: '3–5 short achievement bullets per role, plain English, verb + result, numbers where possible.',
    why: 'Readers skim and are often non-native English speakers.',
    sources: [
      'https://www.nbn.org.il/life-in-israel/employment/managing-the-job-search/career-guidance-for-students-managing-the-job-search-employment/adjusting-your-resume-for-the-israeli-market/',
      'https://drushim.co.il/article/13/',
    ],
    status: 'confirmed',
  },
  {
    key: 'job_titles',
    rule: 'Replace inflated or vague titles with accurate ones ("VP" at a 5-person firm → "Head of Sales"). Ask the user before changing a title.',
    why: '"VP" implies managing dozens of people in Israel.',
    sources: [
      'https://www.nbn.org.il/life-in-israel/employment/managing-the-job-search/career-guidance-for-students-managing-the-job-search-employment/adjusting-your-resume-for-the-israeli-market/',
      'https://drushim.co.il/article/13/',
    ],
    status: 'confirmed',
  },
  {
    key: 'skills',
    rule: 'Concise grouped Skills/Technologies section near the top for tech roles.',
    why: "Recruiters scan for the ad's keywords.",
    sources: [
      'https://www.nbn.org.il/life-in-israel/employment/managing-the-job-search/career-guidance-for-students-managing-the-job-search-employment/adjusting-your-resume-for-the-israeli-market/',
      'https://drushim.co.il/article/13/',
      'https://www.telfed.org.il/resume-writing-for-the-israeli-job-market/',
    ],
    status: 'confirmed',
  },
  {
    key: 'tailoring',
    rule: 'Tailor the summary and skills to the kind of job the user is applying for.',
    why: 'Guides say adapt to each ad, not one generic CV.',
    sources: [
      'https://drushim.co.il/article/13/',
      'https://www.telfed.org.il/resume-writing-for-the-israeli-job-market/',
    ],
    status: 'confirmed',
  },
  {
    key: 'hobbies',
    rule: 'Remove generic hobbies; keep volunteering or activities showing relevant skills.',
    why: 'Hobbies add nothing unless unusual.',
    sources: [
      'https://www.nbn.org.il/life-in-israel/employment/managing-the-job-search/career-guidance-for-students-managing-the-job-search-employment/adjusting-your-resume-for-the-israeli-market/',
      'https://www.drushim.co.il/article/118/',
      'https://drushim.co.il/article/13/',
    ],
    status: 'confirmed',
  },
  {
    key: 'references',
    rule: 'No referee names or contacts; optionally end with "References available upon request".',
    why: 'This line is standard in Israel.',
    sources: [
      'https://drushim.co.il/article/13/',
      'https://www.drushim.co.il/article/118/',
      'https://www.hachvana.mod.gov.il/Documents/קורות%20חיים%20לדוגמא%202%202016.pdf',
      'https://www.telfed.org.il/resume-writing-for-the-israeli-job-market/',
    ],
    status: 'confirmed',
  },
  {
    key: 'file_format',
    rule: 'Add a note: Israeli recruiters and agencies often want an editable Word file or an unlocked PDF, never an image or locked PDF. This app saves a text-based PDF; copy the text into Word if an agency asks for .docx.',
    why: 'Recruiters often edit CVs; locked files get skipped.',
    sources: [
      'https://drushim.co.il/article/13/',
      'https://www.nbn.org.il/life-in-israel/employment/managing-the-job-search/career-guidance-for-students-managing-the-job-search-employment/adjusting-your-resume-for-the-israeli-market/',
    ],
    status: 'confirmed',
  },
  {
    key: 'religious_study',
    rule: 'Drop yeshiva/midrasha/seminary study unless the role is in Jewish education or it fills a major gap. Ask before dropping.',
    why: 'NBN lists this as a common olim mistake.',
    sources: [
      'https://www.nbn.org.il/life-in-israel/employment/managing-the-job-search/career-guidance-for-students-managing-the-job-search-employment/adjusting-your-resume-for-the-israeli-market/',
    ],
    status: 'confirmed',
  },
  {
    key: 'experience_scope',
    rule: 'Cut or one-line roles older than ~10–15 years and unrelated jobs.',
    why: 'Space is tight on 1–2 pages.',
    sources: [
      'https://www.telfed.org.il/resume-writing-for-the-israeli-job-market/',
      'https://www.nbn.org.il/life-in-israel/employment/managing-the-job-search/career-guidance-for-students-managing-the-job-search-employment/adjusting-your-resume-for-the-israeli-market/',
    ],
    status: 'confirmed',
  },
  {
    key: 'employment_gaps',
    rule: 'Fill gaps over ~6 months with what the user really did (study, ulpan, projects); never invent — ask.',
    why: 'Unexplained gaps look bad.',
    sources: [
      'https://drushim.co.il/article/13/',
    ],
    status: 'confirmed',
  },
  {
    key: 'legal_background',
    rule: 'Present removals of age, marital status, children, pregnancy, religion, nationality/origin, political views and reserve duty as protecting the candidate; never say including them is illegal.',
    why: "The Equal Employment Opportunities Law bars employers from discriminating in hiring on these grounds; it doesn't regulate what candidates write.",
    sources: [
      'https://www.kolzchut.org.il/he/אפליה_אסורה_בעבודה',
      'https://www.kolzchut.org.il/he/איסור_אפליית_עובד_בשל_מעמדו_האישי',
    ],
    status: 'confirmed',
  },
]

// Army-service rows: "all" goes to US, GB and DE; "US / UK" to US and GB.
const army: ArmyRow[] = [
  {
    key: 'military_placement',
    targets: ['US', 'GB'],
    rule: 'Put service that is relevant to the target job (tech, intelligence analysis, instruction, logistics, admin) inside Work Experience as a dated job with 3–5 bullets. Shrink non-relevant service (e.g. combat for a software role) to one dated line under a short "Military Service" heading near the end. Never keep a full Israeli-style "Military Service" block for foreign employers.',
    why: 'Foreign readers judge service by how relevant it is to the job, and Israeli guidance says to fold military roles into the relevant sections for foreign companies.',
    sources: [
      'https://www.drushim.co.il/article/118/',
      'https://bpb-us-e2.wpmucdn.com/sites.utdallas.edu/dist/8/1090/files/2021/04/jsom-veteran-resume-writing-guidelines-2020-2021.pdf',
    ],
    status: 'confirmed',
  },
  {
    key: 'military_placement_de',
    targets: ['DE'],
    rule: 'Always keep service as its own dated entry (unit type and place), in reverse-chronological order. Never drop it, because that leaves a gap.',
    why: 'German CVs are expected to be "lückenlos" (no gaps).',
    sources: [
      'https://www.ga.ovgu.de/grs_media/Dokumente/Postdocs/DE_Lebenslauf.pdf',
    ],
    status: 'confirmed',
  },
  {
    key: 'military_context_line',
    targets: ['US', 'GB', 'DE'],
    rule: 'Add once, in the entry title or first line: "Israel Defense Forces (mandatory military service)". For officers or long-service personnel, add "extended service as officer".',
    why: "Foreign readers don't know Israeli service is compulsory, so without this it can look like a career choice.",
    sources: [
      'https://www.nbn.org.il/?p=114222',
    ],
    status: 'unverified',
  },
  {
    key: 'military_ranks',
    targets: ['US', 'GB', 'DE'],
    rule: 'Give the rank only in English. Lead with the function title (e.g. "Squad Leader", "Software Developer"). Put the rank in parentheses only for officers (Lieutenant and above) or when it signals command. Leave out enlisted ranks for conscripts when the role says more.',
    why: 'Untranslated Hebrew ranks mean nothing abroad, and civilian readers care more about function than rank.',
    sources: [
      'https://en.wikipedia.org/wiki/Israel_Defense_Forces_ranks',
      'https://balagan.info/israeli-ranks',
      'https://bpb-us-e2.wpmucdn.com/sites.utdallas.edu/dist/8/1090/files/2021/04/jsom-veteran-resume-writing-guidelines-2020-2021.pdf',
    ],
    status: 'unverified',
  },
  {
    key: 'military_jargon',
    targets: ['US', 'GB', 'DE'],
    rule: 'Remove Hebrew acronyms, slang and unit numbers. Replace each with a plain-English description of the function (e.g. "IDF computing and IT unit", "armoured corps", "basic-training instructor"). Never write Tzahal; write "Israel Defense Forces (IDF)" the first time it appears.',
    why: "Recruiters abroad can't decode Israeli military jargon, and both Israeli and US career guides say to write in civilian terms.",
    sources: [
      'https://www.mako.co.il/pzm-soldiers/discharge/Article-0d11198686e0431006.htm',
      'https://bpb-us-e2.wpmucdn.com/sites.utdallas.edu/dist/8/1090/files/2021/04/jsom-veteran-resume-writing-guidelines-2020-2021.pdf',
    ],
    status: 'confirmed',
    check: { type: 'absent', pattern: '[\\u0590-\\u05FF]|\\b(Tzahal|Mamram|Bakum|Tironut|Sadir|Keva)\\b', flags: 'i' },
  },
  {
    key: 'military_unit_names',
    targets: ['US', 'GB', 'DE'],
    rule: 'Name a unit only if it is publicly acknowledged and widely recognised abroad (e.g. "Unit 8200, IDF Intelligence Corps"), and always add a function line after it. For any other unit, describe the type and function only ("signals-intelligence unit", "technology unit").',
    why: 'A recognised name helps tech recruiters, but an unknown number or codename tells them nothing and may be sensitive.',
    sources: [
      'https://www.nisha.co.il/בוגרי-8200-המדריך-המלא-למשתחרר-הטרי-מהיחי/',
    ],
    status: 'unverified',
  },
  {
    key: 'military_classified',
    targets: ['US', 'GB', 'DE'],
    rule: 'Never output operation names, codenames, named systems or tools built in service, targets, base locations, clearance-level details or intelligence methods. Describe sensitive work generically: technology stack, team size, project type. If the source CV seems to contain such details, delete them and warn the user rather than rewording them.',
    why: 'Israeli guidance limits disclosure to "what is permitted for publication", and defence-establishment rules ban posting even non-classified details.',
    sources: [
      'https://www.nisha.co.il/בוגרי-8200-המדריך-המלא-למשתחרר-הטרי-מהיחי/',
      'https://www.ynetnews.com/article/3530744',
    ],
    status: 'confirmed',
  },
  {
    key: 'military_skills',
    targets: ['US', 'GB', 'DE'],
    rule: 'Rewrite each military duty as a civilian equivalent with numbers: people managed, trainees, budget or equipment value, systems and technologies, results. Use civilian job titles (commander → team leader/supervisor; office role → administration).',
    why: 'Employers hire for transferable skills, and figures make leadership claims believable.',
    sources: [
      'https://www.mako.co.il/pzm-soldiers/discharge/Article-0d11198686e0431006.htm',
      'https://www.nisha.co.il/בוגרי-8200-המדריך-המלא-למשתחרר-הטרי-מהיחי/',
      'https://bpb-us-e2.wpmucdn.com/sites.utdallas.edu/dist/8/1090/files/2021/04/jsom-veteran-resume-writing-guidelines-2020-2021.pdf',
    ],
    status: 'confirmed',
  },
  {
    key: 'security_clearance',
    targets: ['US', 'GB', 'DE'],
    rule: 'Remove Israeli clearance levels from the CV. If the user insists, write "Held Israeli security clearance (not transferable)" and never present it as a US, UK or German clearance.',
    why: 'An Israeli clearance has no standing with foreign governments and can confuse defence-sector screening.',
    sources: [],
    status: 'unverified',
  },
  {
    key: 'national_service',
    targets: ['US', 'GB', 'DE'],
    rule: 'Translate Sherut Leumi / Sherut Ezrachi as "National Service (civilian alternative to military service, Israel)", then give the placement organisation, sector, dates and hours. Put it under Work Experience if relevant, otherwise Volunteer Experience. In DE, keep it dated, the same as military service.',
    why: 'It is a recognised 1–2-year service in schools, hospitals and similar settings, so it should get the same weight as a job, not look like a gap.',
    sources: [
      'https://www.nbn.org.il/?p=114222',
    ],
    status: 'unverified',
  },
  {
    key: 'reserve_duty',
    targets: ['US', 'GB', 'DE'],
    rule: 'Don\'t list routine reserve duty. If reserve call-ups explain a gap, overlap or a pause in a job (common since Oct 2023), add one line: "Reserve military service, Israel Defense Forces — [dates / approx. days]". Give no operational detail. In DE, always date it.',
    why: 'Long call-ups since 2023 can look like unexplained gaps or short job stints, and one factual line answers the question.',
    sources: [
      'https://www.jpost.com/business-and-innovation/all-news/article-831411',
    ],
    status: 'unverified',
  },
  {
    key: 'us_veteran_status',
    targets: ['US'],
    rule: 'Never call the user a "veteran", and never suggest they tick veteran boxes or claim veterans\' preference, because of IDF service. Write "served in the Israel Defense Forces".',
    why: 'Under US law "veteran" means service in the US Armed Forces only.',
    sources: [
      'https://www.law.cornell.edu/uscode/text/38/101',
    ],
    status: 'confirmed',
    check: { type: 'absent', pattern: '\\bveteran\\b', flags: 'i' },
  },
]

export async function seed(knex: Knex): Promise<void> {
  const byCountry: [CountryCode, NormRow[]][] = [
    ['US', us],
    ['GB', gb],
    ['DE', de],
    ['IL', il],
  ]
  const rows = byCountry.flatMap(([code, norms]) =>
    [...norms, ...army.filter((norm) => norm.targets.includes(code))].map((norm) => ({
      country_code: code,
      key: norm.key,
      rule: norm.rule,
      why: norm.why,
      sources: norm.sources,
      status: norm.status,
      check_def: norm.check ?? null,
      verified_on: VERIFIED_ON,
    })),
  )
  await knex('norms').del()
  await knex('norms').insert(rows)
}
