import { render } from '@testing-library/react'
import type { ReactElement } from 'react'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import { vi } from 'vitest'
import type { ConversionResult } from '../features/conversion/types.ts'
import type { Country } from '../features/countries/countriesSlice.ts'
import { makeStore } from '../store.ts'

// In the order the server returns them: sorted by name.
export const COUNTRIES: Country[] = [
  { code: 'DE', name: 'Germany', documentName: 'Curriculum Vitae (Lebenslauf)', paperSize: 'A4' },
  { code: 'IL', name: 'Israel', documentName: 'CV', paperSize: 'A4' },
  { code: 'GB', name: 'United Kingdom', documentName: 'CV', paperSize: 'A4' },
  { code: 'US', name: 'United States', documentName: 'Résumé', paperSize: 'Letter' },
]

export const RESULT: ConversionResult = {
  cv: { header: { name: 'Dana Example', headline: 'Backend developer', contactLines: [] }, sections: [] },
  changes: [],
  questions: [],
  notes: [],
  checks: [],
  meta: { model: 'fake-model', country: 'US', paperSize: 'Letter', documentName: 'Résumé' },
}

export function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } })
}

// Replaces fetch for one test. The handler answers every request; the returned mock records them.
// A handler that throws makes fetch reject, like a network failure.
export function stubFetch(handler: (url: string, init?: RequestInit) => Response | Promise<Response>) {
  const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => handler(String(input), init))
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

export function countriesOk(url: string) {
  if (url === '/api/countries') return jsonResponse(COUNTRIES)
  throw new Error(`Unexpected request to ${url}`)
}

export function renderWithProviders(ui: ReactElement, { route = '/', store = makeStore() } = {}) {
  return {
    store,
    ...render(
      <Provider store={store}>
        <MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>
      </Provider>,
    ),
  }
}
