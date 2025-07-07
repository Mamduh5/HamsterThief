// src/api/auth.js

// This is a placeholder for your actual API endpoint.
// Replace 'https://your-backend-api.com' with the base URL of your backend.
const API_BASE_URL = 'localhost:5003/api/v1/user/token/login'; 

/**
 * Handles user login by sending credentials to the backend API.
 * @param {string} email - The user's email address.
 * @param {string} password - The user's password.
 * @returns {Promise<Object>} - A promise that resolves with the API response data (e.g., a token).
 * @throws {Error} - Throws an error if the login fails (e.g., invalid credentials, network error).
 */
export const loginUser = async (email, password) => {
  try {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    // Check if the response was successful (status code 2xx)
    if (!response.ok) {
      let errorMessage = 'Login failed. Please try again.';
      try {
        const errorData = await response.json();
        // If the API sends a specific error message, use it
        if (errorData && errorData.message) {
          errorMessage = errorData.message;
        } else if (response.status === 401) {
          errorMessage = 'Invalid email or password.';
        } else if (response.status === 404) {
          errorMessage = 'API endpoint not found.';
        }
      } catch (jsonError) {
        // Fallback if the error response is not JSON
        errorMessage = `Server error: ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }

    // Parse the JSON response from the server
    const data = await response.json();
    return data; // This should contain your authentication token or user data
  } catch (error) {
    // Log the error for debugging purposes
    console.error('API login error:', error);
    // Re-throw the error to be handled by the calling component
    throw error;
  }
};

/**
 * Simulates user logout by clearing the authentication token.
 * In a real application, you might also call a backend logout endpoint.
 */
export const logoutUser = () => {
  localStorage.removeItem('authToken'); // Remove the stored token
  // If you have other session-related data, clear them here too
  console.log('User logged out.');
};

// You can add other authentication-related API calls here, e.g., register, forgot password, etc.
