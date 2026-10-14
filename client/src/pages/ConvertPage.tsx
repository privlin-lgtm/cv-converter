import { useEffect, type SyntheticEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  convertCv,
  MAX_TARGET_ROLE_CHARS,
  MAX_TEXT_CHARS,
  setFrom,
  setTargetRole,
  setText,
  setTo,
} from '../features/conversion/conversionSlice.ts'
import type { Direction } from '../features/conversion/types.ts'
import { loadCountries } from '../features/countries/countriesSlice.ts'
import { useAppDispatch, useAppSelector } from '../hooks.ts'

const DIRECTIONS: { value: Direction; label: string }[] = [
  { value: 'IL', label: 'My Israeli CV → abroad' },
  { value: 'ABROAD', label: 'My CV from abroad → Israel' },
]

// The targets for an Israeli CV, in the order the select lists them.
const TARGET_CODES = ['US', 'GB', 'DE']

// Word for word from spec.md.
const PRIVACY_NOTE =
  "Your CV isn't saved by this app. It's sent to Anthropic's Claude API to be rewritten, and the result is shown only to you, in this browser tab. Anthropic deletes API data within 30 days (it keeps it for up to 2 years only if it's flagged for breaking their usage policy). Reloading the page clears everything. Please remove anything you wouldn't want processed, such as your ID number."

const formatCount = (n: number) => n.toLocaleString('en')

function ConvertPage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const countries = useAppSelector((state) => state.countries)
  const { from, to, text, targetRole, status, error } = useAppSelector((state) => state.conversion)

  useEffect(() => {
    void dispatch(loadCountries())
  }, [dispatch])

  const countriesReady = countries.status === 'loaded'
  const targets = TARGET_CODES.flatMap((code) => countries.items.filter((country) => country.code === code))
  const targetName = countries.items.find((country) => country.code === to)?.name ?? to
  const converting = status === 'converting'
  const overLimit = text.length > MAX_TEXT_CHARS
  const canConvert = countriesReady && !converting && text.trim() !== '' && !overLimit

  async function convert() {
    const action = await dispatch(convertCv())
    if (convertCv.fulfilled.match(action)) navigate('/result')
  }

  function handleSubmit(event: SyntheticEvent) {
    event.preventDefault()
    if (canConvert) void convert()
  }

  return (
    <main className="page">
      <h1>CV Converter</h1>
      <form className="card" onSubmit={handleSubmit}>
        <fieldset className="form-body" disabled={converting}>
          <fieldset className="direction">
            <legend>Direction</legend>
            <div className="choices">
              {DIRECTIONS.map((direction) => (
                <label key={direction.value} className="choice">
                  <input
                    type="radio"
                    name="direction"
                    value={direction.value}
                    checked={from === direction.value}
                    onChange={() => dispatch(setFrom(direction.value))}
                  />
                  <span>{direction.label}</span>
                </label>
              ))}
            </div>
          </fieldset>

          {from === 'IL' && (
            <div className="field">
              <label htmlFor="target">Target country</label>
              <select
                id="target"
                value={to}
                disabled={!countriesReady}
                onChange={(event) => dispatch(setTo(event.target.value))}
              >
                {countriesReady ? (
                  targets.map((country) => (
                    <option key={country.code} value={country.code}>
                      {country.name}
                    </option>
                  ))
                ) : (
                  <option value="">{countries.status === 'error' ? 'Not available' : 'Loading…'}</option>
                )}
              </select>
            </div>
          )}

          {countries.status === 'error' && (
            <div className="alert" role="alert">
              <p>
                <strong>Couldn't load the list of countries.</strong> {countries.error}
              </p>
              <button type="button" className="secondary" onClick={() => void dispatch(loadCountries())}>
                Try again
              </button>
            </div>
          )}

          <div className="field">
            <label htmlFor="cv-text">Paste text</label>
            <textarea
              id="cv-text"
              rows={14}
              value={text}
              aria-describedby="cv-count"
              onChange={(event) => dispatch(setText(event.target.value))}
            />
            <p id="cv-count" className={overLimit ? 'counter over' : 'counter'}>
              {`${formatCount(text.length)} / ${formatCount(MAX_TEXT_CHARS)}`}
            </p>
            {overLimit && (
              <p className="field-error">
                Over the {formatCount(MAX_TEXT_CHARS)}-character limit. Shorten the text to convert.
              </p>
            )}
          </div>

          <div className="field">
            <label htmlFor="target-role">
              What kind of job are you applying for? <span className="optional">(optional)</span>
            </label>
            <input
              id="target-role"
              type="text"
              maxLength={MAX_TARGET_ROLE_CHARS}
              placeholder="For example: Backend developer"
              value={targetRole}
              onChange={(event) => dispatch(setTargetRole(event.target.value))}
            />
          </div>

          <p className="privacy-note">{PRIVACY_NOTE}</p>

          <div className="actions" aria-live="polite">
            <button type="submit" className="primary" disabled={!canConvert}>
              {converting ? `Rewriting for ${targetName}… this can take up to a minute` : 'Convert'}
            </button>
          </div>

          {status === 'error' && (
            <div className="alert" role="alert">
              <p>
                <strong>Couldn't convert your CV.</strong> {error}
              </p>
              <button type="button" className="secondary" onClick={() => void convert()}>
                Try again
              </button>
            </div>
          )}
        </fieldset>
      </form>
    </main>
  )
}

export default ConvertPage
