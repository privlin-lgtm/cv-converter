import { fireEvent, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import App from '../App.tsx'
import { convertCv, setTo } from '../features/conversion/conversionSlice.ts'
import { submitRating } from '../features/rating/ratingSlice.ts'
import { makeStore } from '../store.ts'
import { jsonResponse, RESULT, renderWithProviders, stubFetch } from '../test/helpers.tsx'

const THANK_YOU = 'Thank you! Your rating was saved.'

function renderRating() {
  const store = makeStore()
  store.dispatch(setTo('DE'))
  store.dispatch(convertCv.fulfilled(RESULT, 'test'))
  return renderWithProviders(<App />, { route: '/result', store })
}

function pickRequired() {
  fireEvent.click(screen.getByRole('radio', { name: 'About the same' }))
  fireEvent.click(screen.getByRole('radio', { name: '4' }))
}

const sendRating = () => fireEvent.click(screen.getByRole('button', { name: 'Send rating' }))

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('rating form', () => {
  it('asks the question with four choices and a 1–5 score, below the action buttons', () => {
    renderRating()
    const question = screen.getByRole('group', {
      name: 'Compared with pasting your CV into ChatGPT or another chatbot, this was:',
    })
    const score = screen.getByRole('group', { name: 'Overall score (1 = poor, 5 = excellent)' })

    expect(within(question).getAllByRole('radio').map((radio) => radio.closest('label')?.textContent)).toEqual([
      'Better',
      'About the same',
      'Worse',
      "I didn't try one",
    ])
    expect(within(score).getAllByRole('radio').map((radio) => radio.closest('label')?.textContent)).toEqual(['1', '2', '3', '4', '5'])
    expect(screen.getByText("Please don't include personal details.")).toBeInTheDocument()
    const heading = screen.getByRole('heading', { name: 'Rate this result' })
    const edit = screen.getByRole('button', { name: 'Edit and convert again' })
    expect(edit.compareDocumentPosition(heading) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })

  it('counts the comment and keeps Send rating disabled until a choice and a score are picked', () => {
    renderRating()
    const send = screen.getByRole('button', { name: 'Send rating' })
    expect(send).toBeDisabled()
    expect(screen.getByText('0 / 500')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('radio', { name: 'Worse' }))
    expect(send).toBeDisabled()
    fireEvent.click(screen.getByRole('radio', { name: '2' }))
    expect(send).toBeEnabled()

    fireEvent.change(screen.getByLabelText(/Comment/), { target: { value: 'Too long' } })
    expect(screen.getByText('8 / 500')).toBeInTheDocument()
  })

  it('sends from and to from the conversion state, then shows a thank-you instead of the form', async () => {
    const fetchMock = stubFetch(() => jsonResponse({ id: 1 }, 201))
    renderRating()
    pickRequired()
    fireEvent.change(screen.getByLabelText(/Comment/), { target: { value: '  Saved me an hour.  ' } })

    sendRating()

    expect(await screen.findByText(THANK_YOU)).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent(THANK_YOU)
    expect(screen.queryByRole('heading', { name: 'Rate this result' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Send rating' })).not.toBeInTheDocument()
    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('/api/ratings')
    expect(init?.method).toBe('POST')
    expect(JSON.parse(String(init?.body))).toEqual({ from: 'IL', to: 'DE', vsChatbot: 'same', score: 4, comment: 'Saved me an hour.' })
  })

  it('leaves a blank comment out of the request', async () => {
    const fetchMock = stubFetch(() => jsonResponse({ id: 1 }, 201))
    renderRating()
    pickRequired()
    fireEvent.change(screen.getByLabelText(/Comment/), { target: { value: '   ' } })

    sendRating()

    await screen.findByText(THANK_YOU)
    expect(JSON.parse(String(fetchMock.mock.calls[0][1]?.body))).toEqual({ from: 'IL', to: 'DE', vsChatbot: 'same', score: 4 })
  })

  it('shows the reason inline when sending fails and keeps what was entered', async () => {
    stubFetch(() => jsonResponse({ error: 'The rating service is down.' }, 500))
    renderRating()
    pickRequired()
    fireEvent.change(screen.getByLabelText(/Comment/), { target: { value: 'Nice layout' } })

    sendRating()

    expect(await screen.findByRole('alert')).toHaveTextContent("Couldn't send your rating. The rating service is down.")
    expect(screen.queryByText(THANK_YOU)).not.toBeInTheDocument()
    expect(screen.getByRole('radio', { name: 'About the same' })).toBeChecked()
    expect(screen.getByRole('radio', { name: '4' })).toBeChecked()
    expect(screen.getByLabelText(/Comment/)).toHaveValue('Nice layout')
    expect(screen.getByRole('button', { name: 'Send rating' })).toBeEnabled()
  })
})

describe('rating state', () => {
  it('starts over when the next conversion begins', () => {
    const store = makeStore()
    store.dispatch(submitRating.fulfilled({ id: 1 }, 'test', { vsChatbot: 'same', score: 4, comment: '' }))
    expect(store.getState().rating.status).toBe('sent')

    store.dispatch(convertCv.pending('test'))

    expect(store.getState().rating).toEqual({ status: 'idle', error: null })
  })
})
