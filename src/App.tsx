import { Route, Routes } from 'react-router-dom'
import ClientFormPage from './pages/client-form/ClientFormPage'
import AgentFormPage from './pages/ai-agent/AgentFormPage'
import WorkspaceLayout from './pages/workspace/WorkspaceLayout'
import StartPage from './pages/workspace/StartPage'
import HomePage from './pages/workspace/HomePage'
import EstimateRequestsPage from './pages/workspace/EstimateRequestsPage'
import PaymentPage from './pages/workspace/PaymentPage'
import PortfolioDetailPage from './pages/workspace/PortfolioDetailPage'
import InquiryBranchPage from './pages/workspace/InquiryBranchPage'
import CreateInquiryPage from './pages/workspace/CreateInquiryPage'
import RecommendPage from './pages/workspace/RecommendPage'
import TrendReportPage from './pages/workspace/TrendReportPage'
import InternalMatcherTestPage from './pages/internal-matcher-test/InternalMatcherTestPage'

function App() {
  return (
    <Routes>
      {/* 브랜드부스트 워크스페이스 클론 */}
      <Route element={<WorkspaceLayout />}>
        <Route path="/" element={<StartPage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/estimate-requests" element={<EstimateRequestsPage />} />
        <Route path="/payment" element={<PaymentPage />} />
        <Route path="/portfolio/:id" element={<PortfolioDetailPage />} />
      </Route>
      <Route path="/inquiry" element={<InquiryBranchPage />} />
      <Route path="/inquiry/recommend" element={<RecommendPage />} />
      <Route path="/inquiry/report" element={<TrendReportPage />} />
      <Route path="/estimate-requests/create" element={<CreateInquiryPage />} />

      {/* 기존 팀 프로토타입 */}
      <Route path="/client-form/*" element={<ClientFormPage />} />
      <Route path="/ai-agent/*" element={<AgentFormPage />} />

      {/* Internal historical matcher — standalone test page, not linked from any nav */}
      <Route path="/internal-matcher-test" element={<InternalMatcherTestPage />} />
    </Routes>
  )
}

export default App
