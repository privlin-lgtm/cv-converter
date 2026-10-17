import type { Cv } from '../features/conversion/types.ts'

export type SheetLayout = 'single' | 'tabular'

function CvSheet({ cv, layout }: { cv: Cv; layout: SheetLayout }) {
  const { name, headline, contactLines } = cv.header
  return (
    <article className={`cv-sheet cv-sheet--${layout}`} data-layout={layout} aria-label="CV preview">
      <header className="cv-header">
        <h2 className="cv-name">{name}</h2>
        {headline && <p className="cv-headline">{headline}</p>}
        {contactLines.length > 0 && <p className="cv-contact">{contactLines.join(' | ')}</p>}
      </header>
      {cv.sections.map((section, i) => (
        <section key={i} className={`cv-section cv-section--${section.kind}`}>
          {section.heading && <h3>{section.heading}</h3>}
          {section.text && <p className="cv-text">{section.text}</p>}
          {section.entries.map((entry, j) => (
            <div key={j} className="cv-entry">
              {entry.dates && <p className="cv-dates">{entry.dates}</p>}
              {(entry.title || entry.organisation || entry.location) && (
                <p className="cv-title">{[entry.title, entry.organisation, entry.location].filter(Boolean).join(', ')}</p>
              )}
              {entry.lines.length > 0 && (
                <ul className="cv-lines">
                  {entry.lines.map((line, k) => (
                    <li key={k}>{line}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </section>
      ))}
    </article>
  )
}

export default CvSheet
