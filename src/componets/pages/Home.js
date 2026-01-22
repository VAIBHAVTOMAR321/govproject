import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import Login from '../all_login/Login'

function Home() {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // If user is already authenticated, redirect to Dashboard
    if (!isLoading && isAuthenticated) {
      navigate('/Dashboard', { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  return (
    <div>
        <Login />
    </div>
  )
}

export default Home