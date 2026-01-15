// src/components/ProtectedRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Spinner from 'react-bootstrap/Spinner'; // Using a Bootstrap spinner for loading


const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) {
    // Show a loading spinner while checking authentication status
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }
  // If not authenticated, redirect to the home page ("/")
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  // If authenticated, render the child components (the protected page)
  return children;
};

export default ProtectedRoute;