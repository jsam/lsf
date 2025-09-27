import Card from '../components/ui/Card'

function Dashboard() {
  return (
    <div className="dashboard-container">
      <h1 className="page-title">Dashboard</h1>
      <Card title="System Overview">
        <p>System overview and health status</p>
      </Card>
    </div>
  )
}

export default Dashboard