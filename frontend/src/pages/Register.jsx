// src/components/LoginPage.jsx
import React, { useState } from 'react';
import { Eye, EyeOff, Lock, Mail, LogIn } from 'lucide-react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate for redirection
import { loginUser } from '../services/auth'; // Import the loginUser function from your API service
import { Button } from '../components/buttons/button';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    Email: '',
    Password: ''
  });


  return (
    <div className="min-h-screen from-blue-50 via-white to-purple-50 flex items-center justify-center p-4 font-inter bg-[url(/test1.png)] bg-auto bg-center bg-no-repeat">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
          {/* <div className="bg-[url(/test1.png)] bg-auto bg-center bg-no-repeat size-[1024px]"></div> */}

        <div className="text-center mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
          <p className="text-gray-600">Please sign in to your account</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <div className="space-y-6">
            {/* Email Field */}
            <div>
              <label htmlFor="Email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="Email"
                  id="Email"
                  name="Email"
                  value={formData.Email}
                  className={`w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 `}
                  placeholder="Enter your Email"
                  aria-describedby="Email-error"
                />
              </div>

            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="Password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="Password"
                  name="Password"
                  value={formData.Password}
                  className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 `}
                  placeholder="Enter your Password"
                  aria-describedby="Password-error"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                >
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-600">Remember me</span>
              </label>
              <a
                href="#"
                className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
              >
                Forgot Password?
              </a>
            </div>

            {/* Submit Button */}
            <Button Name={"ตกลง"} />
          </div>


          {/* Sign Up Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <a
                href="#"
                className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
              >
                Sign up here
              </a>
            </p>
          </div>
        </div>

        {/* Demo Info */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            This is a demo login page. Replace `YOUR_API_ENDPOINT` in `src/api/auth.js` with your actual backend API URL.
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
