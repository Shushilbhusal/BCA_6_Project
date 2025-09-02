import React from 'react'
import { useAuth } from '../context/authContext'
import { useNavigate } from 'react-router'
function Logout() {
    const navigate = useNavigate();
    const { logout } = useAuth();
    logout();
    navigate('/login')
    
  return (
    <div>Logout</div>
  )
}

export default Logout