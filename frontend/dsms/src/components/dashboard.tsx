import React from 'react'
import Sidebar from './sidebar'
import { Outlet } from 'react-router'

function Dashboard() {
  return (
    <div className='flex'>
        <div className='w-1/4'>
            <Sidebar/>
        </div>
        <div className='w-3/4 bg-amber-100 h-screen'>
            <Outlet />
        </div>
    </div>
  )
}

export default Dashboard