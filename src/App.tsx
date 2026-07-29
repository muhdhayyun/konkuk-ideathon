import { Route, Routes, Link } from 'react-router-dom'
import ClientFormPage from './pages/client-form/ClientFormPage'

function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-4 text-slate-900">
      <h1 className="text-2xl font-semibold">Kokuk</h1>
      <p className="text-slate-500">Prototype pages</p>
      <Link to="/client-form" className="text-blue-600 underline">
        BrandBoost Product Matcher (/client-form)
      </Link>
    </main>
  )
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/client-form/*" element={<ClientFormPage />} />
    </Routes>
  )
}

export default App
