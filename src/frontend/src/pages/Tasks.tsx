import Card from '../components/ui/Card'
import Button from '../components/ui/Button'

function Tasks() {
  return (
    <div className="tasks-container">
      <h1 className="page-title">Tasks</h1>
      <Card
        title="Task Management"
        actions={
          <Button variant="primary" size="small">
            Refresh
          </Button>
        }
      >
        <p>Celery task monitoring and management</p>
      </Card>
    </div>
  )
}

export default Tasks