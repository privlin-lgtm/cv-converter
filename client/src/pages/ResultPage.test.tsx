import { fireEvent, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import App from '../App.tsx'
import { convertCv, setText } from '../features/conversion/conversionSlice.ts'
import type { ConversionResult } from '../features/conversion/types.ts'
import { makeStore } from '../store.ts'
import { countriesOk, RESULT, renderWithProviders, stubFetch } from '../test/helpers.tsx'

const US_RESULT: ConversionResult = {
  ...RESULT,
  cv: {
    header: { name: 'Dana Example', headline: 'Backend developer', contactLines: ['dana@example.com'] },
    sections: [
      {
        kind: 'experience',
        heading: 'Experience',
        text: '',
        entries: [
          { dates: '2021 - Present', title: 'Senior Developer', organisation: 'Kestrel', location: 'Tel Aviv', lines: ['Led billing'] },
        ],
      },
    ],
  },
  changes: [
    {
      kind: 'reworded',
      what: 'Rewrote the army service as a job',
      ruleKey: 'army_service',
      why: 'US employers read service as work experience.',
      sources: ['https://example.com/army', 'https://example.org/vets'],
      status: 'confirmed',
    },
    {
      kind: 'removed',
      what: 'Removed the date of birth',
      ruleKey: 'date_of_birth',
      why: 'Age is a protected trait.',
      sources: ['https://example.com/dob'],
      status: 'confirmed',
    },
    {
      kind: 'added',
      what: 'Added a summary',
      ruleKey: 'summary',
      why: 'Recruiters skim.',
      sources: [],
      status: 'unverified',
    },
    { kind: 'reformatted', what: 'Cleaned up spacing', ruleKey: '', why: null, sources: null, status: null },
  ],
  questions: [{ text: 'Are you authorised to work in the US?', ruleKey: 'work_authorization' }],
  notes: [{ text: 'Assumed a backend developer role.', ruleKey: '' }],
  checks: [
    { ruleKey: 'date_of_birth', rule: 'Remove the date of birth.', result: 'pass', detail: 'Not found' },
    { ruleKey: 'max_words', rule: 'Keep the résumé to about 700 words.', result: 'flagged', detail: '812 words (limit 700)' },
  ],
}

const DE_RESULT: ConversionResult = {
  ...US_RESULT,
  cv: {
    header: { name: 'Lena Hartmann', headline: '', contactLines: [] },
    sections: [
      { kind: 'personal_details', heading: 'Personal Details', text: 'Lindenstraße 14, Leipzig', entries: [] },
      {
        kind: 'experience',
        heading: 'Professional Experience',
        text: '',
        entries: [
          { dates: '03/2020 – since', title: 'Purchasing Project Manager', organisation: 'Mertens', location: 'Leipzig', lines: [] },
        ],
      },
      { kind: 'signature', heading: 'Signature', text: 'Leipzig, 15 October 2026\n[Signature]', entries: [] },
    ],
  },
  meta: { model: 'fake-model', country: 'DE', paperSize: 'A4', documentName: 'Curriculum Vitae (Lebenslauf)' },
}

function renderResult(result: ConversionResult) {
  const store = makeStore()
  store.dispatch(convertCv.fulfilled(result, 'test'))
  return renderWithProviders(<App />, { route: '/result', store })
}

function changeItem(what: string) {
  return screen.getByText(what).closest('li')!
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('changes', () => {
  it('are grouped by kind and show what, why and source links', () => {
    renderResult(US_RESULT)
    const section = screen.getByRole('heading', { name: 'Changes' }).closest('section')!

    const groups = within(section).getAllByRole('heading', { level: 3 }).map((heading) => heading.textContent)
    expect(groups).toEqual(['Removed (1)', 'Added (1)', 'Reworded (1)', 'Reformatted (1)'])

    const army = changeItem('Rewrote the army service as a job')
    expect(within(army).getByText('US employers read service as work experience.')).toBeInTheDocument()
    expect(within(army).getByRole('link', { name: 'example.com' })).toHaveAttribute('href', 'https://example.com/army')
    expect(within(army).getByRole('link', { name: 'example.org' })).toHaveAttribute('href', 'https://example.org/vets')
  })

  it('label an unverified rule "common practice" and no other', () => {
    renderResult(US_RESULT)

    expect(within(changeItem('Added a summary')).getByText('common practice')).toBeInTheDocument()
    expect(within(changeItem('Removed the date of birth')).queryByText('common practice')).not.toBeInTheDocument()
  })

  it('show "General edit" with no link when the rule is unknown', () => {
    renderResult(US_RESULT)
    const edit = changeItem('Cleaned up spacing')

    expect(within(edit).getByText('General edit')).toBeInTheDocument()
    expect(within(edit).queryByRole('link')).not.toBeInTheDocument()
    expect(within(edit).queryByText('common practice')).not.toBeInTheDocument()
  })
})

describe('checks panel', () => {
  it('shows a pass row and a flagged row, each with the rule text and the detail', () => {
    renderResult(US_RESULT)

    const pass = screen.getByText('Remove the date of birth.').closest('li')!
    expect(within(pass).getByText('Pass')).toBeInTheDocument()
    expect(within(pass).getByText('Not found')).toBeInTheDocument()

    const flagged = screen.getByText('Keep the résumé to about 700 words.').closest('li')!
    expect(within(flagged).getByText('Flagged')).toBeInTheDocument()
    expect(within(flagged).getByText('812 words (limit 700)')).toBeInTheDocument()

    expect(screen.queryByText('max_words')).not.toBeInTheDocument()
  })

  it('lists the panel parts in order, with the questions and notes', () => {
    renderResult(US_RESULT)

    const parts = screen.getAllByRole('heading', { level: 2 }).map((heading) => heading.textContent)
    expect(parts.slice(-4)).toEqual(['Checks', 'Questions for you', 'Changes', 'Notes'])
    expect(screen.getByText('Are you authorised to work in the US?')).toBeInTheDocument()
    expect(screen.getByText('Assumed a backend developer role.')).toBeInTheDocument()
  })
})

describe('CV preview', () => {
  it('is a single column for the United States', () => {
    renderResult(US_RESULT)
    const sheet = screen.getByRole('article', { name: 'CV preview' })

    expect(sheet).toHaveClass('cv-sheet')
    expect(sheet).toHaveAttribute('data-layout', 'single')
    expect(within(sheet).getByText('Senior Developer, Kestrel, Tel Aviv')).toBeInTheDocument()
  })

  it('shows an entry line when only the organisation or the location is set', () => {
    const entry = { dates: '2019 - 2022', title: '', organisation: '', location: '', lines: [] }
    renderResult({
      ...US_RESULT,
      cv: {
        ...US_RESULT.cv,
        sections: [
          {
            kind: 'education',
            heading: 'Education',
            text: '',
            entries: [
              { ...entry, organisation: 'Ben-Gurion University', location: 'Beer Sheva' },
              { ...entry, dates: '2016 - 2019', location: 'Ashdod' },
              { ...entry, dates: '2014 - 2016' },
            ],
          },
        ],
      },
    })
    const sheet = screen.getByRole('article', { name: 'CV preview' })

    expect(within(sheet).getByText('Ben-Gurion University, Beer Sheva')).toHaveClass('cv-title')
    expect(within(sheet).getByText('Ashdod')).toHaveClass('cv-title')
    expect(sheet.querySelectorAll('.cv-title')).toHaveLength(2)
    expect(within(sheet).getByText('2014 - 2016')).toBeInTheDocument()
  })

  it('has a date column, a Personal Details block and a signature block for Germany', () => {
    renderResult(DE_RESULT)
    const sheet = screen.getByRole('article', { name: 'CV preview' })

    expect(sheet).toHaveAttribute('data-layout', 'tabular')
    expect(within(sheet).getByText('03/2020 – since')).toHaveClass('cv-dates')
    expect(within(sheet).getByRole('heading', { name: 'Personal Details' }).closest('section')).toHaveClass(
      'cv-section--personal_details',
    )
    expect(within(sheet).getByText(/\[Signature\]/).closest('section')).toHaveClass('cv-section--signature')
    expect(within(sheet).getByText(/Leipzig, 15 October 2026/)).toBeInTheDocument()
  })
})

describe('leaving the page', () => {
  it('redirects a reload with no result to / and says why', async () => {
    stubFetch(countriesOk)
    renderWithProviders(<App />, { route: '/result' })

    expect(screen.getByRole('heading', { level: 1, name: 'CV Converter' })).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent("Results aren't saved, by design. Paste your CV again to convert it.")
    await screen.findByRole('option', { name: 'Germany' })
  })

  it('keeps the text when you edit and convert again', async () => {
    stubFetch(countriesOk)
    const store = makeStore()
    store.dispatch(setText('FICTIONAL TEST CV — NOT A REAL PERSON\nDana Example'))
    store.dispatch(convertCv.fulfilled(US_RESULT, 'test'))
    renderWithProviders(<App />, { route: '/result', store })

    fireEvent.click(screen.getByRole('button', { name: 'Edit and convert again' }))

    expect(screen.getByLabelText('Paste text')).toHaveValue('FICTIONAL TEST CV — NOT A REAL PERSON\nDana Example')
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
    await screen.findByRole('option', { name: 'Germany' })
  })

  it('writes nothing to localStorage or sessionStorage', () => {
    renderResult(US_RESULT)

    expect(localStorage).toHaveLength(0)
    expect(sessionStorage).toHaveLength(0)
  })
})
