import { createContext, useState, useEffect, useRef } from "react";
import { jwtDecode } from "jwt-decode"; // Correct import without curly braces
import axios from "axios";
import { Navigate } from "react-router-dom";

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
  const hasFetchedServiceData = useRef(false); // Prevent duplicate `fetchServiceData` calls

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
      Navigate("/login");
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
      console.error("Error fetching user data:", error.response?.data?.error);
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
  const fetchServiceData = async (userId = null) => {
    if (maintainance) return; // Prevent fetching if in maintenance mode
    if (hasFetchedServiceData.current) return; // Prevent duplicate API calls
    try {
      setLoadingServiceData(true);
      hasFetchedServiceData.current = true; // Mark as fetched
  
      const response = await axios.get(
        `/api/service/get-service-server-data${userId ? `?userId=${userId}` : ""}`
      );
  
      setServiceData(response.data);
    } catch (error) {
      console.error("Error fetching service data:", error.response?.data?.error);
    } finally {
      setLoadingServiceData(false);
    }
  };
  
  useEffect(() => {
    // Only call fetchServiceData when the maintenance mode changes
    if (!maintainance && !hasFetchedServiceData.current) {
      fetchServiceData();
    }
  }, [maintainance]); // Re-run when maintenance state changes
  
  useEffect(() => {
    if (token) {
      const decodedToken = jwtDecode(token);
      const userId = decodedToken.id;
      const googleId = decodedToken.id; // Handle Google login ID if available
  
      validateToken(token).then((user) => {
        if (user) {
          setUser(user); // Ensure user state is set before fetching data
          console.log(decodedToken.logintype === "google")
          console.log(decodedToken.logintype)

          setIsGoogleLogin(decodedToken.logintype === "google");
          setGoogleId(googleId); // Store Google ID for future use
  
          const userIdOrGoogleId = googleId || userId;
  
          fetchUserData(userIdOrGoogleId).then((newApiKey) => {
            if (newApiKey) {
              fetchBalance(newApiKey); // Fetch balance only after apiKey is set
            }
          });
  
          // Fetch service data only if NOT in maintenance mode
          if (!maintainance) {
            fetchServiceData(userIdOrGoogleId);
          }
        } else {
          handleLoggedOutState();
        }
      });
    } else {
      handleLoggedOutState();
    }
  }, [token, maintainance]); // Re-run when token or maintenance state changes
  
  const handleLoggedOutState = () => {
    setUser(null);
    setIsGoogleLogin(false);
    if (!maintainance) {
      fetchServiceData(); // Fetch data for logged-out users only if NOT in maintenance mode
    }
  };
  
  const login = (token) => {
    const decodedToken = jwtDecode(token);
    const userId = decodedToken.id;
    const googleId = decodedToken.googleId;
  
    validateToken(token).then((user) => {
      if (user) {
        localStorage.setItem("paidsms-token", token);
        setToken(token);
        setUser(user);
        setIsGoogleLogin(user.logintype === "google");
        setGoogleId(googleId);
  
        const userIdOrGoogleId = googleId || userId;
  
        fetchUserData(userIdOrGoogleId).then((newApiKey) => {
          if (newApiKey) {
            fetchBalance(newApiKey);
          }
        });
  
        // Avoid calling fetchServiceData here as it's handled in HomeWrapper
      }
    });
  };
  
  const logout = () => {
    localStorage.removeItem("paidsms-token");
    setToken(null);
    setUser(null);
    setApiKey(null);
    setBalance(null);
    setIsGoogleLogin(false);
    setGoogleId(null);
    hasFetchedServiceData.current = false; // Allow fetching service data again on logout
    // Do not call fetchServiceData here either
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
        serviceData,
        loadingServiceData,
        isGoogleLogin,
        googleId,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
