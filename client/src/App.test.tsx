import { screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import App from './App.tsx'
import { countriesOk, renderWithProviders, stubFetch } from './test/helpers.tsx'

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('App routes', () => {
  it('shows the Convert page at /', async () => {
    stubFetch(countriesOk)
    renderWithProviders(<App />, { route: '/' })

    expect(screen.getByRole('heading', { level: 1, name: 'CV Converter' })).toBeInTheDocument()
    expect(screen.getByLabelText('Paste text')).toBeInTheDocument()
    await screen.findByRole('option', { name: 'Germany' })
  })

  it('shows Not found for an unknown route, with a way back', () => {
    stubFetch(countriesOk)
    renderWithProviders(<App />, { route: '/nowhere' })

    expect(screen.getByRole('heading', { name: 'Page not found' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Back to the converter' })).toHaveAttribute('href', '/')
  })
})
