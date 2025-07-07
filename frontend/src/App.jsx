// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/Dashboard';

// This is a simple PrivateRoute component to protect routes
const PrivateRoute = ({ children }) => {
  // Check if an authentication token exists in localStorage
  const isAuthenticated = localStorage.getItem('authToken');
  // If authenticated, render the children (the protected component)
  // Otherwise, redirect to the login page
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
    // BrowserRouter enables client-side routing
    <Router>
      {/* Routes define the different paths in your application */}
      <Routes>
        {/* Public route for the login page */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected route for the dashboard */}
        {/* The DashboardPage will only render if PrivateRoute allows it */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <DashboardPage />
            </PrivateRoute>
          }
        />

        {/* Redirect any other path to the login page by default */}
        {/* You can change this to a home page or 404 page as needed */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
