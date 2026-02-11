import './global.css'
import { Routes, Route, Navigate, useParams } from 'react-router-dom'
import Sidebar from './components/sidebar/sidebar.tsx'
import SearchPage from './components/searchPage/searchPage.tsx'
import KonsulenterPage from './components/konsulenterPage/konsulenterPage.tsx'
import EditConsultant from './components/editConsultant/editConsultant.tsx'
import AddConsultant from './components/addConsultant/addConsultant.tsx'
import { mockKonsulenter } from './data/mockData.ts'

/**
 * BACKEND: Wrapper-komponenten EditConsultantWrapper 
 * kan fjernes når EditConsultant henter konsulenten 
 * selv via API basert på useParams().
 */
const EditConsultantWrapper = () => {
  const { id } = useParams()
  const konsulent = mockKonsulenter.find(k => k.id === Number(id))
  if (!konsulent) return <p style={{ textAlign: 'center', marginTop: '2em' }}>Konsulent ikke funnet.</p>
  return <EditConsultant konsulent={konsulent} />
}

function App() {
  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <Routes>
          <Route path="/staffing" element={<SearchPage />} />
          <Route path="/konsulenter" element={<KonsulenterPage />} />
          <Route path="/konsulenter/edit/:id" element={<EditConsultantWrapper />} />
          <Route path="/konsulenter/add" element={<AddConsultant />} />
          <Route path="*" element={<Navigate to="/staffing" />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
