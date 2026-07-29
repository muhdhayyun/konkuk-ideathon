import { Route, Routes, Link } from 'react-router-dom'
import ClientFormPage from './pages/client-form/ClientFormPage'
import AgentFormPage from './pages/ai-agent/AgentFormPage'
import LanguageToggle from './components/LanguageToggle'
import { useLanguage } from './i18n/LanguageContext'

function Home() {
  const { t } = useLanguage()
  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center gap-4 text-slate-900">
      <div className="absolute top-4 right-4">
        <LanguageToggle />
      </div>
      <h1 className="text-2xl font-semibold">Kokuk</h1>
      <p className="text-slate-500">{t('home.subtitle')}</p>
      <Link to="/client-form" className="text-blue-600 underline">
        {t('home.local')}
      </Link>
      <Link to="/ai-agent" className="text-blue-600 underline">
        {t('home.live')}
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
