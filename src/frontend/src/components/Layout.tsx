import { Link } from 'react-router-dom'

interface LayoutProps {
  children: React.ReactNode
}

function Layout({ children }: LayoutProps) {
  return (
    <div style={{ minHeight: '100vh', fontFamily: 'system-ui' }}>
      <nav style={{
        padding: '1rem',
        borderBottom: '1px solid #ccc',
        backgroundColor: '#f5f5f5'
      }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <h2 style={{ margin: 0 }}>Django Celery App</h2>
          <Link to="/" style={{ textDecoration: 'none', color: '#0066cc' }}>
            Dashboard
          </Link>
          <Link to="/tasks" style={{ textDecoration: 'none', color: '#0066cc' }}>
            Tasks
          </Link>
        </div>
      </nav>
      <main style={{ padding: '2rem' }}>
        {children}
      </main>
    </div>
  )
}

export default Layout