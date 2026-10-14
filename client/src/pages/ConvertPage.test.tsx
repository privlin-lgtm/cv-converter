import { fireEvent, screen, waitFor, within } from '@testing-library/react'
import { Route, Routes } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import spec from '../../../intent/2026-10-10-mvp/spec.md?raw'
import { COUNTRIES, countriesOk, jsonResponse, RESULT, renderWithProviders, stubFetch } from '../test/helpers.tsx'
import ConvertPage from './ConvertPage.tsx'

const CV = 'FICTIONAL TEST CV — NOT A REAL PERSON\nDana Example\nBackend developer'

// "/result" is a stand-in route, so a successful conversion has somewhere to land.
function renderConvertPage() {
  return renderWithProviders(
    <Routes>
      <Route path="/" element={<ConvertPage />} />
      <Route path="/result" element={<p>Result route</p>} />
    </Routes>,
  )
}

function callsTo(fetchMock: ReturnType<typeof stubFetch>, path: string) {
  return fetchMock.mock.calls.filter(([url]) => String(url) === path)
}

// Waits until the countries have loaded, so the select has its options.
async function loaded() {
  await screen.findByRole('option', { name: 'Germany' })
}

function typeCv(value = CV) {
  const box = screen.getByLabelText('Paste text')
  fireEvent.change(box, { target: { value } })
  return box
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('target select', () => {
  it('lists the three targets for an Israeli CV and disappears for a CV from abroad', async () => {
    stubFetch(countriesOk)
    renderConvertPage()
    await loaded()

    const select = screen.getByLabelText('Target country')
    const options = within(select).getAllByRole('option').map((option) => option.textContent)
    expect(options).toEqual(['United States', 'United Kingdom', 'Germany'])

    fireEvent.click(screen.getByRole('radio', { name: 'My CV from abroad → Israel' }))
    expect(screen.queryByLabelText('Target country')).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('radio', { name: 'My Israeli CV → abroad' }))
    expect(screen.getByLabelText('Target country')).toBeInTheDocument()
  })
})

describe('Convert button', () => {
  it('is disabled until the text box has text', async () => {
    stubFetch(countriesOk)
    renderConvertPage()
    await loaded()
    const button = screen.getByRole('button', { name: 'Convert' })

    expect(button).toBeDisabled()
    typeCv('   \n  ')
    expect(button).toBeDisabled()
    typeCv()
    expect(button).toBeEnabled()
  })

  it('is disabled again when the text is over 20,000 characters', async () => {
    stubFetch(countriesOk)
    renderConvertPage()
    await loaded()

    typeCv('a'.repeat(20_000))
    expect(screen.getByText('20,000 / 20,000')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Convert' })).toBeEnabled()

    typeCv('a'.repeat(20_001))
    expect(screen.getByText('20,001 / 20,000')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Convert' })).toBeDisabled()
  })

  it('names the target and the wait while the model works', async () => {
    let finish: (response: Response) => void = () => {}
    stubFetch((url) =>
      url === '/api/convert' ? new Promise<Response>((resolve) => (finish = resolve)) : countriesOk(url),
    )
    renderConvertPage()
    await loaded()
    fireEvent.change(screen.getByLabelText('Target country'), { target: { value: 'DE' } })
    typeCv()

    fireEvent.click(screen.getByRole('button', { name: 'Convert' }))

    const busy = await screen.findByRole('button', { name: 'Rewriting for Germany… this can take up to a minute' })
    expect(busy).toBeDisabled()

    finish(jsonResponse(RESULT))
    await screen.findByText('Result route')
  })
})

describe('conversion request', () => {
  it('sends the Israeli CV, the chosen target and the job', async () => {
    const fetchMock = stubFetch((url) => (url === '/api/convert' ? jsonResponse(RESULT) : countriesOk(url)))
    renderConvertPage()
    await loaded()
    fireEvent.change(screen.getByLabelText('Target country'), { target: { value: 'GB' } })
    fireEvent.change(screen.getByLabelText(/What kind of job are you applying for\?/), {
      target: { value: 'Backend developer' },
    })
    typeCv()

    fireEvent.click(screen.getByRole('button', { name: 'Convert' }))

    await screen.findByText('Result route')
    const [[, init]] = callsTo(fetchMock, '/api/convert')
    expect(init?.method).toBe('POST')
    expect(JSON.parse(String(init?.body))).toEqual({ from: 'IL', to: 'GB', text: CV, targetRole: 'Backend developer' })
  })

  it('sends a CV from abroad to Israel and leaves out an empty job', async () => {
    const fetchMock = stubFetch((url) => (url === '/api/convert' ? jsonResponse(RESULT) : countriesOk(url)))
    renderConvertPage()
    await loaded()
    fireEvent.click(screen.getByRole('radio', { name: 'My CV from abroad → Israel' }))
    typeCv()

    fireEvent.click(screen.getByRole('button', { name: 'Convert' }))

    await screen.findByText('Result route')
    const [[, init]] = callsTo(fetchMock, '/api/convert')
    expect(JSON.parse(String(init?.body))).toEqual({ from: 'ABROAD', to: 'IL', text: CV })
  })
})

describe('conversion error', () => {
  it('shows the server reason, keeps the text, and retries', async () => {
    let attempts = 0
    const fetchMock = stubFetch((url) => {
      if (url !== '/api/convert') return countriesOk(url)
      attempts += 1
      return attempts === 1
        ? jsonResponse({ error: 'The model returned invalid output twice.' }, 502)
        : jsonResponse(RESULT)
    })
    renderConvertPage()
    await loaded()
    const box = typeCv()

    fireEvent.click(screen.getByRole('button', { name: 'Convert' }))

    const alert = await screen.findByRole('alert')
    expect(alert).toHaveTextContent('The model returned invalid output twice.')
    expect(box).toHaveValue(CV)
    expect(screen.queryByText('Result route')).not.toBeInTheDocument()

    fireEvent.click(within(alert).getByRole('button', { name: 'Try again' }))

    await screen.findByText('Result route')
    expect(callsTo(fetchMock, '/api/convert')).toHaveLength(2)
  })

  it('says so when the server cannot be reached', async () => {
    stubFetch((url) => {
      if (url !== '/api/convert') return countriesOk(url)
      throw new TypeError('Failed to fetch')
    })
    renderConvertPage()
    await loaded()
    typeCv()

    fireEvent.click(screen.getByRole('button', { name: 'Convert' }))

    expect(await screen.findByRole('alert')).toHaveTextContent("Couldn't reach the server (Failed to fetch).")
    expect(screen.getByLabelText('Paste text')).toHaveValue(CV)
  })
})

describe('countries', () => {
  it('loads once, however often the page mounts', async () => {
    const fetchMock = stubFetch(countriesOk)
    const first = renderConvertPage()
    await loaded()
    first.unmount()

    renderWithProviders(<ConvertPage />, { store: first.store })
    await loaded()

    expect(callsTo(fetchMock, '/api/countries')).toHaveLength(1)
  })

  it('shows why they did not load, and loads them on retry', async () => {
    let attempts = 0
    stubFetch(() => {
      attempts += 1
      return attempts === 1 ? jsonResponse({ error: 'The database is unreachable.' }, 503) : jsonResponse(COUNTRIES)
    })
    renderConvertPage()

    const alert = await screen.findByRole('alert')
    expect(alert).toHaveTextContent('The database is unreachable.')
    expect(screen.getByLabelText('Target country')).toBeDisabled()
    typeCv()
    expect(screen.getByRole('button', { name: 'Convert' })).toBeDisabled()

    fireEvent.click(within(alert).getByRole('button', { name: 'Try again' }))

    await loaded()
    await waitFor(() => expect(screen.queryByRole('alert')).not.toBeInTheDocument())
    expect(screen.getByRole('button', { name: 'Convert' })).toBeEnabled()
  })
})

describe('privacy note', () => {
  it('is on the page and matches spec.md word for word', async () => {
    stubFetch(countriesOk)
    renderConvertPage()
    await loaded()

    const note = spec.match(/\*\*Privacy note \(shown on `\/`\):\*\*\r?\n> (.+)/)?.[1]
    expect(note).toBeTruthy()
    expect(screen.getByText(note!)).toBeVisible()
  })
})

describe('job line', () => {
  it('stops at 100 characters', async () => {
    stubFetch(countriesOk)
    renderConvertPage()
    await loaded()

    expect(screen.getByLabelText(/What kind of job are you applying for\?/)).toHaveAttribute('maxlength', '100')
  })
})
