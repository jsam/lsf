import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import AdminLayout from './components/layout/AdminLayout'
import Dashboard from './pages/Dashboard'
import Tasks from './pages/Tasks'

function App() {
  return (
    <Router>
      <AdminLayout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/tasks" element={<Tasks />} />
        </Routes>
      </AdminLayout>
    </Router>
  )
}

export default App