import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom"; // Ensure correct import
import toast from "react-hot-toast";
import { AuthContext } from "@/utils/AppContext";

const VerifyEmail = () => {
  const [searchParams] = useSearchParams(); // For extracting the token from the URL
  const token = searchParams.get("token");

  const [message, setMessage] = useState("Verifying your email...");
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        // Check if token exists
        if (!token) {
          setMessage("No token provided. Please check the verification link.");
          toast.error("Invalid verification link.");
          setIsLoading(false);
          return;
        }

        // API call to verify email
        const response = await fetch(
          `http://localhost:3000/api/auth/verify-email?token=${token}`,
          { method: "GET" }
        );

        const data = await response.json();
        console.log(data)

        if (response.ok) {
          setMessage("Email verified successfully! Redirecting...");
          toast.success(data.message || "Your email has been successfully verified.");

          // Automatically log in the user
          if (data.jwtToken) {
            login(data.jwtToken);
            setTimeout(() => navigate("/"), 3000); // Redirect after success
          }
        } else {
          setMessage(data.message || "Invalid or expired token. Please try again.");
          toast.error(data.message || "Failed to verify email.");
        }
      } catch (error) {
        setMessage("An unexpected error occurred. Please try again later.");
        toast.error("An unexpected error occurred.");
      } finally {
        setIsLoading(false);
      }
    };

    verifyEmail(); // Trigger email verification
  }, [token, navigate, login]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-indigo-500 to-blue-500 text-white">
      <div className="bg-white text-gray-800 p-8 rounded-xl shadow-md max-w-md w-full text-center">
        <h1 className="text-2xl font-bold mb-4 text-indigo-600">
          Email Verification
        </h1>
        {isLoading ? (
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-indigo-600 border-opacity-50 mb-4"></div>
            <p className="text-gray-700">Please wait while we verify your email...</p>
          </div>
        ) : (
          <p className="text-gray-700 font-medium">{message}</p>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
