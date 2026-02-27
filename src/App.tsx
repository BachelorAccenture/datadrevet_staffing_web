import './global.css'
import { Routes, Route, Navigate } from 'react-router-dom'
import Sidebar from './components/sidebar/sidebar.tsx'
import SearchPage from './components/searchPage/searchPage.tsx'
import KonsulenterPage from './components/consultantPage/consultantPage.tsx'
import EditConsultant from './components/editConsultant/editConsultant.tsx'
import AddConsultant from './components/addConsultant/addConsultant.tsx'
import GraphPage from './components/graphPage/graphPage.tsx'

function App() {
  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <Routes>
          <Route path="/staffing" element={<SearchPage />} />
          <Route path="/konsulenter" element={<KonsulenterPage />} />
          <Route path="/konsulenter/edit/:id" element={<EditConsultant />} />
          <Route path="/konsulenter/add" element={<AddConsultant />} />
          <Route path="/graph" element={<GraphPage />} />
            <Route path="*" element={<Navigate to="/staffing" />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
