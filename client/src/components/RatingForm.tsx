import { useState, type SyntheticEvent } from 'react'
import { MAX_COMMENT_CHARS, submitRating, type VsChatbot } from '../features/rating/ratingSlice.ts'
import { useAppDispatch, useAppSelector } from '../hooks.ts'

const CHATBOT_CHOICES: { value: VsChatbot; label: string }[] = [
  { value: 'better', label: 'Better' },
  { value: 'same', label: 'About the same' },
  { value: 'worse', label: 'Worse' },
  { value: 'not_tried', label: "I didn't try one" },
]

const SCORES = [1, 2, 3, 4, 5]

function RatingForm() {
  const dispatch = useAppDispatch()
  const { status, error } = useAppSelector((state) => state.rating)
  const [vsChatbot, setVsChatbot] = useState<VsChatbot | null>(null)
  const [score, setScore] = useState<number | null>(null)
  const [comment, setComment] = useState('')
  const sending = status === 'sending'
  const ready = vsChatbot !== null && score !== null && !sending

  function handleSubmit(event: SyntheticEvent) {
    event.preventDefault()
    if (ready) void dispatch(submitRating({ vsChatbot, score, comment }))
  }

  if (status === 'sent') {
    return (
      <p className="notice" role="status">
        Thank you! Your rating was saved.
      </p>
    )
  }

  return (
    <section className="rating">
      <h2>Rate this result</h2>
      <form onSubmit={handleSubmit}>
        <fieldset className="form-body" disabled={sending}>
          <fieldset>
            <legend>Compared with pasting your CV into ChatGPT or another chatbot, this was:</legend>
            <div className="choices">
              {CHATBOT_CHOICES.map(({ value, label }) => (
                <label key={value} className="choice">
                  <input
                    type="radio"
                    name="vs-chatbot"
                    value={value}
                    checked={vsChatbot === value}
                    onChange={() => setVsChatbot(value)}
                  />
                  <span>{label}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend>Overall score (1 = poor, 5 = excellent)</legend>
            <div className="choices scores">
              {SCORES.map((value) => (
                <label key={value} className="choice">
                  <input type="radio" name="score" value={value} checked={score === value} onChange={() => setScore(value)} />
                  <span>{value}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <div className="field">
            <label htmlFor="rating-comment">
              Comment <span className="optional">(optional)</span>
            </label>
            <textarea
              id="rating-comment"
              rows={3}
              maxLength={MAX_COMMENT_CHARS}
              value={comment}
              aria-describedby="rating-hint rating-count"
              onChange={(event) => setComment(event.target.value)}
            />
            <p id="rating-hint" className="hint">
              Please don't include personal details.
            </p>
            <p id="rating-count" className="counter">{`${comment.length} / ${MAX_COMMENT_CHARS}`}</p>
          </div>

          <div className="actions">
            <button type="submit" className="primary" disabled={!ready}>
              {sending ? 'Sending…' : 'Send rating'}
            </button>
          </div>

          {status === 'error' && (
            <div className="alert" role="alert">
              <p>
                <strong>Couldn't send your rating.</strong> {error}
              </p>
            </div>
          )}
        </fieldset>
      </form>
    </section>
  )
}

export default RatingForm
