export type Origin = 'IL' | 'ABROAD'

export interface OriginDetection {
  origin: Origin | 'unsure'
  signals: string[]
}

export interface DirectionMismatch {
  detected: Origin
  signals: string[]
}

interface Signal {
  origin: Origin
  label: string
  weight: number
  pattern: RegExp
}

const CONFIDENT_MARGIN = 2

const SIGNALS: Signal[] = [
  { origin: 'IL', label: 'Hebrew text', weight: 3, pattern: /[\u05D0-\u05EA]{2,}/ },
  {
    origin: 'IL',
    label: 'IDF service',
    weight: 3,
    pattern: /צה"ל|מילואים|\bIDF\b|\bTzahal\b|Israel Defen[cs]e Forces|\bMilu'?im\b/i,
  },
  {
    origin: 'IL',
    label: 'Israeli ID number',
    weight: 2,
    pattern: /teudat zehut|תעודת זהות|ת\.ז|\bID (?:number|no\.?)\s*:?\s*\d{8,9}\b/i,
  },
  {
    origin: 'IL',
    label: 'Israeli university',
    weight: 2,
    pattern:
      /Technion|Hebrew University|Tel Aviv University|Ben[- ]Gurion University|Bar[- ]Ilan|Weizmann Institute|Reichman University|IDC Herzliya|University of Haifa|Ariel University|Open University of Israel/i,
  },
  { origin: 'IL', label: '+972 or 05x phone number', weight: 1, pattern: /\+972|(?<!\d)05\d[- ]?\d{3}[- ]?\d{4}(?!\d)/ },
  {
    origin: 'IL',
    label: 'Israeli city',
    weight: 1,
    pattern:
      /\b(?:Tel Aviv|Jerusalem|Haifa|Ramat Gan|Petah Tikva|Be'?er Sheva|Beersheba|Herzliya|Ashdod|Netanya|Rishon LeZion|Holon|Rehovot|Ra'?anana|Kfar Saba|Modi'?in)\b/i,
  },
  { origin: 'ABROAD', label: 'aliyah or ulpan', weight: 3, pattern: /\b(?:aliyah?|ole[hm]|olah|olim|ulpan)\b/i },
  {
    origin: 'ABROAD',
    label: 'German CV headings',
    weight: 3,
    pattern: /Lebenslauf|Berufserfahrung|Persönliche Daten|Staatsangehörigkeit/i,
  },
  { origin: 'ABROAD', label: 'UK qualifications', weight: 2, pattern: /\bA-levels?\b|\bGCSEs?\b|\(Hons\)|£/ },
  { origin: 'ABROAD', label: 'US address or GPA', weight: 2, pattern: /\b[A-Z]{2} \d{5}(?:-\d{4})?\b|\bGPA\b/ },
  {
    origin: 'ABROAD',
    label: 'phone number from abroad',
    weight: 1,
    pattern: /\+(?:1|44|49|33|61)[\s-]?\(?\d|\(\d{3}\) ?\d{3}-\d{4}/,
  },
]

export function detectOrigin(text: string): OriginDetection {
  const matched = SIGNALS.filter((signal) => signal.pattern.test(text))
  const score = (origin: Origin) =>
    matched.filter((signal) => signal.origin === origin).reduce((sum, signal) => sum + signal.weight, 0)
  const margin = score('IL') - score('ABROAD')
  const origin = margin >= CONFIDENT_MARGIN ? 'IL' : margin <= -CONFIDENT_MARGIN ? 'ABROAD' : 'unsure'
  return {
    origin,
    signals: matched.filter((signal) => signal.origin === origin).map((signal) => signal.label),
  }
}

export function findDirectionMismatch(from: Origin, text: string): DirectionMismatch | null {
  const { origin, signals } = detectOrigin(text)
  return origin === 'unsure' || origin === from ? null : { detected: origin, signals }
}
