// src/service/auth.js

// IMPORTANT: Replace 'http://localhost:5003' with your actual backend URL.
const API_BASE_URL = 'http://localhost:5003'; 

// These are the FIXED Basic Auth credentials your backend expects for the client.
// In a real application, these should NOT be hardcoded like this in client-side code.
// Consider using environment variables (e.g., import.meta.env.VITE_AUTH_USERNAME in Vite)
// or a backend proxy for production security.
const AUTH_USERNAME = 'Xr@7Lp#Nz2Qf^MaVi*TcBdYwKe'; // Your fixed AUTHUSERNAME
const AUTH_Password = 'mZ#7Lt!Yq@Vx2Np^FgRs*Bw9KU&eToChMiD'; // Your fixed AUTHPassword
const lang = 'th'
const platform = 'WEB'

/**
 * Handles user login. This function now sends TWO sets of credentials:
 * 1. Fixed AUTH_USERNAME/AUTH_Password in the Basic Authorization header (for backend's basicAuth(ctx.req)).
 * 2. User-provided Email/Password in the JSON request body (for actual user authentication).
 * * @param {string} Email - The user's Email address entered in the form.
 * @param {string} Password - The user's Password entered in the form.
 * @returns {Promise<Object>} - A promise that resolves with the API response data (e.g., a token).
 * @throws {Error} - Throws an error if the login fails.
 */
export const loginUser = async (Email, Password) => {
  try {
    // 1. Create the string for the FIXED Basic Auth credentials
    const fixedCredentials = `${AUTH_USERNAME}:${AUTH_Password}`;

    // 2. Base64 encode the fixed credentials string
    const encodedFixedCredentials = btoa(fixedCredentials);

    const response = await fetch(`${API_BASE_URL}/api/v1/user/token/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'accept-language': lang,
        'x-platform': platform,

        // 3. Add the Authorization header with the FIXED Basic Auth credentials.
        // This is what your backend's `basicAuth(ctx.req)` will read.
        'Authorization': `Basic ${encodedFixedCredentials}` 
      },
      // 4. Send the user's actual Email and Password in the request body.
      // Your backend will likely use these to verify the user against its database.
      body: JSON.stringify({ Email, Password }), 
    });

    if (!response.ok) {
      let errorMessage = 'Login failed. Please try again.';
      try {
        const errorData = await response.json();
        if (errorData && errorData.message) {
          errorMessage = errorData.message;
        } else if (response.status === 401) {
          // This 401 could be due to invalid fixed basic auth OR invalid user credentials
          errorMessage = 'Authentication failed. Please check your credentials.';
        } else if (response.status === 404) {
          errorMessage = 'API endpoint not found.';
        }
      } catch (jsonError) {
        errorMessage = `Server error: ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    return data; 
  } catch (error) {
    console.error('API login error:', error);
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

// You can add other authentication-related API calls here, e.g., register, forgot Password, etc.
