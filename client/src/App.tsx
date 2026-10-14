import { Route, Routes } from 'react-router-dom'
import ConvertPage from './pages/ConvertPage.tsx'
import NotFound from './pages/NotFound.tsx'

function App() {
  return (
    <Routes>
      <Route path="/" element={<ConvertPage />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default App
