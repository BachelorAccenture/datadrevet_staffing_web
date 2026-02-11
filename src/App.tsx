import './global.css'
import { Routes, Route, Navigate } from 'react-router-dom'
import Sidebar from './components/sidebar/sidebar.tsx'
import SearchPage from './components/searchPage/searchPage.tsx'
import KonsulenterPage from './components/konsulenterPage/konsulenterPage.tsx'

function App() {
  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <Routes>
          <Route path="/staffing" element={<SearchPage />} />
          <Route path="/konsulenter" element={<KonsulenterPage />} />
          <Route path="*" element={<Navigate to="/staffing" />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
