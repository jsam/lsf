import React, { useState } from 'react'
import Sidebar from './Sidebar'
import Header from './Header'
import MainContent from './MainContent'
import '../../styles/variables.css'
import '../../styles/layout.css'
import '../../styles/components.css'

export interface AdminLayoutProps {
  children: React.ReactNode
  sidebarCollapsed?: boolean
  onSidebarToggle?: (collapsed: boolean) => void
}

const AdminLayout: React.FC<AdminLayoutProps> = ({
  children,
  sidebarCollapsed: controlledCollapsed,
  onSidebarToggle
}) => {
  const [internalCollapsed, setInternalCollapsed] = useState(false)

  // Use controlled state if provided, otherwise use internal state
  const isCollapsed = controlledCollapsed !== undefined ? controlledCollapsed : internalCollapsed

  const handleToggle = () => {
    if (onSidebarToggle) {
      onSidebarToggle(!isCollapsed)
    } else {
      setInternalCollapsed(!internalCollapsed)
    }
  }

  return (
    <div className={`layout-container ${isCollapsed ? 'sidebar-collapsed' : ''}`}>
      <Sidebar
        collapsed={isCollapsed}
        onToggle={handleToggle}
      />
      <Header
        onSidebarToggle={handleToggle}
        sidebarCollapsed={isCollapsed}
      />
      <MainContent>
        {children}
      </MainContent>
    </div>
  )
}

export default AdminLayout