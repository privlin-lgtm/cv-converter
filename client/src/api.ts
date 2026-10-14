// Calls the API and returns the parsed JSON. A failure throws an Error that carries the reason:
// the server's own message when it sent one, or why the request never arrived.
export async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response
  try {
    res = await fetch(path, init)
  } catch (err) {
    const reason = err instanceof Error ? err.message : 'network error'
    throw new Error(`Couldn't reach the server (${reason}). Check your connection and try again.`)
  }
  if (!res.ok) throw new Error(await failureMessage(res))
  return (await res.json()) as T
}

async function failureMessage(res: Response): Promise<string> {
  const body: unknown = await res.json().catch(() => null)
  if (typeof body === 'object' && body !== null && 'error' in body && typeof body.error === 'string') {
    return body.error
  }
  return `The server answered ${res.status}.`
}
