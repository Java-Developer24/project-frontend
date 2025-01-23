import { BrowserRouter as Router } from "react-router-dom";

import React from "react";
import ReactDOM from "react-dom/client";
import App from "@/App.jsx";
import "@/index.css";
import { AuthProvider } from "./utils/AppContext";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { Toaster } from "react-hot-toast";

ReactDOM.createRoot(document.getElementById("root")).render(
  
  <GoogleOAuthProvider clientId="74486074672-jq8gtjssidki6epdg4v2ddm25nd42kl1.apps.googleusercontent.com">
    <React.StrictMode>
      
      <AuthProvider>
      <Toaster position="top-right" />
        <App />
      </AuthProvider>
    </React.StrictMode>
  </GoogleOAuthProvider>
);
