import { Navigate, useNavigate } from 'react-router-dom'
import CvSheet from '../components/CvSheet.tsx'
import type { ResultChange } from '../features/conversion/types.ts'
import { useAppSelector } from '../hooks.ts'

const NOT_SAVED_NOTICE = "Results aren't saved, by design. Paste your CV again to convert it."

const KINDS: ResultChange['kind'][] = ['removed', 'added', 'reworded', 'reordered', 'reformatted', 'flagged']

function ResultPage() {
  const navigate = useNavigate()
  const result = useAppSelector((state) => state.conversion.result)
  if (!result) return <Navigate to="/" replace state={{ notice: NOT_SAVED_NOTICE }} />

  const { cv, checks, questions, changes, notes, meta } = result

  return (
    <main className="page page-wide">
      <h1>Your result</h1>
      <p className="subtitle">Rewritten as a {meta.documentName}.</p>
      <div className="result-grid">
        <CvSheet cv={cv} layout={meta.country === 'DE' ? 'tabular' : 'single'} />
        <aside className="panel">
          <button type="button" className="primary" onClick={() => navigate('/')}>
            Edit and convert again
          </button>

          <section>
            <h2>Checks</h2>
            <ul className="checks">
              {checks.map((check) => (
                <li key={check.ruleKey} className="check">
                  <span className={`badge badge-${check.result}`}>{check.result === 'pass' ? 'Pass' : 'Flagged'}</span>
                  <div>
                    <p className="check-rule">{check.rule}</p>
                    <p className="check-detail">{check.detail}</p>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2>Questions for you</h2>
            {questions.length > 0 ? (
              <ul>
                {questions.map((question, i) => (
                  <li key={i}>{question.text}</li>
                ))}
              </ul>
            ) : (
              <p className="empty">None.</p>
            )}
          </section>

          <section>
            <h2>Changes</h2>
            {changes.length === 0 && <p className="empty">None.</p>}
            {KINDS.map((kind) => {
              const ofKind = changes.filter((change) => change.kind === kind)
              return (
                ofKind.length > 0 && (
                  <div key={kind} className="change-group">
                    <h3>{`${kind[0].toUpperCase()}${kind.slice(1)} (${ofKind.length})`}</h3>
                    <ul className="changes">
                      {ofKind.map((change, i) => (
                        <li key={i} className="change">
                          <p className="change-what">{change.what}</p>
                          <p className="change-why">
                            {change.why ?? 'General edit'}
                            {change.status === 'unverified' && <span className="badge badge-practice">common practice</span>}
                          </p>
                          {change.sources && change.sources.length > 0 && (
                            <ul className="sources">
                              {change.sources.map((source) => (
                                <li key={source}>
                                  <a href={source} target="_blank" rel="noopener noreferrer">
                                    {new URL(source).hostname}
                                  </a>
                                </li>
                              ))}
                            </ul>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )
              )
            })}
          </section>

          <section>
            <h2>Notes</h2>
            {notes.length > 0 ? (
              <ul>
                {notes.map((note, i) => (
                  <li key={i}>{note.text}</li>
                ))}
              </ul>
            ) : (
              <p className="empty">None.</p>
            )}
          </section>
        </aside>
      </div>
    </main>
  )
}

export default ResultPage
