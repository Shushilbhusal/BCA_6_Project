import React from 'react'
import Sidebar from './sidebar'
import { Outlet } from 'react-router'

function Dashboard() {
  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      {/* Sidebar */}
      <div className="w-full md:w-1/4 shadow-md">
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="w-full md:w-3/4 bg min-h-screen ">
        <Outlet />
      </div>
    </div>
  )
}

export default Dashboard
