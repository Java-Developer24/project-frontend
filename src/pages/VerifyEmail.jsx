import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { AuthContext } from "@/utils/AppContext";

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [message, setMessage] = useState("Verifying your email...");
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        if (!token) {
          setMessage("No token provided. Please check the verification link.");
          toast.error("Invalid verification link.");
          setIsLoading(false);
          return;
        }

        const response = await fetch(
          `https://project-backend-xo17.onrender.com/api/auth/verify-email?token=${token}`,
          { method: "GET" }
        );

        const data = await response.json();

        if (response.ok) {
          setMessage("Email verified successfully! Redirecting...");
          toast.success(data.message || "Your email has been successfully verified.");

          if (data.jwtToken) {
            login(data.jwtToken);
            setTimeout(() => navigate("/"), 3000);
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

    verifyEmail();
  }, [token, navigate, login]);

  return (
    <div className="h-[calc(100dvh-4rem)] flex items-center justify-center bg-black text-white">
      <div className="bg-[#121315] p-8 rounded-xl shadow-lg max-w-md w-full text-center border border-[#1b1d21] animate-in fade-in-0 slide-in-from-bottom-4 duration-700">
        <h1 className="text-2xl font-bold mb-4 text-primary animate-in slide-in-from-left duration-700">
          Email Verification
        </h1>
        {isLoading ? (
          <div className="flex flex-col items-center animate-in fade-in-0 duration-700">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-primary border-opacity-50 mb-4"></div>
            <p className="text-gray-400">Please wait while we verify your email...</p>
          </div>
        ) : (
          <p className="text-gray-400 font-medium animate-in fade-in-0 duration-700">{message}</p>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;