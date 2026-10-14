import { Link } from 'react-router-dom'

function NotFound() {
  return (
    <main className="page">
      <h1>Page not found</h1>
      <p>There is nothing at this address.</p>
      <Link to="/">Back to the converter</Link>
    </main>
  )
}

export default NotFound
