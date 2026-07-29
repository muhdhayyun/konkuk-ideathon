import { Route, Routes, Link } from 'react-router-dom'
import ClientFormPage from './pages/client-form/ClientFormPage'
import AgentFormPage from './pages/ai-agent/AgentFormPage'

function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-4 text-slate-900">
      <h1 className="text-2xl font-semibold">Kokuk</h1>
      <p className="text-slate-500">Prototype pages</p>
      <Link to="/client-form" className="text-blue-600 underline">
        BrandBoost Product Matcher — fast local version (/client-form)
      </Link>
      <Link to="/ai-agent" className="text-blue-600 underline">
        BrandBoost Product Matcher — live AI agent version (/ai-agent)
      </Link>
    </main>
  )
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/client-form/*" element={<ClientFormPage />} />
      <Route path="/ai-agent/*" element={<AgentFormPage />} />
    </Routes>
  )
}

export default App
