import { createContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode"; // Correct import without curly braces
import axios from "axios";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(undefined); // Start with `undefined` for loading state
  const [apiKey, setApiKey] = useState(null);
  const [balance, setBalance] = useState(null);
  const [maintainance, setMaintainance] = useState(null);
  const [serviceData, setServiceData] = useState([]); // Add serviceData state
  const [loadingServiceData, setLoadingServiceData] = useState(true); // Add loading state for service data
  const [isGoogleLogin, setIsGoogleLogin] = useState(false); // New state for Google login
  const [googleId, setGoogleId] = useState(null); // State for Google ID
  const [token, setToken] = useState(localStorage.getItem("paidsms-token")); // Store token in state

  // Function to validate the token by calling the backend
  const validateToken = async (token) => {
    try {
      const response = await axios.post(
        "/api/auth/validateToken",
        {}, // Empty body
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log(response.data);
      return response.data; // Returns user data if the token is valid
    } catch (error) {
      console.error("Token validation failed:", error.response?.data?.message);
      localStorage.removeItem("paidsms-token");
      return null;
    }
  };

  const fetchUserData = async (userIdOrGoogleId) => {
    try {
      const apiKeyResponse = await axios.get(`/api/user/user-data?userId=${userIdOrGoogleId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const newApiKey = apiKeyResponse.data.apiKey;
      setApiKey(newApiKey);
      setUser(apiKeyResponse.data);
      return newApiKey; // Return the new apiKey for dependent calls
    } catch (error) {
      console.log(error.response?.data?.error);
      return null; // Return null if API call fails
    }
  };

  const fetchBalance = async (apiKey) => {
    if (!apiKey) return; // Prevent null or undefined API calls
    try {
      const balanceResponse = await axios.get(`/api/user/balance?api_key=${apiKey}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      setBalance(balanceResponse.data.balance);
    } catch (error) {
      console.error("Error fetching balance:", error.response?.data?.error);
    }
  };

  const fetchServiceData = async () => {
    try {
      setLoadingServiceData(true);
      const response = await axios.get("/api/service/getServices");
      setServiceData(response.data);
    } catch (error) {
      console.error("Error fetching service data:", error.response?.data?.error);
    } finally {
      setLoadingServiceData(false);
    }
  };

  useEffect(() => {
    // Fetch service data for logged-out users on initial load
    fetchServiceData();
  }, []);

  useEffect(() => {
    if (token) {
      // Decode the token to extract user information
      const decodedToken = jwtDecode(token);
      const userId = decodedToken.id;
      const googleId = decodedToken.id; // Handle Google login ID if available
  
      // Validate the token against the backend
      validateToken(token).then((user) => {
        if (user) {
          // Token is valid
          setUser(user); // Ensure user state is set before fetching data
          setIsGoogleLogin(user.logintype === "google");
          setGoogleId(googleId); // Store Google ID for future use
  
          // Fetch user data and balance after token is validated
          const userIdOrGoogleId = googleId || userId;
          fetchUserData(userIdOrGoogleId).then((newApiKey) => {
            if (newApiKey) {
              fetchBalance(newApiKey); // Fetch balance only after apiKey is set
            }
          });
  
          // Optionally fetch service data if needed
          fetchServiceData();
        } else {
          // Token validation failed, handle logged-out state
          handleLoggedOutState();
        }
      });
    } else {
      // No token found, handle logged-out state
      handleLoggedOutState();
    }
  }, [token]); // Re-run when token changes

  // Helper function to handle logged-out state
  const handleLoggedOutState = () => {
    setUser(null);
    setIsGoogleLogin(false);
    fetchServiceData();
  };

  const login = (token) => {
    const decodedToken = jwtDecode(token);
    const userId = decodedToken.id;
    const googleId = decodedToken.googleId; // Handle Google login ID
  
    validateToken(token).then((user) => {
      if (user) {
        localStorage.setItem("paidsms-token", token);
        setToken(token); // Store token in state
        setUser(user);
        setIsGoogleLogin(user.logintype === "google");
        setGoogleId(googleId);
  
        // Fetch user data and balance after login
        const userIdOrGoogleId = googleId || userId;
        fetchUserData(userIdOrGoogleId).then((newApiKey) => {
          if (newApiKey) {
            fetchBalance(newApiKey); // Fetch balance only after apiKey is set
          }
        });
  
        // Optionally fetch service data after login
        fetchServiceData();
      } else {
        // Handle token validation failure if needed
      }
    });
  };
  
  const logout = () => {
    localStorage.removeItem("paidsms-token");
    setToken(null); // Clear token from state
    setUser(null);
    setApiKey(null);
    setBalance(null);
    setIsGoogleLogin(false); // Reset Google login state
    setGoogleId(null); // Reset Google ID
    fetchServiceData(); // Fetch data for logged-out user
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        apiKey,
        setApiKey,
        setBalance,
        balance,
        login,
        logout,
        fetchBalance,
        maintainance,
        setMaintainance,
        serviceData, // Provide service data to the context consumers
        loadingServiceData, // Provide loading state for service data
        isGoogleLogin, // Provide Google login state to context consumers
        googleId, // Provide Google ID to the context consumers
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
