import { Route, Routes } from 'react-router-dom'
import ConvertPage from './pages/ConvertPage.tsx'
import NotFound from './pages/NotFound.tsx'
import ResultPage from './pages/ResultPage.tsx'

function App() {
  return (
    <Routes>
      <Route path="/" element={<ConvertPage />} />
      <Route path="/result" element={<ResultPage />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default App
