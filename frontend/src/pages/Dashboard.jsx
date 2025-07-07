// src/components/DashboardPage.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, User } from 'lucide-react';
import { logoutUser } from '../services/auth'; // Import the logoutUser function

const DashboardPage = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState('Guest'); // State for user name

  useEffect(() => {
    // In a real app, you might fetch user details using the token
    // For this demo, we'll just set a placeholder name
    const token = localStorage.getItem('authToken');
    if (token) {
      // Decode JWT or fetch user data based on your token structure
      // For simplicity, let's assume a dummy user name for the demo
      setUserName('Authenticated User'); 
    }
  }, []);

  const handleLogout = () => {
    logoutUser(); // Call the logout function from your API service
    navigate('/login'); // Redirect to the login page after logout
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center p-4 font-inter">
      <div className="w-full max-w-md text-center bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <div className="bg-gradient-to-r from-green-600 to-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
          <User className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Welcome, {userName}!</h1>
        <p className="text-gray-600 mb-8">
          This is your protected dashboard. You can only see this if you are logged in.
        </p>
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center py-3 px-4 rounded-lg text-white font-medium transition-all duration-200 
                     bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg"
        >
          <LogOut className="w-5 h-5 mr-2" />
          Logout
        </button>
      </div>
    </div>
  );
};

export default DashboardPage;
